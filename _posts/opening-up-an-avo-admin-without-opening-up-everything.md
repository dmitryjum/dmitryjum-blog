---
title: "Opening up an Avo admin without opening up everything"
excerpt: "At Skillit, I needed staff to do real operational work in Avo without giving every staff user superuser powers. Pundit policies turned that into a permission matrix I could reason about."
date: "2025-08-25T13:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/companies/skillit.png"
tags: ["Skillit", "Rails", "Avo", "Pundit", "Security"]
---

# Opening up an Avo admin without opening up everything

Admin panels get dangerous fast.

Not because the gem is bad. Because once a team starts relying on the admin for daily operations, the easiest permission model is usually "just let staff do it."

That works right up until it doesn't.

At Skillit, I worked on tightening access in an Avo-based admin so staff could do the work they actually needed, without turning every staff account into a soft superuser. I can't publish the whole codebase, but the Rails pattern is portable.

## The default split was simple

I used Pundit as the source of truth and kept the base policy strict:

```ruby
class ApplicationPolicy
  def index?
    user&.is_staff?
  end

  def show?
    user&.is_staff?
  end

  def create?
    user&.is_superuser?
  end

  def update?
    user&.is_superuser?
  end

  def destroy?
    user&.is_superuser?
  end

  def search?
    user&.is_staff?
  end

  def act_on?
    user&.is_staff?
  end
end
```

Staff could browse, search, and run safe operational actions.

Mutation stayed locked down by default.

That one decision made the rest of the system easier to reason about. Every resource started secure, and I only opened up the ones with a real business case.

## Then I added explicit exceptions, not broad exemptions

Some resources were operational. Staff needed to edit them.

Some were sensitive. Staff needed visibility, not write access.

And one case mattered more than the others: company-linked admins who should be able to edit *their own* company record without getting broad admin powers.

That led to small resource-specific policies instead of one giant role matrix.

For example, the company policy allowed two paths:

```ruby
class CompanyPolicy < ApplicationPolicy
  def create?
    user&.is_staff?
  end

  def edit?
    user&.is_staff? || (user&.employer&.admin? && user.company == record)
  end

  def update?
    user&.is_staff? || (user&.employer&.admin? && user.company == record)
  end
end
```

That's a small policy, but it does an important job.

It doesn't ask "is this user important?" It asks "what is this user allowed to do to *this* record?" That's the question admin permissions usually need.

## Avo only worked well once the resources pointed at the right policies

This part is easy to gloss over when you're wiring up an admin gem.

The policy design doesn't matter if every resource quietly falls back to the wrong default. So I made the resource layer explicit:

```ruby
class Avo::Resources::Worker < Avo::BaseResource
  self.authorization_policy = WorkerPolicy
end

class Avo::Resources::Interview < Avo::BaseResource
  self.authorization_policy = InterviewPolicy
end

class Avo::Resources::Certification < Avo::BaseResource
  self.authorization_policy = AvoRestrictedPolicy
end
```

That gave me three clean buckets:

- resources staff can work with
- resources staff can inspect but not mutate
- resources reserved for superusers

I like this because the permission intent stays close to the resource definition. If someone opens a resource file months later, the policy isn't hidden in a global initializer or some side channel of naming conventions.

## "Restricted" still needed to be useful

One mistake I've made before is treating read-only access as if it means "basically inaccessible."

That wasn't good enough here.

Staff still needed to search records, open details, and run some actions that were operationally safe. So the restricted policy inherited the base behavior for browsing and action visibility, while still blocking create, update, and destroy for non-superusers.

That gave support and ops people enough power to do their job without letting the admin become a second back office app full of accidental writes.

## The UI and the permission model had to agree

This sounds obvious, but admin tooling often drifts here.

If the policy says a user can't edit a record, the resource controls shouldn't tease an edit button. If staff can act on interviews but not create arbitrary interview records, the actions should be visible while standard create flows stay shut.

That was part of why I liked Avo for this work. It gave me a clean place to separate:

- `show_controls` for record-level actions
- resource policies for the hard permission boundary

Those two pieces are different. Mixing them creates weird bugs where the UI *looks* allowed but the request dies later, or worse, the UI hides something that the backend would have permitted.

## The tests ended up being more valuable than the policy code

The biggest risk in permission work isn't writing the first policy. It's changing the system later and forgetting what the intended matrix was.

So I wrote policy tests that read almost like a contract:

- staff can browse workers and update them
- staff can inspect restricted resources but not mutate them
- superusers still keep full access where expected
- company admins can edit their own company record, but not someone else's
- guests and regular users stay out

This isn't glamorous testing. It's some of the most useful testing in a product app.

Permission bugs don't usually show up as red exceptions in happy-path flows. They show up as quiet overreach, or as a support team getting blocked during a live issue. I want that matrix nailed down in code.

## Why I prefer this over role checks scattered through the admin

A lot of admin permission systems start with conditionals inside views:

```ruby
if current_user.is_staff?
  # show button
end
```

I don't like that as the source of truth.

It's fine for presentation details. It's bad for authorization design.

Once the actual rules live in Pundit, the admin becomes easier to extend. New resources don't need a fresh round of copy-pasted role checks. They need a policy decision. That's a better maintenance story, and it's a safer one too.

## The broader lesson

I think internal tools deserve the same discipline as customer-facing code.

Maybe more.

They're where teams move fast, bypass guardrails, and normalize "just this once" permissions. If the admin panel is part of daily operations, it's production software. Treat it that way.

For me, that meant starting with strict defaults, opening only the cases I could justify, and writing tests that kept the permission model from drifting.

That's the whole job.

What about you? Do you keep admin permissions centralized, or do they still leak into the UI layer?
