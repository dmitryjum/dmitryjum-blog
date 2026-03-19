---
title: "How I stopped random timeouts from breaking a background job"
excerpt: "A gym's membership migration kept failing intermittently. Here's the three-layer approach that made the integration actually reliable."
date: "2026-01-11T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: 
tags: ["Ruby", "Rails", "swing_bridge"]
---

This project started with a very practical need from a gym owner: move eligible members from one vendor to another without staff doing manual data entry. I built a Rails API bridge that checks membership status in ABC Financial and then creates or updates the matching client in Mindbody.

At first everything was smooth. Then the upstream API started timing out — not always, not predictably. One job would succeed, the next would fail, same run. That's the worst kind of failure to debug: it's not broken, it's just unreliable.

Here's what I did about it, in three layers.

---

## Step 1: give the HTTP client room to breathe

I already had a small Faraday wrapper for consistency. The defaults were fine for web requests, but not for a background integration that talks to a third-party API all day.

```ruby
class HttpClient
  def initialize(base_url:, default_headers: {}, timeout: 12, open_timeout: 5)
    @conn = Faraday.new(
      url: base_url,
      headers: default_headers
    ) do |f|
      f.request  :json
      f.response :json, content_type: /\bjson$/
      f.adapter Faraday.default_adapter
    end
    @conn.options.timeout = timeout
    @conn.options.open_timeout = open_timeout
  end
end
```

Two lines make the biggest difference:

- `@conn.options.timeout` controls total time for a request (slow upstreams need patience).
- `@conn.options.open_timeout` controls how long to wait for a connection to be established.

In the Mindbody client, I used longer values on purpose:

```ruby
@http = HttpClient.new(base_url: base, timeout: 60, open_timeout: 10)
```

That reduced random failures, but didn't eliminate them.

---

## Step 2: retries, but only for safe calls

The next failure pattern was revealing. A request would time out, the next one in the same job would succeed. That's a perfect case for retries — but only for **GET** requests that are safe to repeat.

Inside `MindbodyClient`, I added exponential backoff for GET calls:

```ruby
GET_RETRY_ATTEMPTS = 2
GET_RETRY_BASE_SLEEP = 0.5

def request(method:, path:, params: nil, body: nil, headers: nil, error_label: nil)
  request_args = { headers: headers || auth_headers }
  request_args[:params] = params unless params.nil?
  request_args[:body]   = body unless body.nil?

  retries = 0
  begin
    res = @http.public_send(method, path, **request_args)
  rescue Faraday::TimeoutError, Faraday::ConnectionFailed
    if method == :get && retries < GET_RETRY_ATTEMPTS
      retries += 1
      sleep(GET_RETRY_BASE_SLEEP * (2 ** (retries - 1)))
      retry
    end
    raise
  end
  # ...
end
```

A few details matter here:

- `method == :get` limits retries to idempotent requests. I'm not retrying POSTs.
- `GET_RETRY_BASE_SLEEP * (2 ** (retries - 1))` is simple exponential backoff.
- `raise` after retries ensures failures don't get silently swallowed.

---

## Step 3: job-level backoff for true transient failures

Even with client-level retries, I wanted the job queue to be the final safety net. If something fails transient-style, it should retry with backoff rather than silently disappear.

In `MindbodyAddClientJob` I added explicit retry behavior for network-level issues:

```ruby
RETRYABLE_ERRORS = [ Faraday::TimeoutError, Faraday::ConnectionFailed ].freeze

retry_on(*RETRYABLE_ERRORS, wait: ->(executions) { (5 * (2 ** (executions - 1))).seconds }, attempts: 3) do |job, error|
  args = job.arguments.first.is_a?(Hash) ? job.arguments.first : {}
  attempt_id = args[:intake_attempt_id] || args["intake_attempt_id"]
  attempt = IntakeAttempt.find_by(id: attempt_id) if attempt_id

  Rails.logger.error("[MindbodyAddClientJob] #{error.class}: #{error.message}")
  attempt&.update!(status: :mb_failed, error_message: error.message)
  AdminMailer.mindbody_failure(attempt, error).deliver_later
end
```

The `retry_on` block does two things: it backs off exponentially so retries don't hammer the API, and it still records the failure and emails admins. Every retry is observable.

Inside the job itself, I re-raise transient errors explicitly so the retry system picks them up:

```ruby
rescue => e
  if RETRYABLE_ERRORS.any? { |klass| e.is_a?(klass) }
    Rails.logger.warn("[MindbodyAddClientJob] Transient error: #{e.class}: #{e.message}")
    raise
  end
  # ...
end
```

---

## What actually changed

Once these three layers were in place, the random timeout failures stopped being random. Safe GETs recovered quietly. Anything that did fail left a trace in the DB and sent an email. The integration went from "check the logs and hope" to something I could actually trust.

Tighter timeouts and a retry block aren't enough on their own. It's the combination — HTTP-level patience, client-level retry for safe reads, job-level backoff for everything else — that makes the difference.

---

The full source for this project is on GitHub: [github.com/dmitryjum/swing_bridge](https://github.com/dmitryjum/swing_bridge)
