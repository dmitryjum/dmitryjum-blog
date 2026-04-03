---
title: "Editing arbitrary JSON in React is harder than it looks"
excerpt: "A fixed form is straightforward. A UI that lets people edit unknown key-value pairs is not. This React app sat on top of a schema-flexible Rails API, and the hard part was managing state while the shape of the data kept changing."
date: "2025-10-13T16:00:00.000Z"
author:
  name: Dmitry Jum
  picture: "stellar/images/intro_shot.jpg"
ogImage:
  url: "/stellar/images/intro_shot.jpg"
tags: ["React", "Redux", "API", "Search"]
---

# Editing arbitrary JSON in React is harder than it looks

A fixed form is straightforward.

You know the fields. You know the validation rules. You know which input maps to which property.

This was not that.

In `us_schools_ui`, the frontend sat on top of a Rails API where each school had a flexible `details` object. That worked well for the backend because scraped school pages did not all share the same schema.

The setup was a pair of small apps. `us_state_universities` scraped and served the school data. `us_schools_ui` was the React frontend for browsing, searching, signing in, and editing those records. This modal sat right in the middle of that editing flow.

It made the editor harder.

Once the client lets users edit arbitrary key-value pairs, it is not really a normal form anymore. It is a small data-structure editor.

## The modal had to edit shape, not just values

The school editor lived in one component:

```jsx
const SchoolModal = () => {
  const modalShow = useSelector(state => state.schoolModal.show);
  const school = useSelector(state => state.schoolModal.school);
  const user = useSelector(state => state.user.data.currentUser);
  const dispatch = useDispatch();
```

This is not a local "open a dialog and submit a form" component. It reads the current record out of Redux because the modal needs to work for both:

- editing an existing school
- creating a new one
- staying globally available from anywhere in the app

That global placement is why the modal is mounted next to the main layout in the app root:

```jsx
function Root() {
  return (
    <Provider store={store}>
      <Layout />
      <SchoolModal />
    </Provider>
  );
}
```

If a modal is truly app-level UI, keeping it in app-level state can be simpler than threading props through a large tree.

## Adding and deleting rows was the easy part

The UI let users add a blank detail row:

```jsx
const addARow = () => {
  school.details[""] = ""
  dispatch(closeModal())
  dispatch(openModal({ school }))
}
```

And remove an existing one:

```jsx
const deleteRow = (e) => {
  const nearestKey = e.target.closest('div.row').querySelector("input[name='Key']").value;
  delete school.details[nearestKey];
  dispatch(closeModal())
  dispatch(openModal({ school }))
}
```

When the form fields are not known ahead of time, "add field" and "remove field" become core state transitions.

I used the close-and-reopen pattern because I wanted a clean rerender after every structural change, and Redux was the shared place I could use for that state.

## Renaming a key is the part people underestimate

Changing a value is normal:

```jsx
school.details[nearestKey] = e.target.value;
```

Changing a *key* is different.

You can't just update the label. You have to:

1. remember the old key
2. read the existing value from that key
3. delete the old property
4. write the value back under the new key

That's what this handler was doing:

```jsx
const handleKeyChange = (e) => {
  const currentValue = school.details[oldKey];
  delete school.details[oldKey];
  school.details[e.target.value] = currentValue;
  dispatch(openModal({ school }));
  oldKey = e.target.value
}
```

This is the hard part of schema-flexible editing in a small snippet.

If the UI lets users rename keys, the identity of a field is unstable while the person is typing. The state model cannot assume the field name is a permanent identifier.

## The component used delayed writes to keep typing usable

Typing into a dynamic object editor can get noisy fast, so the modal introduced a timed change helper:

```jsx
function onTimedChange(e, handler) {
  e.persist()
  clearTimeout(timer)
  timer = setTimeout(() => {
    handler(e);
  }, 500)
}
```

Then the inputs ran through that instead of dispatching on every keystroke.

That reduced churn while the user was mid-edit, especially because the component kept reopening itself with updated modal state.

Today I would probably handle that differently. I would keep the draft object in local component state or a reducer, then dispatch once on save. But the underlying problem has not changed: arbitrary object editing creates many temporary, half-valid states, and the UI has to decide whether to commit them immediately or stage them.

Most form examples assume the schema is stable. This modal was dealing with unstable keys, unstable row count, and field names that were temporarily invalid while the person was typing. That is a different class of UI problem.

## Redux was coordinating search state and editor state at the same time

The modal wasn't living in isolation either.

The same app also had to keep search term, filter state, pagination, and append behavior lined up in Redux thunks:

```js
params = {
  ...getState().schools.search,
  ...getState().schools.filter,
  page: getState().schools.schoolPage + 1,
  per_page: getState().schools.per_page
};
```

And the reducer had to decide when to replace versus append:

```js
case ADD_SCHOOLS:
  return {
    ...state,
    schoolPage: action.payload.schoolPage,
    totalPages: action.payload.data.pages_per_limit,
    records: state.records.concat(action.payload.data.records)
  }
```

That matters because editing a school is not just "save the form." The list on the page still needs to make sense afterward. The selected search mode still needs to make sense. The pagination state still needs to make sense.

The action layer was carrying a lot of that coordination:

```js
export function findByKey(params = {}) {
  return (dispatch) => {
    dispatch(setFilterThunk({filter: params}));
    dispatch(requestSchools())
  }
}
```

and:

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

That is where I was keeping the user's intent alive: in the coordination between search state, list state, and edit state.

That was the tension in the app. After a school changed, I still wanted the list to respect the user's current search and filter context instead of dropping them back into a generic state.

## The stack is older, but the problem is not

This app uses React, Redux, thunks, class components in some places, hooks in others, and a few patterns I'd reshape now.

The real problem here still shows up in modern apps:

- an API allows flexible metadata
- the UI wants to expose that flexibility to users
- editing shape is harder than editing values
- global state and local draft state start fighting each other

The tools have changed. The problem has not.

## What I'd do now

If I were rebuilding this today, I'd probably keep the draft school object local to the modal and use a reducer with explicit actions like:

- `rename_key`
- `set_value`
- `add_row`
- `delete_row`
- `reset_from_record`

Then I'd submit one clean payload back to the API and let the list refresh against the active search state.

Same product goal, with better separation of concerns.

I'd also probably make the search and filter state URL-driven so refreshes and back-button behavior feel more natural. Once a list view starts combining search, filtering, pagination, auth, and editing, hiding all of that state inside Redux gets harder to reason about.

Rendering a list is easy.

Letting someone edit unknown structure without losing track of the rest of the page is harder.

The full source for this project is on GitHub: [github.com/dmitryjum/us_schools_ui](https://github.com/dmitryjum/us_schools_ui)
