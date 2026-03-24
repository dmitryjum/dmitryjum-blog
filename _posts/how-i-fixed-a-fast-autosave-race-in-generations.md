---
title: "Fixing a fast autosave race in Generations"
excerpt: "Autosave gets tricky when the same field can be creating a record one moment and updating it the next. In Generations, quick edits on secondary parameters exposed that edge, so I collapsed create and update into one route and made the write path idempotent enough for rapid input."
date: "2025-09-25T20:20:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/companies/ivfqc.png"
tags: ["IVFQC", "Althea Science", "Rails", "JavaScript", "Autosave", "Race Conditions"]
---

# Fixing a fast autosave race in Generations

Autosave bugs are rarely about one request.

They're about *timing*.

I ran into that in Generations while working on the procedure screens. Users could type quickly through secondary parameter fields and rely on autosave to keep up. Most of the time it did. Then the edge case showed up: a field could be in the awkward state between "this value doesn't exist yet" and "this value now exists and should be updated," and quick edits could hit both sides of that boundary too fast.

That's where a clean CRUD split starts working against you.

If one request is still acting like a create while the next one already assumes update semantics, the browser and server can disagree about what operation is supposed to happen.

That disagreement is enough to create flaky saves.

## The front end was switching forms from POST to PUT after the first save

This pattern was already in the app.

After a successful save, the client updated the form so the next edit would be treated as an update instead of a create:

```javascript
if (form.find('[value~=put]').length == 0 ){
  form.prepend('<input type="hidden" name="_method" value="put">');
}
```

That happened in `SecondaryParameterDataEntry.autoSaveDone`.

The idea made sense. First request creates the record. Later requests update it.

The problem was the timing window between those two states.

If the user typed and autosave fired again before the UI had fully crossed that boundary, the request path could still be wrong. And because this feature lived inside a queued autosave system, that mismatch didn't always look like a clean immediate failure. It looked like a save path that was just unreliable under speed.

I don't like systems that only work when the user types politely.

## The fix was to stop asking the client to pick the right verb

Instead of making the browser decide whether this write was a create or an update, I added a single endpoint that handled both:

```ruby
put '/zombie_procedure_values_create_or_update' => 'zombie_procedure_values#create_or_update'
```

Then I pointed the autosave form at that route:

```erb
<%= form_tag("/zombie_procedure_values_create_or_update", method: :put, remote: true,
  class: "autosave-secondary-parameter-form", onsubmit: "return false;") do %>
```

That moved the branching logic to the server, where it belonged.

The controller action looked up existing values by the parameter id and the set of completion ids. If matching rows already existed, it updated them. If not, it created them inside a transaction:

```ruby
def create_or_update
  values = ZombieProcedureValue.where(
    zombie_procedure_parameter_id: params[:zombie_procedure_values][:zombie_procedure_parameter_id],
    zombie_procedure_completion_id: zombie_procedure_completion_ids
  )

  if values.present?
    values.update_all(data: params[:zombie_procedure_values][:data].to_s)
  else
    ActiveRecord::Base.transaction do
      zombie_procedure_values_params.each do |value_data|
        ZombieProcedureValue.create(value_data)
      end
    end
  end
end
```

That wasn't a pure textbook upsert, but it was enough to remove the fragile handoff from POST to PUT in the middle of active typing.

That's what I needed.

## I kept the side effects in the unified path too

This controller wasn't only saving a value.

That particular procedure flow also had downstream behavior tied to cryopreservation events and attempt-level aggregate data. So the create-or-update action had to preserve those side effects instead of being a narrow persistence shortcut.

The action recalculated the event timestamp when the saved parameter represented time:

```ruby
if ((completions.first.procedure_slug.include? "cryopreservation") &&
    (params[:zombie_procedure_values][:parameter_slug].include? "time"))

  date = params[:zombie_procedure_values][:moment_date]
  datetime = Time.zone.parse(date + " " + params[:zombie_procedure_values][:data].to_s)

  events = Event.where(event_type: 'cryopreservation',
    zombie_id: completions.map(&:zombie_id), attempt_id: attempt_id)

  events.map { |event| event.update(happened_at: datetime) }
end

BulkAttemptData.update_attempt_storage_data_for([attempt_id])
```

I mention this because it's easy to describe these fixes like they're just routing changes.

They aren't.

In a real Rails app with history, the write path often has product meaning attached to it. If I had "simplified" this by making a tiny alternate endpoint that only updated one table, I would've risked fixing the race and breaking the surrounding workflow.

The better move was to make the write semantics more stable *without* stripping away the rest of the behavior.

## The queue work made this bug visible, and also shaped the fix

I don't think this race would have been as obvious without the autosave queue work that came before it.

Once writes were serialized and retried more reliably, the remaining failures stood out more clearly. They stopped looking like generic flaky connectivity and started looking like operation mismatches.

That distinction matters.

A bad connection means "try again later."

A create-vs-update race means "your write model is confused."

Those are different classes of problem, and they need different fixes.

The queue solved transport resilience. This controller change solved write-path ambiguity.

Together they made autosave feel a lot more honest.

## I also tightened the listeners around fast-changing inputs

Part of this work showed up in the JavaScript listeners too.

Number fields were using `keyup input`, not just `change`, so autosave would catch arrow-button changes and not miss quick edits:

```javascript
$('.main').on('keyup input','.autosave-secondary-parameter-form input[type="number"]', delayedCallback);
```

That seems small. It isn't.

The browser fires different events for different kinds of interaction, and number fields are one of those places where "works when you type" is not the same as "works when you use the control normally." I made similar adjustments in other Generations autosave commits because missing events are another way to create false confidence around save behavior.

If the app is going to save in the background, it needs to notice what the user actually did.

## Good autosave work reduces the number of states the client can get wrong

That's the real lesson from this fix.

When a user is moving quickly, every extra client-side state transition is another place for timing bugs to hide. "This form is now a create." "Now it is an update." "Now the hidden method changed." "Now the route changed." That stack can work, but it gives you a lot of edges to defend.

The create-or-update endpoint removed one of those edges.

The browser no longer had to be perfectly synchronized with record existence in order to send a valid write.

I like that kind of fix because it doesn't just patch the symptom. It makes the system less sensitive to timing in the first place.

That's what autosave needs.

Not just speed.

Fewer ways to be wrong.
