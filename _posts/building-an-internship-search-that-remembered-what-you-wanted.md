---
title: "How I built an internship search that remembered what you wanted"
excerpt: "An internship search shouldn't force students to rebuild the same filters every time they come back. I built the flow so criteria persisted, geolocation stayed queryable, and search results could turn directly into resume drops."
date: "2025-09-29T18:30:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/assets/blog/alumnifire/alumnifire.png"
tags: ["AlumniFire", "Rails", "Geocoder", "Search", "Product"]
---

# How I built an internship search that remembered what you wanted

Search gets worse fast when the app forgets your intent.

That was especially true for internship outreach at AlumniFire in 2015. A student wasn't just browsing profiles. They were trying to answer a practical question: who should get my resume, based on industry and location, and how do I avoid repeating work I've already done?

I wanted that flow to feel less like a stateless filter form and more like a saved work session.

Some of the implementation is visibly 2015 Rails code. That's expected. What still matters is the product logic: persist the search, preserve intent, and let the result set turn into actual outreach.

## I persisted the search, not just the results

The controller didn't throw the criteria away after the first request. It saved an `InternshipSearch` and attached criterion records to it:

```ruby
@internship_search = current_profile.internship_searches.create(
  fullfilled: false,
  search_criteria: [
    InternshipSearchCriterion.create(industry_criterion_params),
    InternshipSearchCriterion.create(location_criterion_params)
  ])
```

That let the feature do something more useful than "show me matches right now."

It could also say:

- show me the unfinished search I was working on
- show me the employers tied to that search
- show me which resume drops came from it later

That's a much better product loop.

## The unfinished search became the default

When a user came back, the app looked for their last unfulfilled search first:

```ruby
last_unfullfilled = current_profile.internship_searches.find_by fullfilled: false
@internship_search = last_unfullfilled.present? ? last_unfullfilled : current_profile.internship_searches.new
```

I like this because it respects the user's time.

If they already picked industries and locations, they shouldn't have to rebuild that state from scratch just because they closed the page or got interrupted. The app already knows what they were trying to do. It should act like it.

That same persisted object also drove the history screen, where completed searches and one-off resume drops were merged into a single timeline:

```ruby
individual_drops = current_profile.requests.where(type: 'ResumeDrop', internship_search_id: nil)
searches = current_profile.internship_searches.where(fullfilled: true)
@search_and_drops = (individual_drops + searches).sort {|x,y| y.updated_at <=> x.updated_at}
```

That's not just storage. That's workflow.

## I kept the criteria flexible on purpose

The criterion model was simple:

```ruby
class InternshipSearchCriterion < ActiveRecord::Base
  self.table_name = 'internship_search_criteria'
  self.inheritance_column = nil

  belongs_to :internship_search
  serialize :value, Hash
end
```

The search needed heterogeneous criteria. Industry looked different from location. Location also carried a radius. In 2015, a serialized hash gave me enough structure to move fast without inventing a new table design for every filter type.

That kept the search object extensible.

## The hard part was geolocation

The interesting search logic lived in the model:

```ruby
near_queries = location.value[:name].map do |city|
  User.where('location IS NOT NULL').near(city, location.value[:range] || 10).to_sql
end
```

Then those SQL fragments got folded back into profile queries:

```ruby
Profile.seeking_interns.for_school(seeker.school).where(users: {industry: industries})
  .where("users.id IN (SELECT id FROM (#{q}) AS sub)")
```

The geocoder gem had a bug at that time that made the direct relation hard to merge cleanly once joins got involved, so I translated the proximity result into SQL and used that as a boundary.

Don't keep arguing with an abstraction after it stops helping. If the relation composition is broken, drop down a level, extract the SQL you need, and keep the product moving.

## I filtered out employers the student had already contacted

Search results aren't useful if half the list is work you've already done.

So before paginating the matches, I rejected existing recipients:

```ruby
def new_employers_from(search)
  existing_recipient_ids = current_profile.requests.where(type: 'ResumeDrop').pluck(:recipient_id)

  search.reject do |p|
    existing_recipient_ids.include? p.id
  end
end
```

This is simple code doing a high-value thing.

A lot of product friction comes from making users mentally diff the current screen against their past actions. I prefer when the system does that bookkeeping itself.

If a student already sent a resume to someone, the search shouldn't ask them to notice that manually.

## The endpoint could turn matches straight into outreach

The last step was the part I liked most.

The search wasn't just a list. It could become a batch of resume drops:

```ruby
new_employers_from(@search).each do |p|
  params[:resume_drop][:recipient_id] = p.id
  @request = @internship_search.resume_drops.new request_params

  service = RequestService.new @request
  service.save!
  service.activate!
  @internship_search.update(fullfilled: true) unless @internship_search.fullfilled
end
```

That collapsed a lot of repetitive work.

Pick the criteria. Review the matching employers. Attach the resume. Send the outreach. The search object then stayed behind as the record of what happened and how many results it produced.

That's a decent example of a feature growing up from "find things" into "help me finish the job."

## I added guardrails for the edges

There were a couple of failure cases I didn't want to ignore.

If the user tried to search without a location, the app pushed them back to the form with a clear message. If the `drop_resume` action ran after the unfinished search had disappeared, it returned the user to the new-search path instead of blowing up:

```ruby
if @internship_search.nil?
  flash[:warning] = 'Please input a search before sending resumes.'
  render 'redirect_to_new', layout: false and return
end
```

Those checks aren't flashy, but they're the difference between a feature that demos well and a feature that survives real users.

## I still like the shape of this

What I like most is that the feature kept state in the backend where the workflow already lived.

The student had a search object.
That search had typed criteria.
That search could produce filtered employers.
That search could own resume drops.
That search could later show up in history.

That's a clean product model.

Plenty of search features stop at matching.

This one remembered what the user wanted and carried that intent all the way through outreach. That's better.
