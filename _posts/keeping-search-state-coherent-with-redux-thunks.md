---
title: "Keeping search state coherent with Redux thunks"
excerpt: "The harder part of a search UI is not rendering results. It is keeping search terms, filters, pagination, and list updates from drifting out of sync. This React app used Redux thunks to keep those pieces moving together."
date: "2025-10-15T14:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/intro_shot.jpg"
tags: ["React", "Redux", "Search", "API"]
---

# Keeping search state coherent with Redux thunks

Search UIs get messy once they stop being a single text box.

This app had a search term, field-based filters, pagination, and a "load more" button. On top of that, users could edit records in a modal and expect the list to still make sense afterward.

That was the real state problem in `us_schools_ui`.

The bigger setup was straightforward. `us_state_universities` provided the school data through a Rails API, and `us_schools_ui` was the React frontend for browsing and editing it. This post is about the frontend side, where search and list state had to stay coherent while the user moved around the app.

The backend was simple enough. The harder part was keeping the frontend's idea of the list coherent as different actions changed it.

## Search state lived in the store

The reducer kept the main pieces together:

```js
const initialState = {
  records: [],
  schoolPage: 1,
  per_page: 10,
  filter: {},
  search: {},
  totalPages: null,
  error: null
}
```

That state shape did not try to do too much.

It kept:

- the current records
- the current page
- the page size
- the active filter
- the active search term
- the total page count

That was enough to rebuild the next request from the current UI state.

## Each action reset or advanced state on purpose

The reducer made a few important decisions:

```js
case SET_SEARCH:
  return {
    ...initialState,
    search: action.payload.search
  };

case SET_FILTER:
  return {
    ...initialState,
    filter: action.payload.filter,
  }

case ADD_SCHOOLS:
  return {
    ...state,
    schoolPage: action.payload.schoolPage,
    totalPages: action.payload.data.pages_per_limit,
    records: state.records.concat(action.payload.data.records)
  }
```

A new search reset the list back to the first page.

A new filter did the same thing.

"Load more" did not replace the list. It appended records and advanced the page counter.

That sounds small, but this is where search UIs often drift. If the page is not reset when the query changes, the app can ask for the wrong slice of data. If append and replace behavior are mixed up, the list starts lying.

## The thunks rebuilt requests from current state

The search thunk stored the new term, then built the request from the store:

```js
export function search(params = {'term': ''}) {
  return (dispatch, getState) => {
    dispatch(setSearchThunk({search: params}))
    params = {
      ...params,
      page: getState().schools.schoolPage,
      per_page: getState().schools.per_page
    }
    USUApi.search(params)
      .then(resp => {
        dispatch(searchSuccessThunk(resp))
      })
```

The filter flow did the same thing in a slightly different order:

```js
export function findByKey(params = {}) {
  return (dispatch) => {
    dispatch(setFilterThunk({filter: params}));
    dispatch(requestSchools())
  }
}
```

And the "load more" thunk rebuilt the next request from whatever state was active at that moment:

```js
export function addMoreSchools(params={}) {
  return (dispatch, getState) => {
    params = {
      ...getState().schools.search,
      ...getState().schools.filter,
      page: getState().schools.schoolPage + 1,
      per_page: getState().schools.per_page
    };
```

That was the useful part of the setup.

The app did not treat search, filter, and pagination as separate features. It treated them as different inputs into one request shape.

## The UI could stay simple because the state logic was not scattered

The search component just dispatched a term:

```jsx
const handleClick = () => {
  dispatch(search({ term: searchRef.current.value}))
}
```

The top-keys sidebar just dispatched a filter:

```jsx
handleClick(key) {
  this.props.findByKey({ details: key });
}
```

And the home view just asked for more results:

```jsx
<Button
  onClick={() => this.props.actions.addMoreSchools()}
>
  More schools!
</Button>
```

That separation helped.

The components did not need to know how to merge query state, how to increment pages, or whether the next request should go to the generic list endpoint or the search endpoint. The thunk layer handled that.

## The app switched between replace and append based on intent

This line in `addMoreSchools` mattered:

```js
const fetchSchools = params['term'] === undefined ?
  USUApi.getSchools(params) : USUApi.search(params)
```

It let the app preserve the active mode.

If the user was browsing filtered schools, "load more" continued that browse flow.

If the user was looking at a search result, "load more" continued the search.

That sounds obvious, but it is one of the easiest pieces to break when query state is spread across components instead of reconstructed in one place.

## Editing records made the state problem more obvious

The modal in this app could create or update a school, then refresh the list:

```js
USUApi.updateSchool(params)
 .then(resp => {
    dispatch(openModal({resp}))
    dispatch(requestSchools())
 })
```

That worked, but it also exposed the next state problem clearly.

After an edit, should the app:

- keep the current search term?
- keep the current filter?
- keep the current page?
- replace the list?
- append into the existing list?

That is the real challenge in interfaces like this. Search state is not just about fetching data. It is about preserving the user's context while the underlying collection changes.

I wanted the app to keep the list feeling stable even after a record changed. If someone had filtered by a detail key or searched by a term, that context still mattered after an edit. Otherwise the UI would jump back into a generic state and make the user rebuild their place.

## What I would change now

I would still keep the query state in one place.

But I would probably make the active search and filter state URL-driven so refreshes and back-button behavior worked more naturally. I would also separate "query state" from "records state" a bit more clearly.

Search terms, filters, pagination, and list updates belong to the same state story. Once the app treats them that way, the UI gets much easier to reason about.

The full source for this project is on GitHub: [github.com/dmitryjum/us_schools_ui](https://github.com/dmitryjum/us_schools_ui)
