---
title: "How I made a Rails API safer for a future iOS app"
excerpt: "Atlas Obscura's API needed to be more than a set of Rails controllers. It needed predictable errors, sane account-linking rules, and tests the app team could trust."
date: "2025-09-17T12:30:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/assets/blog/atlas-obscura/ao_screen_2.png"
tags: ["Atlas Obscura", "Rails", "API"]
---

# How I made a Rails API safer for a future iOS app

An API can look fine from inside a Rails app and still be miserable to build against.

That's the trap.

If you're the only consumer, a controller that mostly works feels acceptable. Once a native app starts depending on it, "mostly works" stops being good enough fast. The client needs stable auth behavior, stable error shapes, and responses that make sense without reading server code to guess what happened.

That was part of the job at Atlas Obscura when we were building out more API support for the app.

The work wasn't flashy. It was the kind of engineering that makes another team faster and cuts down on weird debugging sessions later. I like that kind of work because it's practical. You're not building abstractions for their own sake. You're reducing ambiguity.

## The first fix was error handling

Before this cleanup, a bad API request could fail in ways that were technically correct and still annoying to consume. A validation error, a missing record, and a generic exception shouldn't all feel like random Rails accidents.

So I added a small object that turned exceptions into consistent response payloads:

```ruby
module Api::V1
  class RequestErrorHandler
    def handle_response
      case klass
      when "ActiveRecord::RecordInvalid"
        record_invalid
      when "ActiveRecord::RecordNotFound"
        record_not_found
      else
        standard_error
      end
    end
  end
end
```

That lived in a small request error handler object inside the API layer.

The important part wasn't the case statement. It was the response contract. Validation errors returned a 422 with a top-level message and a `validation_errors` object. Record lookups returned a clean 404. Everything else still failed, but in a shape the client could understand.

In the base API controller I wired that into a global rescue path:

```ruby
unless Rails.env.development?
  rescue_from StandardError, with: :render_error_response
end

def render_error_response(e)
  render RequestErrorHandler.new(e, e.class.to_s, status).handle_response
end
```

That sat in the base API controller.

This is the kind of change that pays off everywhere. Once the base contract gets better, every endpoint that raises the usual Rails exceptions gets easier to reason about.

## Then I tightened account linking and app sign-in behavior

The API also needed to behave like something a native client could actually sign into.

Atlas Obscura used an external identity provider for app flows, so the server had to do a few things well:

- reject invalid or missing app credentials consistently
- map authenticated app users back to the right AO account
- support first-time account linking without creating duplicates
- track whether the user came from iOS or Android

I don't want to publish the exact authentication plumbing, but the important engineering decision was this: auth couldn't stay as controller-by-controller improvisation. It had to become a consistent part of the API foundation, the same way error handling did.

That let feature endpoints stay simple. Routes that needed an authenticated app user could rely on the shared layer. Routes that didn't could stay public.

Simple matters here. If every controller invents its own auth logic, the app team ends up learning server quirks instead of relying on a real contract.

## The user flows mattered more than any one endpoint

What made this work useful was that it wasn't just error cleanup in isolation.

The user API had to support multiple app realities:

- creating a new AO user
- linking an existing AO account to the app identity system
- signing in an existing linked user
- tracking whether the user came from iOS or Android

The core rule set was straightforward even if the edge cases weren't:

- if a known AO user signs in through the app for the first time, link that identity instead of creating a duplicate account
- if the account is already linked, treat it as a normal sign-in
- if the identity doesn't map cleanly, fail closed
- if it's a brand-new user, create the account and record the app platform cleanly

I like this example because it shows what "API work" actually means on a product team. It isn't just CRUD. It's identity, migration paths, old accounts meeting new auth, and keeping platform metadata straight enough that the business can understand how people sign up and sign in.

There was a nice small detail in the `User` model too:

```ruby
has_many :app_platforms, dependent: :destroy do
  def touch_signin_or_add_missing!(platform:, signup_source:)
    if (exists = proxy_association.scope.find_by(platform: platform))
      exists.tap { |p| p.touch(:last_signin_at) }
    else
      bool = proxy_association.scope.exists? ? false : signup_source
      proxy_association.scope.create!(
        platform: platform, signup_source: bool, last_signin_at: Time.zone.now
      )
    end
  end
end
```

That helper lived on the `User` model.

The method name is a little dense, so here's what it really did.

Each user could have app-platform records that answered questions like:

- has this person signed in from iOS before?
- have they also used Android?
- which platform was their original signup source?
- when did they last sign in on each platform?

The method handled those rules in one place:

- if the user already had a row for that platform, just update `last_signin_at`
- if they had never used that platform, create the missing row
- if this was their first app platform ever, preserve whether it was the signup source
- if they already had some other platform on file, don't incorrectly mark the new one as their signup source

That last rule is the one I liked.

Without it, platform tracking turns sloppy fast. A user signs up on iOS, later signs in on Android, and now both rows can start looking like "the" source unless someone is deliberate about the write path. This method kept that logic out of controllers and made the data easier to trust later.

## I used tests to lock the contract down

This part mattered a lot.

If you're building API behavior for another client team, tests stop being just a backend safety net. They become a way to define what the contract actually is.

The request specs around app sign-in and account-linking flows covered the cases I cared about:

- first-time linking for an existing AO user
- normal sign-in for a linked user
- creating a brand-new user from the app identity flow
- recording the correct app platform and signup source

I covered those cases in request specs so the contract stayed explicit.

The error handler also had direct tests for the exact payload shape:

```ruby
test_response = {
  json: {
    title: "Unprocessable Entity",
    status: 422,
    details: "Email field is invalid",
    validation_errors: {"email" => "Invalid email"}
  },
  status: :unprocessable_entity
}
```

That test captured the exact payload shape I wanted the API to return.

That's what I wanted: not vague confidence, specific confidence.

## The real outcome was less ambiguity

This work didn't produce a dramatic new UI.

It produced something I care about more on teams that are trying to move quickly: fewer unknowns.

The iOS side got cleaner sign-in behavior. Errors started coming back in a shape the client could handle on purpose. User creation and account linking worked through defined paths instead of controller accidents. And future API endpoints had a better foundation than "copy whatever the last controller did."
