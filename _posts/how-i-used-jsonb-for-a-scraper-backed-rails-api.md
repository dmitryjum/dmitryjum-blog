---
title: "How I used jsonb for a scraper-backed Rails API"
excerpt: "Scraped school data changes from page to page. I used PostgreSQL jsonb in a Rails API so the app could store uneven school details without constant schema changes, while keeping the response format simple for the frontend."
date: "2025-10-14T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/intro_shot.jpg"
tags: ["Rails", "API", "PostgreSQL", "Search"]
---

# How I used jsonb for a scraper-backed Rails API

Scraped data doesn't fit neatly into rigid schemas.

One school page has an `endowment` field. Another has `president`. Another has `students`, `undergraduates`, `postgraduates`, and several other details that don't line up perfectly.

That was the problem in `us_state_universities`, a Rails API built around Wikipedia-sourced school data.

The project itself was pretty simple. `us_state_universities` scraped state-school information from Wikipedia, stored it in Postgres, and exposed it through a small API. A separate React app consumed that API so people could browse, search, and edit schools from the browser.

I didn't want to run a migration every time the scraper found a new field.

So the database had one stable column, `title`, and one flexible one, `details`, backed by `jsonb`.

## The model stayed small

The `School` model is still the heart of the app:

```ruby
class School < ApplicationRecord
  include Paginatable
  include PgSearch::Model

  validates_presence_of :title
  validates_uniqueness_of :title

  scope :where_title_is, ->(keyword) { where("title ~* ?", keyword) }
  scope :where_details_key_is, ->(keyword) { where("details ? '#{keyword}'") }
  scope :where_details_are, ->(details) { where("details ->> '#{details.first.first}' ~~* '%#{details.first.last}%'") }
end
```

That shape came from the source data.

The app was collecting semi-structured facts from pages that overlapped but did not share one reliable schema. `jsonb` fit that well because it let the API store the data without forcing every field into a fixed table design.

## The scraper could keep learning without schema churn

The ingest path was simple:

```ruby
def self.insert_or_update_one(new_school)
  current_school = find_or_create_by(title: new_school["title"])
  current_school.update(details: new_school["details"])
  current_school
end
```

And the reader built those hashes straight from each Wikipedia page:

```ruby
hash = { "title" => title }
hash["details"] = {}

trs.each do |tr|
  hash["details"][tr.css("th").text.gsub("\n", ", ").strip.downcase] =
    tr.css("td").text.gsub("\n", ", ").strip
end
```

That meant the scraper could discover new attributes without changing the schema.

If one page exposed `academic staff` and another exposed `mascot`, both could land in `details`. For this dataset, that flexibility was more useful than a strict schema.

The scraper was also doing just enough cleanup to keep the flexible schema from collapsing into junk:

```ruby
trs.each do |tr|
  hash["details"][tr.css("th").text.gsub("\n", ", ").gsub(/,\s\b|\[(.*?)\]|\W+$/, "").strip.downcase] =
    tr.css("td").text.gsub(/\[(.*?)\]|\W+$/, "").gsub("\n", ", ").strip
end
```

That parsing step was important.

If the keys came in with footnote markers, trailing punctuation, or inconsistent casing, the data would be much harder to search later. A little normalization up front made the stored keys more consistent.

## The API contract stayed simple

It still exposed a clean, predictable contract:

```ruby
def index
  @schools = School.where_params_are(params).paginate(params)

  respond_to do |format|
    format.json { render json: @schools, status: 200 }
    format.xml  { render xml: @schools, status: 200 }
  end
end
```

The client got:

- `records`
- `entries_count`
- `pages_per_limit`
- `page`

That's enough structure for a frontend to render a list, paginate it, and filter it without caring how the data is stored underneath.

The pagination wrapper helped with that too. The frontend did not need one response shape for title searches and another for full-text results. Everything came back in the same envelope.

## The app could also explain its own shape

One useful side effect of storing arbitrary keys was that the app could inspect what the scraper had actually collected.

The model exposed that through `top_twenty_keys`:

```ruby
def self.top_twenty_keys
  {}.tap do |key_counts|
    uniq_details_keys.each { |k| key_counts[k] = 0 }
    details_keys.each { |k| key_counts[k] += 1 if uniq_details_keys.include? k }
  end.sort_by { |k, v| v }.reverse.first(20).to_h
end
```

That gave the frontend a practical feature.

Instead of asking users to guess what fields might exist, the app could show the most common detail keys and turn them into shortcuts for filtering.

## Why this still works

- use flexible storage when the incoming data really is flexible
- keep the external contract tighter than the internal model
- add targeted query paths for the fields people actually use
- be honest about when a flexible document starts acting like a first-class column

`jsonb` helps when you're still discovering the shape of the data. It gets less magical when the product matures and certain keys become operationally important. At that point, some of them deserve promotion. Index them. Extract them. Validate them harder. Maybe split them out.

But early on, forcing the whole dataset into a rigid relational shape would've slowed this project down for no real gain.

The app was trying to expose a broad catalog of school data in a usable way. In that kind of system, a flexible model made sense.

## What I would tighten now

I'd be stricter about how the JSONB queries are constructed. I'd think harder about indexes up front for hot search paths. I'd probably separate "raw scraped facts" from "normalized fields the app depends on" once usage patterns were obvious.

I also wouldn't wait too long to identify which keys had become real product fields.

Flexible schemas help early, but they can also delay decisions for too long.

For this app, `jsonb` gave the scraper room to work before the data model was fully settled.

The full source for this project is on GitHub: [github.com/dmitryjum/us_state_universities](https://github.com/dmitryjum/us_state_universities)
