---
title: "A session timeout warning that doesn't get in the way"
excerpt: "Security features get worse when they surprise people. In Generations and Reflections, I built a session monitor that warned before sign-out, let the user extend the session with a small interaction, and fixed the timer bugs that could have signed them out anyway."
date: "2025-09-23T20:10:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/companies/ivfqc.png"
tags: ["IVFQC", "Althea Science", "Rails", "JavaScript", "Security", "Session Management"]
---

# A session timeout warning that doesn't get in the way

Forced sign-out is one of those features everybody agrees with in theory and hates in practice.

You need it. You also don't want it to kick someone out while they're still working.

At IVFQC, both Generations and Reflections had authenticated screens where users could spend real time entering and reviewing lab data. Letting sessions live forever wasn't a serious option. But the brute-force version of timeout handling, where the server just expires the token and the app lets the next request fail, is a bad user experience.

People read that as randomness.

I wanted the app to do three things well:

- know when the current session would expire
- warn the user before that happened
- restart the timing cleanly if the user chose to keep working

The first part meant the browser needed the real expiration time, not a guessed timeout hardcoded in JavaScript.

## I treated expiration as server truth

The monitor started by calling a lightweight endpoint:

```javascript
getCurrentExpiration: function() {
  var promise = $.Deferred();
  $.ajax('/auth/session-ping', {
    type: 'GET',
    contentType: 'application/json',
    dataType: 'json',
    success: function(response) {
      promise.resolve(response.expiration_time);
    },
    error: function() {
      var error = 'unable to receive token expiration time';
      promise.reject(error);
    }
  });
  return promise;
}
```

That endpoint gave the browser a concrete expiration timestamp. Then the client built timers from that value:

```javascript
initialize: function(alertMins) {
  this.getCurrentExpiration().done(function(res) {
    new SessionTimers(Date.parse(res), alertMins).setTimers()
  })
}
```

This was important.

I didn't want frontend code making up a session lifetime and hoping it matched what the auth layer believed. The server knew when the token expired. The client just needed to react to it.

## The warning and the sign-out used separate timers

The timer object was small on purpose:

```javascript
function SessionTimers(expirationTime, alertMins) {
  this.exp = expirationTime
  this.alert = alertMins
  this.tokenTimerId;
}

SessionTimers.prototype = {
  setTimers: function() {
    this.alertTimer();
    this.tokenTimer();
  },

  signOut: function() {
    window.location = '/auth/sign-out';
  }
}
```

There were really two deadlines hiding inside one session:

- the point where the user should be warned
- the point where the user should be signed out

The sign-out timer was straightforward:

```javascript
tokenTimer: function() {
  var timeBeforeSignOut = this.exp - Date.now()
  this.tokenTimerId = setTimeout(this.signOut, timeBeforeSignOut)
}
```

The warning timer was the more interesting one:

```javascript
alertTimer: function() {
  var timeBeforeAlert = (this.exp - (this.alert * 60 * 1000)) - Date.now()
  setTimeout(function() {
    $('#page-content-wrapper').prepend(SessionMonitor.warningMessage);
    $('.session-alert').on('closed.bs.alert', {ST: this}, function (e) {
      clearTimeout(e.data.ST.tokenTimerId);
      SessionMonitor.initialize(e.data.ST.alert);
    })
  }.bind(this), timeBeforeAlert)
}
```

The browser waited until the configured warning window, showed a dismissible alert, and then used that dismissal as a small "I'm still here" signal.

No modal. No giant interruption. Just enough friction to prove the user was active.

That's the whole design.

## Closing the alert did more than hide the message

This is where the feature got subtle.

At first glance, closing the warning looks like a UI concern. It wasn't. It was really a timer-lifecycle concern.

If the user closed the warning, I needed to do two things immediately:

- cancel the sign-out timer based on the *old* expiration window
- fetch current expiration again and start fresh timers

If you skip the first step, you get a nasty bug. The new timer starts, but the old one is still alive in memory. Then the user gets signed out anyway when that old timeout fires.

Wild bug. Also easy to miss if you only test the happy path once.

That exact bug showed up later, and I fixed it in both apps by keeping the timer id and clearing it before re-initializing:

```javascript
$('.session-alert').on('closed.bs.alert', {ST: this}, function (e) {
  clearTimeout(e.data.ST.tokenTimerId);
  SessionMonitor.initialize(e.data.ST.alert);
})
```

This was one of those small diffs that mattered more than a larger feature.

Without it, the monitor *looked* right and still betrayed the user.

## I added tests around time itself

Time-based behavior gets slippery fast if you only click around manually.

So I added Jasmine tests that simulated the clock and asserted the things I cared about:

- initialization happens with the expected alert window
- closing the alert re-initializes the monitor
- the old token timer is cleared and does not sign the user out

The regression test was the important one:

```javascript
it('clears old tokenTimer when alert message is closed', function() {
  spyOn(SessionTimers.prototype, 'signOut');
  var alertCloseSpy = spyOnEvent('.session-alert', 'closed.bs.alert');
  $('.session-alert').trigger('closed.bs.alert');
  jasmine.clock().tick(30000)
  expect(SessionTimers.prototype.signOut).not.toHaveBeenCalled()
})
```

That's the kind of test I trust.

Not "it renders an alert." Not "the method was invoked." The thing I actually cared about was simpler: after the user interacted with the warning, the stale sign-out path could no longer fire.

## The same pattern worked in two apps because the core problem was the same

One thing I liked about this feature is that it wasn't tied to one screen or one product branch.

Generations and Reflections had different DOM anchors for where the alert should appear, but the model was the same in both places:

- ping for expiration
- schedule a warning
- schedule sign-out
- let the user affirm activity
- reset cleanly

That made the code portable. The session monitor object and timer object stayed nearly identical across both apps, with only small UI differences around where the warning banner got inserted.

That's usually a good sign. When a feature survives across products with only minor adaptation, it means the abstraction is probably about the real problem and not one page's markup.

## Security work is product work

I think a lot of teams still talk about security features like they're separate from user experience.

They're not.

If you protect a system in a way that feels arbitrary, people stop trusting the product. If you give them a little context and a predictable recovery path, the same control feels reasonable.

That's what I wanted here.

Don't wait for the next failed request to tell the user something expired.

Tell them before it happens. Give them a small way to stay active. Make the reset logic correct. Test the timer bug that will absolutely happen if you don't.

Security is part of the interface. That's the point.
