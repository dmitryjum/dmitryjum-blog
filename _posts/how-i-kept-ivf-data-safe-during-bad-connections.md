---
title: "Keeping IVF data safe during bad connections"
excerpt: "An autosave feature is easy to pitch and easy to get wrong. The real work was making sure form writes survived unstable internet, page reloads, and rapid-fire input across a Rails app full of live data entry."
date: "2025-09-24T20:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/companies/ivfqc.png"
tags: ["IVFQC", "Althea Science", "Rails", "JavaScript", "Autosave", "LocalStorage"]
---

# Keeping IVF data safe during bad connections

The easiest way to lose trust in a lab app is to lose someone's data.

That sounds obvious, but it's the kind of problem that hides in plain sight when a product mostly works on office Wi-Fi and a developer laptop.

At IVFQC, both Generations and Reflections had screens where people were entering operational data quickly, field after field, often without pausing to think about whether a network request had finished. That's normal behavior. Nobody wants to stop and wait for a spinner while moving through a workflow.

Here's the problem: the old version of autosave depended too much on the request that had *just* been fired. If the connection dropped, if the request timed out, or if the page refreshed at the wrong moment, you could end up with values that the user thought were saved but never made it to the server.

I didn't want "autosave" to mean "we tried."

I wanted it to mean the browser kept enough intent around to finish the write later.

## The browser needed a write-ahead log

The core idea was simple.

Every autosave action had to become a small request object. That object needed to be persisted before the network got a chance to fail. LocalStorage was good enough for that job.

The queue object handled the storage side:

```javascript
RequestQueue = {
  requests: function(queueType) {
    if(queueType == undefined) throw new Error("Missing an argument, queueType string is required")
    if (localStorage['queues']) {
      return JSON.parse(localStorage.queues)[queueType] != undefined ?
       localStorage.getObject('queues')[queueType] :
        localStorage.setObject('queues', Object.assign({[queueType]: []}, localStorage.getObject('queues')))[queueType]
    } else {
      return localStorage.setObject('queues', {[queueType]: []})[queueType];
    };
  },

  enque: function(queueType, request) {
    var updatedQueue = this.requests(queueType).concat([request])
    localStorage.setObject('queues', {[queueType]: updatedQueue})
    PubSub.emit(REQUEST_ENQUEUED, queueType);
  }
}
```

That lived in the Reflections app, and the Generations version used the same shape with jQuery events instead of the small PubSub helper.

I like this because it turns the problem into something concrete. Don't argue about connectivity. Serialize the user's intended write and keep it somewhere durable in the browser.

That changed the contract.

The request wasn't "gone" just because the server didn't answer right away.

## Autosave became a queue consumer, not a click side effect

Once requests were durable, the next step was to make the save layer process them in order.

That logic lived in `DataEntryHandler`:

```javascript
autoSaveQueue: function() {
  RequestQueue.requests('autoSaveQueue').slice(0,1).forEach(function(params) {
    params = Object.assign({
      dataType: 'json',
      beforeSend: beforeSendCb,
      success: successCb,
      error: errorCb
    }, params);

    $.ajax(params)
  })
}
```

It only pulled the first item from the queue. That's the point.

I didn't want a burst of keystrokes to create a burst of overlapping writes that raced each other to the server. I wanted one request in flight, then the next, then the next. If a save succeeded, the handler removed the first item and immediately tried the next one. If a save failed with a connectivity issue, the item stayed in the queue and the handler retried a few seconds later.

That gave the system two useful properties:

- writes stayed ordered
- failures became recoverable instead of silent

Those two things matter more than a fancy autosave badge.

## I moved the queue boundary up into shared form logic

The queue only works if every entry point uses it.

Both apps had enough different data-entry surfaces that I didn't want each one reinventing save behavior. In Generations I started pushing common behavior into a parent object that all those entry flows could call.

The shared method looked like this:

```javascript
autoSave: function(item, queueType, inputCompoundId) {
  var entry_form = item.closest('form');
  var type = entry_form.attr('method');
  if (entry_form.find('input[name="_method"]').length > 0) {
    type = entry_form.find('input[name="_method"]').val()
  }
  $('body').triggerHandler(AUTOSAVE, {
    queueType: queueType,
    request: {
      type: type,
      url: entry_form.attr('action'),
      data: entry_form.serialize(),
      inputCompoundId: inputCompoundId
    }
  })
}
```

What I like here is that the form code stopped caring about retry logic.

The feature-specific listener only had to answer a few questions:

- which form is this input part of
- what queue should handle it
- how long should the debounce be

Everything after that went through the same path.

That made the queue reusable across global data entry, zombie procedures, droplet inputs, and secondary parameters. Different screens. Same behavior.

## The UX had to admit when the internet disappeared

I didn't want the app to quietly pile up writes and pretend nothing was wrong.

If the connection dropped, the screen needed to say so. If it came back and the queue resumed, the screen needed to say that too.

The retry path handled that:

```javascript
if (status === 'timeout' || status === "error") {
  var internetWarning = '<div class="alert alert-info internet-response">' +
   'Connection lost. Data will save when reconnected.' +
  '</div>'

  if ($('.main').find('.internet-response').length > 0) {
    $('.internet-response').replaceWith(internetWarning);
  } else {
    $('.main').find('.card').first().before(internetWarning);
  }

  setTimeout(function() {
    if (RequestQueue.requests(this.queueType).length > 0) DataEntryHandler.autoSave(this.queueType)
  }.bind(this), 3000)
}
```

That wasn't dramatic UI work. It was operational honesty.

Users could keep entering data and know what was happening. When the page loaded again later, `completeAllQueues()` checked localStorage, resumed any unfinished work, and showed a message that the earlier connectivity issue seemed to be resolved.

That's the part I still like most. The browser remembered unfinished intent and the app had the manners to explain itself.

## Some failures should retry. Some should get out of the way

One detail from the Generations version mattered a lot.

Not every failed request should stay in the queue forever.

There were cases where the server returned `422 Unprocessable Entity`, not because the connection was bad, but because the requested change itself was invalid. One example in the code comments was decreasing the number of oocytes when the business rules no longer allowed it.

For that case, I explicitly removed the failing request from the queue:

```javascript
if (error === "Unprocessable Entity") {
  RequestQueue.spliceRequests(this.queueType, 0, 1);
  if($('.autosave-status').length > 0) $('.autosave-status').html('- Failed.');
  return;
};
```

That's a small branch, but it's the difference between a resilient queue and a zombie queue.

Retry transport failures.

Don't retry validation failures forever.

## I tested the boring parts because those were the product

This work wasn't the kind of thing you validate with one happy-path integration test and call finished.

I added JavaScript specs around the mechanics that actually mattered:

- creating missing queue buckets in localStorage
- appending requests in order
- splicing requests after success
- emitting queue events
- resuming outstanding queues after reload

That mattered because the product promise wasn't "there is autosave code in the repo."

The promise was stronger than that. If the user typed, the app kept trying until the write either succeeded or failed for a real business reason.

That's not glamorous work.

It's still some of my favorite work.

When software deals with health workflows, "probably saved" isn't good enough. You want a system that assumes the network will disappoint you and plans around it.

That's all.
