---
title: "Rate limiting without Redis: Rack::Attack with Solid Cache"
excerpt: "Most Rack::Attack tutorials assume you have Redis. I didn't want Redis. Here's how I wired it up with Solid Cache instead, and the one boot-order gotcha that tripped me up."
date: "2026-01-23T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: 
tags: ["swing_bridge", "Rails", "Rack::Attack", "Solid Cache"]
---

The standard Rack::Attack setup assumes Redis. Nearly every tutorial goes: add the gem, point it at Redis, define your throttles, done.

I didn't want Redis. The app runs on a single Postgres database, the load is low, and adding a separate cache server just for rate limiting felt like overkill. Solid Cache — backed by whatever DB you're already running — was already available. It made sense to use it.

It almost just worked.

---

## The basic setup

Rack::Attack needs a cache store. By default it uses `Rails.cache`, so if you've already configured Solid Cache, you'd think you were done:

```ruby
# config/environments/production.rb
config.cache_store = :solid_cache_store
```

And the throttles themselves are straightforward:

```ruby
Rack::Attack.throttle("intakes/ip", limit: 30, period: 1.minute) do |req|
  req.ip if req.path == "/api/v1/intakes" && req.post?
end

Rack::Attack.throttle("intakes/email", limit: 5, period: 1.minute) do |req|
  next unless req.path == "/api/v1/intakes" && req.post?
  params = Rack::Request.new(req.env).params
  email = params.dig("credentials", "email").to_s.downcase
  email if email.present?
end
```

Throttling by both IP and email matters here. IP-only is easy to work around with different IPs. Email-only doesn't protect you from someone registering a new address for each attempt. Together, they cover the main abuse patterns.

The custom responder returns a clean JSON 429 with a `Retry-After` header:

```ruby
Rack::Attack.throttled_responder = lambda do |env|
  match_data = env.env["rack.attack.match_data"] || {}
  retry_after = match_data[:period].to_i
  [429, { "Content-Type" => "application/json", "Retry-After" => retry_after.to_s },
   [{ status: "rate_limited" }.to_json]]
end
```

That part works fine. The gotcha was elsewhere.

---

## The boot-order problem

When you assign `Rack::Attack.cache.store` at the top level of an initializer, it runs during app boot — before the database is necessarily ready. If Solid Cache tries to check for its table (`solid_cache_entries`) before migrations have run, you get an error at startup. In some environments, especially first deploy, the table doesn't exist yet.

The fix is to defer the assignment until after the app is fully initialized:

```ruby
def rack_attack_cache_store
  store = Rails.cache
  return store unless defined?(SolidCache::Store) && store.is_a?(SolidCache::Store)

  begin
    SolidCache::Entry  # force autoload
    return store if SolidCache::Entry.table_exists?
  rescue StandardError => e
    Rails.logger.warn("[Rack::Attack] solid cache unavailable: #{e.class}: #{e.message}")
  end

  Rails.logger.warn("[Rack::Attack] solid_cache_entries missing; using MemoryStore")
  ActiveSupport::Cache::MemoryStore.new
end

Rails.application.config.after_initialize do
  Rack::Attack.cache.store = rack_attack_cache_store
end
```

`after_initialize` runs after all initializers have completed and the app is ready. At that point, the database connection is stable and the table check is safe.

The fallback to `MemoryStore` means the app still starts and rate limiting still works in development or on a fresh deploy — it just won't persist counts across processes. That's acceptable for the scenarios where Solid Cache isn't ready.

---

## Single DB, single server — is that fine?

For this app: yes. The traffic volume doesn't come close to the limits. The requests come from a dedicated eligibility verification page that a client's business built on top of this API — a controlled, low-volume surface. If this were a high-traffic public API, I'd reconsider. But for a setup that processes maybe a few hundred requests a day, Solid Cache over Postgres is more than enough.

The other advantage: no Redis to provision, monitor, or pay for. On a lean hosting budget, that's not nothing.

---

## What the logs look like at boot

One thing I added for visibility: log lines at startup showing what the app is actually using:

```ruby
Rails.application.config.after_initialize do
  Rack::Attack.cache.store = rack_attack_cache_store
  unless Rails.env.test?
    Rails.logger.info("[Rack::Attack] cache store: #{Rack::Attack.cache.store.class}")
    Rails.logger.info("[Rack::Attack] rails cache: #{Rails.cache.class}")
  end
end
```

If you ever boot and see `MemoryStore` in the logs instead of `SolidCache::Store`, you know immediately that something is off with the cache setup. That's the kind of thing that's invisible until it matters.

---

## The short version

Rack::Attack works fine without Redis. Wire it to `Rails.cache`, use `after_initialize` to defer the assignment, and add a table existence check with a MemoryStore fallback for safety. The throttle logic itself is straightforward — the only interesting part is the boot timing.

---

The full source for this project is on GitHub: [github.com/dmitryjum/swing_bridge](https://github.com/dmitryjum/swing_bridge)
