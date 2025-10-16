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

The app was the frontend half of a small pair. `us_state_universities` handled the data and auth endpoints in Rails, and `us_schools_ui` handled the browser UI for searching schools and editing them when the user was signed in. This post is about how that frontend restored auth state after a reload.

I did not treat a stored token as enough. I restored auth state by checking the token with the Rails API and then rebuilding the UI from the result.

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

That kept the store state consistent.

I did not need one error shape for failed login and another for expired or invalid stored tokens. Both led back to an unauthenticated state.

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

## The UI was driven by verified auth state

The layout component used `isAuthenticated` to decide what to render:

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

## What I would change now

I would still verify the stored token against the server before trusting it.

I would probably separate the auth state into clearer phases like:

- unknown
- authenticated
- unauthenticated

That would make app startup easier to reason about.

I would also likely avoid storing the raw token in Redux unless the UI really needed it there, and I would tighten the naming around the route guard.

A stored token is not the session. The server's answer is.

The full source for this project is on GitHub: [github.com/dmitryjum/us_schools_ui](https://github.com/dmitryjum/us_schools_ui)
