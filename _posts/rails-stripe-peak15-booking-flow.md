---
title: "What it takes to glue Rails, Stripe, and Peak15 together without losing bookings"
excerpt: "Trip checkout looked simple from the outside. Underneath it was a queue-driven workflow across Stripe, Rails, and a slow external CRM that needed to fail visibly instead of silently."
date: "2025-09-18T13:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/assets/blog/atlas-obscura/ao_screen_1.png"
tags: ["Atlas Obscura", "Rails"]
---

# What it takes to glue Rails, Stripe, and Peak15 together without losing bookings

Third-party integrations always look cleaner on diagrams than they do in production.

You draw three boxes. Rails. Stripe. External booking system. Then arrows.

Wild.

The real problem starts after the payment goes through and you still need all the right records to exist in all the right places without charging someone twice, dropping a booking on the floor, or leaving support to manually reconstruct what happened from logs.

At Atlas Obscura, that was part of the trip-booking world around Peak15.

What I found interesting about that work is that it wasn't "call an API." It was workflow engineering. We had to manage a sequence across our database, Stripe events, background jobs, and a CRM that was slow enough to deserve comments warning other engineers not to call it from blocking code.

## The first lesson is that the booking flow is not one action

The shape that made sense here was a staged process.

The app stored a `Peak15Booking` record locally, then moved it through a series of steps:

1. record payment completion
2. create the contact booking in Peak15
3. associate the payment with that booking in Peak15
4. notify the right people if any stage failed after retries

That separation mattered. A user payment succeeding doesn't mean the downstream booking is done. Treating those as one action is how teams end up with hidden failures.

The async chain made that explicit:

```ruby
class Peak15Jobs::CreateContactBooking < ApplicationJob
  queue_as :peak_15

  retry_on(StandardError, attempts: 2) do |job, error|
    InternalMailer.trip_booking_creation_failed(
      Peak15Booking.find(job.arguments.first[:p15_booking_id])
    ).deliver_later
  end

  def perform(p15_booking_id:)
    booking = Peak15Booking.includes(scheduled_trip: [:trip_series]).find(p15_booking_id)

    if booking.create_peak15_contact_booking!
      Peak15Jobs::AssociatePaymentWithContactBooking.perform_later(p15_booking_id: p15_booking_id)
    else
      raise "Unable to create Peak15 Contact Booking"
    end
  end
end
```

That job kicked off the next stage only after the previous one finished successfully.

Then the next job handled payment association:

```ruby
class Peak15Jobs::AssociatePaymentWithContactBooking < ApplicationJob
  queue_as :peak_15

  retry_on(StandardError, attempts: 2) do |job, error|
    InternalMailer.trip_payment_association_failed(
      Peak15Booking.find(job.arguments.first[:p15_booking_id])
    ).deliver_later
  end

  def perform(p15_booking_id:)
    booking = Peak15Booking.find(p15_booking_id)

    unless booking.associate_payment_with_contact_booking!
      raise "Unable to associate Peak15 Contact Booking with Payment"
    end
  end
end
```

The follow-up job handled payment association and failure escalation.

This is the right kind of boring. Every stage has a name. Every stage can retry. Every stage can fail loudly.

## The service object had to know a lot of ugly details

The `Peak15Manager::Booker` service was where the actual integration logic lived.

That code had to build request payloads for contact bookings, support multiple guests, support waitlists, and deal with payment schedules that were not always present when old jobs retried.

Here's a good example:

```ruby
peak15_payment_schedule = if payment_schedule.nil?
  ScheduledTrip.find_by(partner_external_id: departure_id).peak15_payment_schedule_guid
else
  payment_schedule
end
```

That fallback lived in the Peak15 booking service.

I like this snippet because it's honest. The comment above it explains that this was an urgent temporary fix for queued jobs that were missing an argument. That's real software work. Sometimes the right move is not a perfect redesign. It's a targeted repair that unblocks production and leaves the system in a safer state than before.

The create call itself also shows what integration work actually feels like:

```ruby
creation_params = {
  "contact.firstname": firstname,
  "contact.lastname": lastname,
  "contact.emailaddress1": email,
  "contact.atlasobs_primaryphone": phone_number,
  "p15_bookings.p15_tripdepartures_bookingsid": departure_id,
  "p15_guests.contact.1.isClient": true,
  "p15_invoices.p15_paymentscheduleid": peak15_payment_schedule,
  amount: amount,
  currency: "USD",
  returnallids: true
}
```

That parameter assembly also lived in the same service object.

Nobody writes code like that for fun.

You write it because product needs checkout to work, finance needs payment association to be correct, and support needs enough metadata to troubleshoot when an external system misbehaves.

## Failure handling was part of the feature

This is the part I think teams underinvest in.

When a workflow crosses system boundaries, failure handling is part of the product. If a downstream CRM call fails and no one hears about it, the feature isn't "partially complete." It's broken in a way users and ops will discover later at the worst possible time.

So the jobs didn't just retry. They also sent internal failure emails after repeated errors.

That meant a booking problem had a real operational path:

- retry automatically first
- preserve the booking record in our database
- notify humans if the automation couldn't finish the job

That's much better than pretending retries alone are reliability.

There was also a clear bias toward moving the slowest work off the request path. The `Peak15Booking` model comments literally warned that some calls were very slow and belonged in non-blocking code. That's good instinct. If an external system is sluggish, design around that fact instead of blaming production later.

## Product details leaked into the backend in useful ways

A nice example is the `inquire_to_book` work on scheduled trips.

At some point the booking flow needed more than a binary "this trip can be booked" decision at the series level. I changed that logic so the scheduled trip itself could control whether the CTA should become an inquiry path instead of a direct booking path.

That came through in the `inquire_to_book` change set for scheduled trips, not just in templates. The important part is the modeling decision. Once the flag lived on the right record, the UI could ask a better question.

That's often the difference between senior product engineering and patching views until they stop breaking. You move the rule to the layer that actually owns it.

## Integration work gets judged by what doesn't happen

No one opens a laptop and says, "I hope today I get to reconstruct external payment state from multiple systems."

The best version of this work is invisible.

Users complete checkout. Support doesn't get weird edge cases. Finance data lines up. The engineering team knows where to look when something fails. And the whole workflow has enough structure that another engineer can understand it without treating the CRM as black magic.

That's what I was trying to build around Peak15.

Not elegance for its own sake. Not a huge abstraction. Just a booking pipeline that had names for its states, jobs for its transitions, and enough operational honesty to be trusted in production.

That's good fun, in a very specific engineer way.
