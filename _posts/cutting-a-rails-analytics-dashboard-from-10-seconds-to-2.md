---
title: "How I cut a Rails analytics dashboard from 10 seconds to 2"
excerpt: "A slow admin dashboard usually means someone hid network latency inside a nice-looking graph. I sped up an old Rails dashboard by parallelizing Google Analytics queries and caching time-bucketed results."
date: "2025-09-30T18:15:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/assets/blog/alumnifire/alumnifire.png"
tags: ["AlumniFire", "Rails", "Google Analytics", "Performance", "Caching"]
---

# How I cut a Rails analytics dashboard from 10 seconds to 2

Admin dashboards lie all the time.

They look like simple tables and charts, but the real product is waiting. Waiting on external APIs, waiting on aggregation code, waiting on one more query that someone assumes is cheap because it only runs for staff.

At AlumniFire, in 2015, I worked on a reporting dashboard that pulled product signals out of Google Analytics. It showed pageviews, events, signups, and other engagement slices across time windows like today, yesterday, this week, and this month.

The first version worked.

It was also slow enough to be annoying.

Some of the code in this post is obviously from that era. That's fine. I'm not holding it up as a modern analytics stack. The useful part is the performance problem and the way I solved it inside the Rails app we had at the time.

## The bottleneck wasn't Rails

The expensive part lived in the analytics collector:

```ruby
def get_pageviews_hash
  pageviews_filter_types.keys.each {|t| @pageviews_hash[t] = Hash.new}
  clear_old_keys __method__
  Rails.cache.fetch(cache_key __method__) do
    period_columns.keys.pmap do |c|
      c == "_all_time" ? pageview_query("2014-01-01", c) : pageview_query(period_columns[c], c)
    end
    set_possible_newuser_info
    @pageviews_hash
  end
end
```

That method was doing the right business work. It wasn't doing it in the cheapest way.

The dashboard wanted the same metrics across multiple time ranges. Each range meant another request to Google Analytics. Once you stack pageviews and event queries on top of that, a page load can quietly turn into a small pile of remote calls.

That's why the page felt slow even though the Rails app itself wasn't under much pressure.

## I parallelized the time slices

The main improvement was embarrassingly straightforward.

Instead of querying each date range one after another, I spread the work across threads:

```ruby
module Enumerable
  def pmap(cores = 4, &block)
    [].tap do |result|
      each_slice((count.to_f/cores).ceil).map do |slice|
        Thread.new(result) do |result|
          slice.each do |item|
            result << block.call(item)
          end
        end
      end.map(&:join)
    end
  end
end
```

Then the dashboard used that helper over the period keys:

```ruby
period_columns.keys.pmap do |c|
  c == "_all_time" ? event_query("2014-01-01", c) : event_query(period_columns[c], c)
end
```

That cut the query time from roughly 8 to 10 seconds down to about 2 to 4 seconds. Not because the logic changed, but because the waiting overlapped instead of stacking.

That's a useful lesson in old Rails apps.

If the slowness is remote I/O, don't spend all day shaving Ruby objects before you fix the call pattern.

## I kept the result shape stable

I wasn't trying to redesign the admin page. I just wanted it to answer faster.

So the data structure stayed boring:

```ruby
def pageview_query(date, c)
  return_vals = params(date, 'ga:pagePath', 'ga:pageviews', requested_pages)
  pageviews_filter_types.keys.each {|t| @pageviews_hash[t][c] = return_vals[pageviews_filter_types[t]].to_i}
end
```

And the event side matched it:

```ruby
def event_query(date, c)
  return_vals = params(date, 'ga:eventAction', 'ga:totalEvents', requested_events)
  event_filter_types.each {|t| @events_hash[t][c] = return_vals[t].to_i}
end
```

That mattered.

If you're speeding up a reporting surface that people already use, preserving the result contract buys you safety. The view code doesn't need to care that the fetch strategy changed. It still gets the same hashes, keyed the same way.

Fast is good. Predictable fast is better.

## Then I stopped recomputing the same answer

Parallel requests helped, but it still didn't make sense to ask Google Analytics the same question on every dashboard load.

So I added a cache key tied to rounded time:

```ruby
def cache_key(method_name)
  "#{method_name}_#{RoundedTime.floor(5.minutes)}"
end
```

The helper behind that was tiny:

```ruby
class RoundedTime
  def self.floor(seconds = 60)
    Time.at((Time.now.to_f / seconds).floor * seconds)
  end
end
```

That gave me a practical compromise.

The dashboard didn't need second-by-second freshness. Five-minute buckets were plenty for an admin view. So instead of arguing about "real-time analytics," I picked a freshness window that matched how the page was actually used.

That turned a recurring remote workload into a periodic one.

## Cache cleanup mattered too

One detail I still appreciate is that I didn't just add cache entries and walk away:

```ruby
def clear_old_keys(method_name)
  cache_keys = Rails.cache.instance_variable_get(:@data).keys
  cache_keys.grep(/#{method_name}/).each do |key|
    Rails.cache.delete(key) if key != cache_key(method_name)
  end
end
```

I wouldn't reach into the cache internals like that in a modern app unless I had to, but the intent was right.

If the key rotates every five minutes, old buckets should stop piling up. Otherwise the speed fix slowly turns into a storage leak with better branding.

That's the kind of maintenance detail people skip when they're excited that the page finally feels quick.

I didn't want a temporary win.

## The data model for time windows stayed simple

The period helper was also deliberately plain:

```ruby
def period_columns
  {"_all_time" => nil, "_today" => Time.zone.now.to_date, "_yesterday" => 1.day.ago.to_date,
   "_two_days_ago" => 2.day.ago.to_date, "_three_days_ago" => 3.day.ago.to_date,
    "_this_week" => 7.days.ago.to_date, "_this_month" => 1.month.ago.to_date}
end
```

That made the collector easy to reason about.

Every metric constructor spoke the same time language. If the admin UI wanted to add a row or graph, the periods were already standardized.

I like code that turns reporting into a reusable pattern instead of a pile of special cases.

## The best part was that it stayed boring to use

Staff didn't need to know the dashboard was now doing threaded API calls.

They just clicked the page and it stopped wasting their time.

That's the version of performance work I enjoy most. Not synthetic benchmarks. Not heroic rewrites. Just finding the real wait, overlapping the expensive work, and caching at a boundary the user will never notice.

The dashboard still asked the same questions.

It just stopped asking them so slowly.
