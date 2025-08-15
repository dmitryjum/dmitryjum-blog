---
title: "The weather pipeline behind Forecastly"
excerpt: "Forecastly doesn't hit one neat endpoint and call it done. It geocodes an address, walks the Weather.gov API, reshapes multiple responses, and caches the result at the boundary that matters."
date: "2025-08-15T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url:
tags: ["Forecastly", "Rails", "Weather.gov", "API design"]
---

# The weather pipeline behind Forecastly

Most of the app is just plumbing.

I mean that in a good way.

Forecastly looks simple from the outside. Type a city, get current weather, get a five-day forecast. The interesting part is that the app doesn’t hit one friendly endpoint that already matches the UI. It has to build the answer in stages.

That’s why I put the integration work in a plain Ruby object instead of smearing it across controllers and views.

## The controller does almost nothing

The request starts in `weather_controller.rb`. The controller takes an address, checks the cache, and if there’s a miss, hands the job to `WeatherFetcher`.

That shape matters:

```ruby
result = WeatherFetcher.new(address).call
Rails.cache.write(cache_key, result, expires_in: 30.minutes) unless result[:error]
```

The controller doesn’t know how geocoding works. It doesn’t know which Weather.gov endpoint comes first. It doesn’t know how to turn hourly data into a current weather card.

It just asks for a result.

That keeps the request path readable, and it also means the hard part has one home.

## The fetcher has a real job

`WeatherFetcher` is where the app stops pretending this is a one-step API call.

Here’s the flow in `weather_fetcher.rb`:

1. geocode the user’s address
2. call `api.weather.gov/points/:lat,:lon`
3. pull the forecast and hourly forecast URLs out of that response
4. call both forecast endpoints
5. reshape the payloads into a structure the view can render directly

The code looks like this:

```ruby
coords = safe_geocode(@address)
return { error: "Could not geocode address: #{@address}. Try again later." } unless coords

lat, lon = coords
point_response = HTTParty.get("https://api.weather.gov/points/#{lat},#{lon}", headers: headers)
parsed_response = JSON.parse(point_response)

forecast_url = parsed_response.dig("properties", "forecast")
hourly_url = parsed_response.dig("properties", "forecastHourly")
```

I like this setup because it admits the shape of the external API instead of hiding it behind vague method names. The app really does have to walk through an indirection step before it can ask for forecast data. That’s not incidental. It’s the integration.

## Error handling is part of the API contract

The fetcher returns a hash with either forecast data or an error message. No exceptions leak into the controller path for routine failures.

That part is intentional too.

If geocoding fails, the app returns:

```ruby
{ error: "Could not geocode address: #{@address}. Try again later." }
```

If the points lookup doesn’t succeed, it returns a different message. If the forecast URLs are missing, it returns another. If the downstream forecast requests fail, there’s a specific failure for that too.

This isn’t fancy error handling. It’s just honest.

For a small product, that honesty is enough. The UI doesn’t spin forever. The controller doesn’t need rescue branches everywhere. The user gets a sensible message.

## Current and daily forecasts come from different sources

The app doesn’t use the same payload for everything. Current conditions come from the hourly endpoint. The five-day view comes from the daily endpoint.

That split shows up in the builder methods:

```ruby
{
  city: @address,
  current: build_current_forecast(parsed_hourly),
  daily: build_daily_forecast(parsed_forecast)
}
```

Current weather takes the first hourly period and turns it into the card data:

```ruby
{
  temp: period["temperature"],
  weekday: Date.parse(period["startTime"]).strftime("%A"),
  description: period["shortForecast"],
  humidity: period["relativeHumidity"]["value"],
  wind: period["windSpeed"]
}
```

Daily weather filters for daytime periods and takes the first five:

```ruby
periods.select { |p| p["isDaytime"] }.first(5).map do |day|
  {
    name: Date.parse(day["startTime"]).strftime("%a"),
    description: day["shortForecast"],
    temp: day["temperature"]
  }
end
```

That’s a small example of why I still like service objects in Rails. The app needs a translation layer between an external API and a UI shape. A plain object is a good place to do that.

## Caching happens at the result boundary

The app caches the final shaped result, not the intermediate HTTP responses.

That’s the right call here.

The controller builds a cache key from the address:

```ruby
cache_key = "weather-fetcher-#{address.parameterize}"
```

If there’s a hit, the UI gets the exact same object it would have gotten from a fresh fetch. If there’s a miss, the fetcher runs and the final result gets stored for thirty minutes. Error results don’t get cached.

That means the cache stores something stable and useful: the contract between the backend and the view.

Not raw API noise.

## Geocoding shares the same cache backend

I liked this part once I saw it working.

Geocoder is configured to use `Rails.cache` too:

```ruby
Geocoder.configure(
  timeout: 20,
  cache: Geocoder::CacheStore::Generic.new(Rails.cache, {}),
  cache_options: {
    expiration: 30.minutes,
    prefix: "geocoder:"
  }
)
```

That’s in `geocoder.rb`.

So Forecastly has two layers of practical caching:

- geocoder lookups can be reused
- finished forecast payloads can be reused

This is the kind of caching I like in small apps. Not abstract. Not global. Just enough to avoid repeating expensive network work.

## The tests match the shape of the system

The specs in `weather_fetcher_spec.rb` are worth calling out because they test the integration boundaries, not just the happy path.

The spec stubs geocoding, stubs the Weather.gov points call, stubs the daily and hourly endpoints, and checks the final shaped result. It also covers:

- ungeocodable addresses
- geocoder exceptions
- missing forecast URLs
- failed forecast requests

That’s a better fit than trying to unit test every tiny private method in isolation.

The request spec in `weather_controller_spec.rb` also checks that successful results get written to the cache and that cached results come back with the `@from_cache` flag set. So the app doesn’t just *claim* to cache. The behavior is under test.

## Why I like this design

There’s no fake abstraction here.

The controller owns HTTP request flow. The fetcher owns the external integration. The view gets a tidy hash. The cache sits between expensive work and repeated requests. The tests pin down the contract.

That’s enough structure for an app like this.

I think small Rails apps get worse when every external API call turns into a mini-framework of adapters, serializers, facades, and concerns. Forecastly doesn’t do that. It uses one class with one job and keeps going.

Pretty cool.

The full source for this project is on GitHub: [github.com/dmitryjum/forecastly](https://github.com/dmitryjum/forecastly)

If you’re pulling data from an API that doesn’t match your UI, where do you put the translation layer?
