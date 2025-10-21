---
title: "Keeping search context alive on a Rails profile page"
excerpt: "At Skillit, opening a worker profile from search couldn’t mean losing the search that made the profile interesting. Passing a saved-search context through the profile page let Rails keep the recruiter workflow intact."
date: "2025-08-24T15:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/companies/skillit.png"
tags: ["Skillit", "Rails", "Hotwire", "ViewComponent", "Search"]
---

# Keeping search context alive on a Rails profile page

Profiles lie when they forget how you got there.

A recruiter runs a search, opens a worker, and suddenly the page turns into a generic profile with generic trades, generic skills, generic distance, and a back button that drops them somewhere vague. That's not a profile bug. That's a workflow bug.

At Skillit, I worked on making worker profiles contextual to the saved search that led to them. I can't share the product itself, but the pattern is useful in any Rails app where users move from a filtered list into a detail page and still need the original context.

## The key was carrying `search_id` through the detail route

The profile page didn't need a client-side store or a custom browser history trick.

It just needed one more piece of state in the URL.

The search results linked to the profile like this:

```erb
data-link-url-value="<%= profile_path(worker, search_id: @saved_search.to_param) %>"
```

And the explicit links in the row used the same idea:

```erb
<%= link_to worker.name, profile_path(worker, search_id: @saved_search) %>
```

That one param changed the whole flow.

Now the profile request could answer a better question than "show me this worker." It could answer "show me this worker in the context of *this saved search*."

## The controller resolved the search once and let the components use it

The profile controller stayed pretty small:

```ruby
before_action :set_search

def show
  @employer = current_employer
  @company = current_employer.company
  WorkerProfile.new(@user).visited_by!(current_employer)
end

private

def set_search
  @search = current_employer.saved_searches.from_param(params[:search_id]) if params[:search_id].present?
rescue ActiveRecord::RecordNotFound
  @search = nil
end
```

I like that shape because it degrades cleanly.

If the page has a valid `search_id`, the profile becomes contextual. If it doesn't, the page still works as a full profile. No separate controller, no duplicate templates, no special frontend recovery code.

## The profile component compared the worker against the active search

Once the component had both `user` and `search`, it could stop rendering generic labels and start rendering relevant ones.

That showed up in a few places:

- matched trades instead of all trades
- distance from the search location, not just the worker's stored location
- pay highlighted when it fell outside the saved-search range
- experience highlighted when it missed the saved-search minimum

The comparison methods stayed close to the view:

```ruby
def within_pay_range
  return unless Flipper.enabled?(:search3, Current.user)
  return if search.nil?

  if search.search_params["pay_max"].present? &&
     worker_entity.desired_pay_rate.to_i > search.search_params["pay_max"].to_i
    "text-main-red"
  end
end
```

The same component also recalculated distance against the saved search location:

```ruby
def distance_to_search
  unless search.nil?
    if worker_entity.travel_distance.present? &&
       worker_entity.home_location&.geocoded? &&
       search.geocoded?
      worker_entity.home_location&.distance_to(search)&.round(2)
    end
  end
end
```

That made the profile answer the recruiter question that actually matters: "Is this worker a fit for *this role*?" Not just "What does this worker look like in isolation?"

## I used the saved search to reshape the skills section too

This was the part I liked most.

A generic skills chart is fine. A contextual skills chart is better.

The areas-of-experience component looked at the saved search's skills and then split the list into two buckets:

- matched skills with a stored level
- search skills the worker didn't have

The matched ones stayed black and kept their width in the chart. The unmatched ones showed up in red with no width bar. That turned the chart into a comparison, not just a résumé dump.

The logic looked like this:

```ruby
def search_skills_with_levels
  skills = [[], []]

  search_skills.each do |skill|
    level = user_skills.find { |user_skill| user_skill.choice_id == skill.id }.try(:level)

    if level.nil?
      skills[1] << { id: skill.id, value: skill.choice }
    else
      skills[0] << { id: skill.id, value: skill.choice, level: level }
    end
  end

  skills[0].sort_by! { |skill| skill[:level] }.reverse!
  skills.flatten
end
```

That was enough to turn the component from "here are some skills" into "here is where this worker lines up with the search you came from."

That's a much better profile.

## The role switcher made the context explicit

One subtle problem with contextual pages is that they can feel mysterious.

If numbers and labels change based on some hidden search state, the page starts acting smart in a confusing way. I didn't want that. So the profile included a role dropdown that let the recruiter switch between:

- full profile
- each of their saved-search contexts

The options came from the employer's saved searches:

```ruby
def roles
  employers_searches = @employer.saved_searches.untitled_first.includes(:project)
  roles = [{ name: "Full Profile", slug: user.unique_url }]

  employers_searches.each do |s|
    roles << {
      name: combined_search_name(s),
      slug: user.unique_url,
      saved_search_id: s.to_param
    }
  end

  roles
end
```

Each menu item just linked back to the same profile with a different `search_id`.

That kept the interface honest. The page wasn't guessing context behind the user's back. It was telling them which lens they were using.

## Similar workers stayed contextual too

Once the page already had the saved search, it made sense to pass that same context into the "more like this" area.

The sidebar lazy-loaded similar workers with a Turbo frame:

```erb
<%= turbo_frame_tag(
  "more-like",
  src: similar_workers_profile_path(id: @user, search_id: params[:search_id]),
  loading: "lazy"
) %>
```

And the controller used the worker's skills and location to fetch related candidates while still passing the active search's trades into the rendered component.

That meant the contextual flow didn't stop at the first detail page. It carried forward into exploration.

## I liked that this stayed server-rendered

This is the kind of feature people often assume needs a frontend state layer.

I don't think it does.

The state already had a natural home:

- in the URL as `search_id`
- in the controller as `@search`
- in the component tree as an input

Rails is good at this kind of thing when you let it be. The page can still feel dynamic and tailored without pretending the server doesn't exist.

## The tests pinned down the parts that were easy to break

The component tests did the right kind of work here.

They checked that:

- the profile falls back cleanly with no search context
- range helpers turn red when search thresholds are exceeded
- matched trades switch the label from generic trades to matched trades
- contextual skills keep matched entries and still show unmatched search skills
- the role dropdown lists full profile plus saved-search variants

Those tests mattered because contextual UI is fragile in a quiet way. One param gets dropped from a link, one helper falls back too early, and suddenly the page still renders but the workflow is gone.

## A detail page doesn't have to be generic

If users arrive from a filtered workflow, the detail view should preserve enough of that filter to stay useful. In Rails, that doesn't need to be a client-state project. One identifier in the URL, some discipline in how components use it, and the page still knows why you opened it.

That was the whole move.
