---
title: "When Mindbody Started Timing Out: How I Made the Client Resilient"
excerpt: "A short story about a gym’s membership migration, flaky upstreams, and the exact Rails code I used to make the integration reliable."
date: "2025-01-09T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: 
---

This project started with a very practical need from a gym owner: move eligible members from one vendor to another without staff doing manual data entry. I built a Rails API bridge that checks membership status in ABC Financial and then creates or updates the matching client in Mindbody.

At first, everything was smooth. Then Mindbody started timing out — not always, not predictably. A job would succeed on one request and fail on another in the same run. That random behavior is what pushed me to build real resiliency into the client.

Here’s the story, and the exact code that stabilized it.

---

## Step 1: give the HTTP client room to breathe

I already had a small Faraday wrapper for consistency. The defaults were fine for web requests, but not for a background integration that talks to a third‑party API all day.

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
- `@conn.options.open_timeout` controls how long we wait for a connection to be established.

In the Mindbody client, I intentionally used longer values:

```ruby
@http = HttpClient.new(base_url: base, timeout: 60, open_timeout: 10) # you already have this class
```

That move reduced random failures, but didn’t eliminate them.

---

## Step 2: retries, but only for safe calls

The next failure pattern was interesting. A Mindbody request would timeout, but the next request in the same job would succeed. That’s a perfect use‑case for retries — but only for **GET** requests that are safe to repeat.

Inside `MindbodyClient`, I added a small exponential backoff for GET calls:

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

- `method == :get` keeps retries limited to idempotent requests.
- `GET_RETRY_BASE_SLEEP * (2 ** (retries - 1))` is a simple exponential backoff.
- `raise` after retries ensures we don’t silently swallow failures.

---

## Step 3: job‑level backoff for true transient failures

Even with retries in the client, I wanted the job system to be the final safety net. If something fails in a transient way, the background queue should retry with backoff.

In `MindbodyAddClientJob` I added explicit retry behavior for network‑level issues:

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

That `retry_on` block does two important things:

- It uses exponential backoff so retries don’t hammer the API.
- It still records the failure and notifies admins, so we can observe what’s happening.

And in the job itself I explicitly re‑raise transient errors so the retry system can kick in:

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

## What changed after this

Once those three layers were in place:

- The “random timeout” issue stopped being random.
- Safe GETs quietly recovered.
- Risky operations only retried in a controlled way.
- Every failure still left a trace for auditing.

It turned a fragile integration into something I could trust.

---

## Takeaway

If you’re building a third‑party integration:

- Timeouts are part of your design, not just configuration.
- Retry only where it’s safe.
- Let your job system handle backoff for true transient errors.

That mindset is what made this gym’s membership migration reliable — even when the upstream API got flaky.
