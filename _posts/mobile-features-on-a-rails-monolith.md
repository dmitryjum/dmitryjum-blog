---
title: "Building mobile features on top of a Rails monolith"
excerpt: "The interesting part of app work in a mature Rails codebase isn't the endpoint. It's the combination of API contracts, moderation tools, and product logic that keeps mobile and web aligned."
date: "2025-09-15T13:30:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/assets/blog/atlas-obscura/ao_screen_2.png"
tags: ["Atlas Obscura", "Rails", "Mobile"]
---

# Building mobile features on top of a Rails monolith

People talk about "building for mobile" like it's a frontend project.

Sometimes it is.

In a mature Rails app, it usually isn't.

The hard part is not exposing a new endpoint and calling it a day. The hard part is deciding how app behavior should map onto an existing product, an existing data model, and an existing operations team that now has to support whatever you ship.

At Atlas Obscura, place submissions, tips, Firebase auth, passport stamps, and moderation flows all touched each other. That's what made it real product engineering instead of just API work.

## A mobile feature usually means backend shape first

Take user-generated place content.

If the app lets a user submit a new place, the server has to answer a few questions immediately:

- who is allowed to create it
- what status it should start in
- how much of the associated data the API should return right away
- how downstream moderation will work

The place create endpoint reflected those decisions:

```ruby
subject { post api_v1_places_path(new_place), headers: firebase_auth_headers }

it { expect(response).to have_http_status(:created) }
it { expect { subject }.to change { Place.count }.by(1) }
it "creates the Place as expected" do
  subject
  expect(Place.find(json["id"]).app_ugc_status).to eql "submitted"
end
```

That behavior was covered in request specs.

I like this because it shows a clean product rule: app-submitted content exists, but it enters the system as submitted content. Not live content. Not a mystery state. That matters for trust.

## Tips were a good example of a small feature that touched multiple layers

The `tips` feature looked lightweight. A user leaves a short comment for a place. That's easy, right?

Not really.

It needed a model, validation, an API create path, and a publication rule so the app didn't accidentally expose unapproved content.

The model was straightforward:

```ruby
class Tip < ApplicationRecord
  enum status: {
    submitted: 0,
    approved: 1,
    rejected: 2
  }

  belongs_to :place, touch: true
  belongs_to :user

  validates :comment, :user, :place, :status, presence: true
end
```

That logic lived in the `Tip` model.

The API create action was also small on purpose:

```ruby
def create
  place = Place.find(params[:place_id])
  @tip = place.tips.new(tip_params)
  @tip.user_id = api_current_user.id
  @tip.status = 0
  @tip.save!
  render "show", status: :created
end
```

That create path lived in the tips API controller.

What matters is the default. New tips come in as `submitted`.

That's not just an implementation detail. That's a moderation decision expressed in code.

Then the place API had to be just as disciplined on the way back out. Users could submit tips freely, but readers shouldn't see unreviewed or rejected ones mixed into place data.

That boundary matters.

Input and output rules both matter. If you only think about creation, you end up leaking unfinished moderation states back to users. A feature like this is only coherent when submission, review, and display all agree on what "public" actually means.

## Mobile features create admin work whether you plan for it or not

One thing engineers usually learn by doing: every user-generated feature creates operations work. If you don't build the staff tooling, you've just made the work invisible, not smaller.

The `flags` work is a good example. Once users can flag place issues, staff need a real place to review and resolve them. So I built an admin table with filtering and update actions instead of leaving moderation as ad hoc support work.

The controller kept the query focused:

```ruby
def index
  scope = Flag.includes(:user, :place).order(created_at: :desc)
  scope = params[:status].nil? ? scope.where.not(status: nil) : scope.where(status: params[:status])
  @flags = scope.page(params[:page]).per(20)
end
```

That query lived in the admin flags controller.

And the admin view made the workflow explicit:

- see submitted date
- jump straight to the flagged place
- see user and email when present
- mark the flag as addressed or not relevant

The admin view then exposed that workflow directly to staff.

This kind of tooling never wins design awards. It does win time back for the team. More importantly, it makes the product safer to expand.

## The best app features reused the same business logic as web

This is why I liked the passport stamp work too.

The app didn't get a fake mobile-only version of the feature. It got a dedicated API endpoint that reused the same underlying country-eligibility logic as the web profile. That kept the product meaning consistent across platforms.

Same with auth. Same with app platform tracking. Same with moderation states.

That's the pattern I trust in older Rails systems. Don't let every client invent a parallel product model. Put the rules in one place, and expose clean contracts around them.

## Monoliths are good at this if you let them be

There's a lazy version of the "monolith" conversation where people act like the main challenge is scale or framework age.

That wasn't the interesting part here.

The interesting part was discipline.

Could we add app-facing capabilities without scattering logic everywhere? Could we make user activity flow through models and admin tools that the rest of the company could understand? Could we avoid turning "mobile support" into a pile of special cases?

When the answer was yes, the monolith was an advantage. The core data, the product rules, the admin surfaces, and the API were all in one place. That made it easier to connect the dots.

That's why I still like working in Rails apps with real history. When you put new rules in the right place, you can ship a lot without inventing new architecture for each feature.
