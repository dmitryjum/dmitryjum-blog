---
title: "Restoring auth state in a React app with Redux"
excerpt: "A stored token is not the same thing as a live session. This React app restored auth state by reading a token from localStorage, verifying it against the Rails API, and rebuilding the UI from that response."
date: "2025-10-16T15:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/intro_shot.jpg"
tags: ["React", "Redux", "API", "Rails"]
---

# Restoring auth state in a React app with Redux

Frontend auth gets tricky when the app reloads.

The user may still have a token in local storage. The UI may not know whether to trust it yet. The app has to decide whether the person is really signed in before it shows edit controls or protected screens.

That was the auth flow in `us_schools_ui`.

The app was the frontend half of a small pair. `us_state_universities` handled data and auth in Rails, and `us_schools_ui` handled search and editing in the browser. This post is about how that frontend restored auth state after a reload.

I didn't treat a stored token as enough. The app had to verify it with the Rails API before deciding the user was still signed in.

## Login wrote the token into storage and the store

The login action did two jobs:

```js
export function logIn(params = {}) {
  return dispatch => {
    USUApi.logIn(params)
      .then(resp => {
        localStorage.setItem('auth_token', resp.data.auth_token)
        dispatch(
          logInSuccess({
            currentUser: {
              email: resp.data.email,
              auth_token: resp.data.auth_token
            },
            isAuthenticated: true,
```

The token went into `localStorage`, and the current user data went into Redux.

That let the app react immediately after login without waiting for another round trip.

## App startup verified the stored token

The layout component checked auth state when it mounted:

```jsx
componentDidMount() {
  this.props.actions.getCurrentUser()
}
```

That action did not just read from local storage and assume the user was still signed in.

It read the token, then asked the API to verify it:

```js
export function getCurrentUser() {
  const storedJWT = localStorage.getItem('auth_token')
  return dispatch => {
    if (storedJWT) {
      USUApi.isAuthenticated(storedJWT)
        .then(resp => {
          dispatch(
            logInSuccess({
              currentUser: {
                email: resp.data.email,
                auth_token: storedJWT
              },
              isAuthenticated: true,
```

That distinction mattered.

A token in the browser is only a client-side fact. I wanted the UI to wait for the server's answer before treating the user as signed in.

## Failure cleared the session shape

If the token check failed, the action used the same failure path as a bad login:

```js
function logInFailureCallBack(error, dispatch) {
  dispatch(
    logInFailure({
      currentUser: {},
      isAuthenticated: false,
      logInMessage: {
        type: "warning",
        messages: [error.response.data.error]
      }
    })
  )
}
```

That kept the store state consistent. A bad login and an expired stored token both lead to the same place: unauthenticated. No need for two different error shapes.

## Logout removed both client-side copies

Logout also did the two obvious jobs:

```js
export function logOut() {
  localStorage.removeItem("auth_token")
  return {
    type: LOG_OUT,
    payload: {
      signUpMessage: {},
      logInMessage: {},
      currentUser: {},
      isAuthenticated: false
    }
  };
}
```

It removed the stored token and cleared the auth data in Redux.

That meant the navigation and the rest of the app could switch immediately.

The layout used `isAuthenticated` to decide what to render. That's not just nav stuff — it also controlled whether editing features existed in the UI at all.

```jsx
if (this.props.isAuthenticated) {
  return <Navbar.Brand href="/">Welcome Home {this.props.currentUser.email}</Navbar.Brand>
} else {
  return <Navbar.Brand href="/">Home</Navbar.Brand>
}
```

It also switched the nav links:

```jsx
if (this.props.isAuthenticated) {
  return <Nav.Link href="#" onClick={(e) => this.logOut(e)}>Log Out</Nav.Link>
} else {
  return (
    <>
      <Nav.Link href="/signup">Sign Up</Nav.Link>
      <Nav.Link href="/login">Log In</Nav.Link>
    </>
  )
}
```

And the login route itself was guarded:

```jsx
const PrivateRoute = ({component: Component, authenticated, ...props}) => {
  return (
    <Route
      {...props}
      render={(props) => !authenticated
        ? <Component {...props} />
        : <Redirect to='/' />}
    />
  )
}
```

The naming there is a little backwards. It blocks the login page for authenticated users rather than protecting a private page, but the behavior is clear.

## Auth also controlled editing behavior

The app did not use auth only for navigation.

It also used it to decide whether editing features should exist in the UI at all.

The search bar only showed the "New School" button when the user was authenticated:

```jsx
function newSchoolButton() {
  if (!isAuthenticated) return null;
  return <Button variant="outline-warning" onClick={handleNewSchool}>New School</Button>
}
```

And the school list only showed edit controls for authenticated users:

```jsx
function schoolModalButton(school) {
  if(isAuthenticated) {
    return(
      <Button
        onClick={() => {dispatch(openModal({school}))}}>
          Edit School
      </Button>
    )
  }
}
```

That was an important part of the flow.

Auth was not just a token utility. It was part of how the app decided what the user could actually do.

## What I'd do differently

I'd still verify the stored token server-side. That part was right.

I'd add clearer auth phases — `unknown`, `authenticated`, `unauthenticated` — instead of relying on a boolean. App startup is easier to reason about when there's a third state for "we haven't checked yet." I'd also avoid putting the raw token in Redux unless something in the UI actually needed it there.

A stored token isn't the session. The server's answer is.

The full source for this project is on GitHub: [github.com/dmitryjum/us_schools_ui](https://github.com/dmitryjum/us_schools_ui)
