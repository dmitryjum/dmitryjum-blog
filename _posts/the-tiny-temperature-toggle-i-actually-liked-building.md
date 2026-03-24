---
title: "The tiny temperature toggle I actually liked building"
excerpt: "The Fahrenheit/Celsius switch in Forecastly is small, but it draws a useful line: keep presentation state in the browser, keep data ownership on the server."
date: "2025-08-14T12:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url:
tags: ["Forecastly", "Rails", "Stimulus", "UI state"]
---

# The tiny temperature toggle I actually liked building

Forecastly only has one obvious piece of front-end state.

Fahrenheit or Celsius.

That’s it.

And I like that because it forced me to solve the problem at the right size.

I didn’t need a settings model. I didn’t need to persist a preference. I didn’t need to ask the server for a second representation of the same forecast. I just needed a fast toggle that updated the current weather and the five-day cards together.

So I built it with one Stimulus controller and a small markup contract.

## The contract is the interesting part

Both the current forecast component and the daily forecast component expose temperatures in the same format:

```erb
<span id="<%= @current[:weekday] %>"
      data-original="<%= @current[:temp] %>"
      data-temperature-target="value">
  <span><%= @current[:temp] %></span>
</span>
```

That’s in `forecast_current_component.html.erb`.

And the daily cards do the same thing:

```erb
<div id="<%= day[:name].parameterize %>"
     data-original="<%= day[:temp] %>"
     data-temperature-target="value">
  <span><%= day[:temp] %></span>°
</div>
```

That’s in `forecast_daily_component.html.erb`.

This is what makes the whole feature work cleanly.

The Stimulus controller doesn’t care which component produced the temperature node. It only cares that each node has:

- a stable DOM id
- a Fahrenheit source value in `data-original`
- a `data-temperature-target="value"` hook

Once I had that, the toggle became simple.

## The controller stores the original values once

On connect, the controller walks all the temperature targets and records the Fahrenheit value by element id:

```js
initialize() {
  this.originalTemps = {};
  this.currentUnit = "F";
}

connect() {
  this.valueTargets.forEach(element => {
    this.originalTemps[element.id] = Number(element.attributes["data-original"].value);
  });
  this.showF();
}
```

That’s in `temperature_controller.js`.

I like this more than recomputing from whatever text happens to be visible in the DOM. The source of truth stays fixed. The page can flip back and forth without accumulating rounding errors or parsing display text.

That’s a small detail, but it keeps the controller honest.

## Switching units is just a transform over the targets

The Celsius path is direct:

```js
toC(event) {
  event.preventDefault();
  if (this.currentUnit === "C") return;
  this.valueTargets.forEach(element => {
    const original = this.originalTemps[element.id];
    const celsius = Math.round((original - 32) * 5 / 9);
    element.querySelector("span").textContent = celsius;
  });
  this.currentUnit = "C";
  this.cTarget.classList.add("underline");
  this.fTarget.classList.remove("underline");
}
```

Back to Fahrenheit is even simpler:

```js
toF(event) {
  event.preventDefault();
  if (this.currentUnit === "F") return;
  this.valueTargets.forEach(element => {
    element.querySelector("span").textContent = this.originalTemps[element.id];
  });
  this.currentUnit = "F";
  this.fTarget.classList.add("underline");
  this.cTarget.classList.remove("underline");
}
```

That lives in `temperature_controller.js`.

No network request. No duplicated forecast data. No separate Celsius endpoint. It’s just display logic, which means it belongs in the browser.

## The links stay dumb on purpose

The current forecast component renders the two unit controls as plain links with Stimulus actions:

```erb
<%= link_to "F", "#", data: { action: "temperature#toF", temperature_target: "f" } %> |
<%= link_to "C", "#", data: { action: "temperature#toC", temperature_target: "c" } %>
```

That’s in `forecast_current_component.html.erb`.

The controller also keeps the active unit underlined. Again, tiny detail, but important. State changes need a visible cue.

I think this is where small front-end work often goes wrong. The logic is easy, so people stop paying attention to the interaction. But the interaction is the feature. If the toggle updates values but doesn’t make the active state obvious, it feels broken even when the math is right.

## Why I didn’t convert on the server

Because the server already did its job.

The backend fetches weather data, shapes it, caches it, and returns HTML. By the time the page is rendered, the user already has everything needed for a unit switch. Asking the server for a second render would just add latency to a pure presentation concern.

That would be worse architecture, not better.

I think this is a useful line to draw in Rails apps using Hotwire:

- if the state changes data ownership or persistence, let the server handle it
- if the state only changes presentation, keep it in the browser

The unit toggle is firmly in the second category.

## ViewComponent helped here too

Forecastly renders the forecast UI through two components:

- `forecast_current_component.rb`
- `forecast_daily_component.rb`

That matters because the temperature toggle doesn’t have to know where the forecast came from. The controller attaches once at the section level in `search.html.erb`, and both components participate by emitting the same data attributes.

That’s a nice split of responsibilities:

- backend decides the forecast data
- components decide the HTML contract
- Stimulus handles the display transform

Everyone gets one job.

## The feature is small, but the lesson isn’t

This kind of work is easy to dismiss because it’s not a big architectural post. It’s just a temperature toggle.

But I think small features are where you can tell if an app is being built with discipline.

If I had pushed this through the server, the app would feel slower for no reason. If I had hand-wired each card separately, the code would drift. If I had parsed text out of the DOM instead of keeping source values, I’d be fighting rounding weirdness later.

Instead, the feature ended up tiny and clean.

That’s a win.

I like building things that stay small when they should stay small.

The full source for this project is on GitHub: [github.com/dmitryjum/forecastly](https://github.com/dmitryjum/forecastly)

What’s the smallest feature you’ve built lately that taught you something useful?
