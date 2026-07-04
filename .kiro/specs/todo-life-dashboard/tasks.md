# Implementation Plan: Todo Life Dashboard

## Overview

Nine implementation phases for a single-page Vanilla JS task manager: scaffolding, Storage Module, State Module, View Module, event handlers, CSS/responsive layout, Jasmine unit tests, fast-check property-based tests, and a manual/visual verification checklist.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": [1] },
    { "wave": 2, "tasks": [2] },
    { "wave": 3, "tasks": [3] },
    { "wave": 4, "tasks": [4, 6] },
    { "wave": 5, "tasks": [5] },
    { "wave": 6, "tasks": [7, 8] },
    { "wave": 7, "tasks": [9] }
  ],
  "dependencies": {
    "2": [1],
    "3": [2],
    "4": [3],
    "5": [4],
    "6": [1],
    "7": [5, 6],
    "8": [5, 6],
    "9": [7, 8]
  }
}
```

## Tasks

- [x] 1. Create project file structure and HTML boilerplate
  - Create `index.html` with valid HTML5 doctype, `<meta charset>`, `<meta viewport>`, title "Todo Life Dashboard", and links to `css/style.css` and `js/app.js`
  - Create `css/style.css` as an empty file with a top comment block
  - Create `js/app.js` as an IIFE skeleton: `(function() { 'use strict'; })();`
  - Add the static HTML shell inside `<body>`: `<header>`, `<main>` containing `<section id="dashboard">`, `<section id="controls">`, `<section id="task-form">`, `<section id="task-list">`
  - Add the task form markup inside `#task-form`: title input, due-date input (`type="date"`), priority select (low/medium/high, default medium), submit button, and `<p id="form-error">` for validation messages
  - Add filter tab buttons (`data-filter="all|pending|completed"`) and sort dropdown (`data-sort="created|dueDate|priority"`) inside `#controls`
  - Add summary markup inside `#dashboard`: three `<span>` elements for total/completed/pending counts and a `<progress>` element for the progress bar
  - Add `<script src="js/app.js"></script>` just before `</body>`
  - **Acceptance criteria**: `index.html` opens without console errors; all four `<section>` IDs are present; form contains title input, date input, priority select, and submit button; `css/style.css` and `js/app.js` load without 404 errors; IIFE executes without throwing

- [~] 2. Implement the Storage Module in `js/app.js`
  - Define `const STORAGE_KEY = 'todo_life_dashboard_tasks';` inside the IIFE
  - Implement `loadTasks()`: reads `localStorage.getItem(STORAGE_KEY)`, returns `[]` if null/missing, wraps `JSON.parse` in `try/catch`, logs `console.warn` and returns `[]` on parse error
  - Implement `saveTasks(tasks)`: wraps `localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))` in `try/catch`, logs `console.error` on `QuotaExceededError` without rethrowing
  - Export `loadTasks` and `saveTasks` on a `window._todoApp` test-hook object for Jasmine access
  - **Acceptance criteria**: `loadTasks()` returns `[]` when localStorage is empty (Req 4.3); `loadTasks()` returns `[]` and logs a warning when localStorage contains invalid JSON (Req 4.4); `loadTasks()` returns the saved array when valid data exists (Req 4.2); `saveTasks(tasks)` writes JSON to the correct key (Req 4.1); `saveTasks` does not throw when storage is full

- [~] 3. Implement the State Module in `js/app.js`
  - Declare `let tasks = [];`, `let activeFilter = 'all';`, `let activeSort = 'created';` inside the IIFE
  - Implement `createTask(title, dueDate, priority)`: trim title, reject if blank; generate `id` with `crypto.randomUUID()` and fallback; coerce invalid `priority` to `'medium'`; set `status = 'pending'` and `createdAt = Date.now()`; push to `tasks`, call `saveTasks(tasks)`, return the new task object
  - Implement `updateTask(id, fields)`: find task by `id`, spread `fields` onto it excluding `id` and `createdAt`, call `saveTasks(tasks)` (Req 1.3)
  - Implement `deleteTask(id)`: filter out the task with matching `id`, reassign `tasks`, call `saveTasks(tasks)` (Req 1.4)
  - Implement `toggleComplete(id)`: find task, toggle `status` between `'pending'` and `'completed'`, call `saveTasks(tasks)` (Req 2.1–2.3)
  - Implement `setFilter(filter)` and `setSort(sort)` to update the corresponding state variables (Req 3.1–3.4)
  - Implement pure helper `filterTasks(tasks, filter)` returning filtered array per filter value (Req 3.1)
  - Implement pure helper `sortTasks(tasks, sort)`: `'dueDate'` ascending nulls-last, `'priority'` via `PRIORITY_RANK = { high: 0, medium: 1, low: 2 }`, `'created'` newest first (Req 3.2–3.4)
  - Implement pure helpers `computeSummary(tasks)` returning `{ total, completed, pending }` and `computeProgress(tasks)` returning a 0–100 integer (Req 5.1–5.3)
  - Export all State functions and helpers on `window._todoApp`
  - **Acceptance criteria**: `createTask('Buy milk', null, 'high')` returns object with `id`, `title`, `priority`, `status: 'pending'`, `createdAt` (Req 1.1, 6.1, 6.3); whitespace title is rejected (Req 1.2); `updateTask` preserves `id` and `createdAt` (Req 1.3); `deleteTask` removes from `tasks` and localStorage (Req 1.4); `toggleComplete` round-trips status (Req 2.1–2.3); filter/sort helpers produce correct output (Req 3.1–3.4); summary helpers are consistent with task array (Req 5.1–5.3)

- [~] 4. Implement the View Module in `js/app.js`
  - Implement `renderSummary(tasks)`: update total/completed/pending `<span>` text content; update progress bar `value` attribute using `computeProgress(tasks)` (Req 5.1–5.4)
  - Implement `renderTaskCard(task)`: create `<div class="task-card">` containing title (truncated to 200 chars + ellipsis if needed), priority badge with class `priority-${task.priority}`, due date (hidden if null), completion checkbox, edit button, delete button (Req 1.5, 6.2, 8.3)
  - Implement `renderEmptyState(message)`: create `<p class="empty-state">` element with the provided message (Req 8.1, 8.2)
  - Implement `renderTaskList(visibleTasks)`: clear `#task-list`, iterate and append cards; if empty and `tasks.length === 0` show empty-state message; if empty and `tasks.length > 0` show no-results message (Req 8.1, 8.2)
  - Implement `renderAll(tasks, filter, sort)`: compute `visibleTasks = sortTasks(filterTasks(tasks, filter), sort)`, call `renderSummary(tasks)` and `renderTaskList(visibleTasks)`
  - Implement `showValidationError(message)` and `clearValidationError()` to set/clear `#form-error` visibility (Req 1.2)
  - Export all View functions on `window._todoApp`
  - **Acceptance criteria**: `renderTaskCard(task)` output contains title, priority class, due date if non-null, checkbox (Req 1.5, 6.2); 201+ char titles display as 200 chars + `…` while stored title is unchanged (Req 8.3); empty task list shows empty-state message (Req 8.1); empty filter result shows no-results message (Req 8.2); `renderSummary` updates counts and progress correctly (Req 5.1–5.3)

- [~] 5. Wire event handlers and implement `init()`
  - Implement `handleAddTask(event)`: prevent default, read form values, call `clearValidationError()`, validate title (call `showValidationError` if invalid), call `createTask(...)`, reset form, call `renderAll(...)` (Req 1.1, 1.2)
  - Implement `handleEditTask(id)`: populate form with existing task data, switch to update mode; on re-submit call `updateTask(id, fields)` and switch back to add mode (Req 1.3)
  - Implement `handleDeleteTask(id)`: call `deleteTask(id)`, call `renderAll(...)` (Req 1.4)
  - Implement `handleToggleComplete(id)`: call `toggleComplete(id)`, call `renderAll(...)` (Req 2.1–2.3)
  - Implement `handleFilterChange(filter)`: call `setFilter(filter)`, update active tab styling, call `renderAll(...)` (Req 3.1, 3.5)
  - Implement `handleSortChange(sort)`: call `setSort(sort)`, call `renderAll(...)` (Req 3.2–3.5)
  - Implement `init()`: call `tasks = loadTasks()`, call `renderAll(tasks, activeFilter, activeSort)`, attach event listeners using delegation on `#task-list` for edit/delete/toggle, direct listeners on form, filter tabs, and sort dropdown
  - Call `init()` at the bottom of the IIFE
  - **Acceptance criteria**: Submitting a valid form creates a task visible in the list and persisted in localStorage (Req 1.1, 4.1); submitting a blank title shows validation error and makes no changes (Req 1.2); edit button populates form, re-submit updates the task (Req 1.3); delete button removes task (Req 1.4); checkbox toggles completion (Req 2.1, 2.2, 2.4); filter tabs show only matching tasks (Req 3.1); sort dropdown reorders the displayed list (Req 3.2–3.4); page reload restores tasks from localStorage (Req 4.2)

- [~] 6. Style the app in `css/style.css`
  - Apply CSS reset and box-sizing; set base font (system-ui); define CSS custom properties for color palette and spacing scale
  - Style `<header>`: full-width banner with app title
  - Style `#dashboard`: card-style summary panel; flex row for counts; full-width progress bar below counts
  - Style `#controls`: flex row for filter tabs and sort dropdown; active filter tab has distinct background
  - Style `#task-form`: clean form layout; inline validation error styled in red below the title input
  - Style `.task-card`: card with border/shadow, flex layout for title, priority badge, due date, actions
  - Style priority badges: `.priority-high` (red), `.priority-medium` (yellow/amber), `.priority-low` (green) — visually distinct (Req 6.2)
  - Style completed tasks: `.task-card.completed` title has `text-decoration: line-through` and muted color (Req 2.4)
  - Style `.empty-state` and `.no-results`: centered, muted helper text
  - Apply `@media (min-width: 768px)` multi-column CSS Grid layout for `<main>` (Req 7.1)
  - Below 768px: single-column stack, all sections full-width (Req 7.2)
  - Ensure all interactive elements have `min-width: 44px; min-height: 44px` (Req 7.4)
  - **Acceptance criteria**: at ≥768px the layout shows multiple columns (Req 7.1); at <768px all sections stack vertically (Req 7.2); resizing the browser reflows layout without a page reload (Req 7.3); all buttons and checkboxes meet 44×44px minimum (Req 7.4); priority badges are visually distinct (Req 6.2); completed tasks have strikethrough styling (Req 2.4)

- [~] 7. Write Jasmine unit tests in `tests/unit.spec.js`
  - Create `tests/unit.html`: Jasmine runner loading Jasmine from CDN, `js/app.js`, and `tests/unit.spec.js`
  - Create `tests/unit.spec.js` accessing logic via `window._todoApp`
  - Test: `loadTasks()` with empty localStorage returns `[]`
  - Test: `loadTasks()` with missing key returns `[]`
  - Test: `loadTasks()` with malformed JSON returns `[]` and calls `console.warn`
  - Test: `saveTasks(arr)` then `loadTasks()` returns deeply equal array
  - Test: `createTask` with valid input returns expected shape (`id`, `title`, `priority`, `status: 'pending'`, `createdAt`)
  - Test: `createTask` default priority is `'medium'` when no priority arg is passed
  - Test: `createTask` with whitespace-only title does not modify task list
  - Test: `updateTask` changes fields but preserves `id` and `createdAt`
  - Test: `deleteTask` removes the correct task and only that task
  - Test: `toggleComplete` changes `'pending'` to `'completed'` and back
  - Test: `filterTasks('pending')` returns only pending tasks; `filterTasks('completed')` returns only completed tasks
  - Test: `sortTasks('dueDate')` places null due dates after dated tasks
  - Test: `sortTasks('priority')` orders high → medium → low
  - Test: `sortTasks('created')` orders newest first
  - Test: `computeSummary([])` returns `{ total: 0, completed: 0, pending: 0 }`
  - Test: `computeProgress([])` returns `0`
  - Test: `renderTaskCard` output contains title text, priority class, and status indicator
  - Test: `renderTaskCard` with 201-char title displays first 200 chars + ellipsis; stored title unchanged
  - Test: `showValidationError` / `clearValidationError` toggle error element visibility
  - **Acceptance criteria**: all Jasmine specs pass (green) when `tests/unit.html` is opened; no test uses mocks to fake actual logic; each `it` block has a descriptive name

- [~] 8. Write all 17 property-based tests in `tests/property.spec.js`
  - Create `tests/property.html`: Jasmine runner loading Jasmine + fast-check from CDN, `js/app.js`, and `tests/property.spec.js`
  - Create `tests/property.spec.js` with a shared `taskArb` arbitrary using `fc.record` covering all Task fields
  - P1 — Task Creation Valid Object (`// Validates: Requirements 1.1, 6.1, 6.3`): non-whitespace title + optional fields → `createTask` → assert valid shape with `status: 'pending'` and unique non-empty `id`
  - P2 — Whitespace Title Rejection (`// Validates: Requirements 1.2`): `fc.stringOf` whitespace chars → validation → assert rejection and task list length unchanged
  - P3 — Update Preserves ID and createdAt (`// Validates: Requirements 1.3`): `taskArb` + random fields → `updateTask` → assert `id` and `createdAt` identical to originals
  - P4 — Delete Removes From List and Storage (`// Validates: Requirements 1.4, 4.1`): `fc.array(taskArb, { minLength: 1 })` + random index → `deleteTask` → assert absent from `tasks` AND from `loadTasks()` result
  - P5 — Rendered Card Contains Required Fields (`// Validates: Requirements 1.5, 2.4, 6.2`): `taskArb` → `renderTaskCard` → assert card HTML contains title, priority class, dueDate if non-null, status indicator
  - P6 — Completion Toggle Round-Trip (`// Validates: Requirements 2.1, 2.2, 2.3`): `taskArb` → toggle twice → assert original status restored and each intermediate state persisted to localStorage
  - P7 — Filter Returns Only Matching Tasks (`// Validates: Requirements 3.1`): `fc.array(taskArb)` + `fc.constantFrom('all','pending','completed')` → `filterTasks` → every element satisfies the filter predicate
  - P8 — Due-Date Sort Invariant (`// Validates: Requirements 3.2`): `fc.array(taskArb)` → `sortTasks('dueDate')` → all non-null dueDate tasks precede null ones; non-null dates in ascending order
  - P9 — Priority Sort Invariant (`// Validates: Requirements 3.3, 6.4`): `fc.array(taskArb)` → `sortTasks('priority')` → `PRIORITY_RANK[i] <= PRIORITY_RANK[i+1]` for all adjacent pairs
  - P10 — Created-Date Sort Invariant (`// Validates: Requirements 3.4`): `fc.array(taskArb)` → `sortTasks('created')` → `tasks[i].createdAt >= tasks[i+1].createdAt` for all adjacent pairs
  - P11 — Persistence Round-Trip (`// Validates: Requirements 4.1, 4.2`): `fc.array(taskArb)` → `saveTasks` then `loadTasks` → deeply equals original array
  - P12 — Malformed Storage Graceful Recovery (`// Validates: Requirements 4.4`): non-array or invalid JSON string set in localStorage → `loadTasks()` → returns `[]` without throwing
  - P13 — Summary Counts Consistency (`// Validates: Requirements 5.1, 5.2`): `fc.array(taskArb)` → `computeSummary` → result equals manually computed `{ total, completed, pending }`
  - P14 — Progress Percentage Correct (`// Validates: Requirements 5.3`): `fc.array(taskArb, { minLength: 1 })` → `computeProgress` → equals `Math.round((completed / total) * 100)`
  - P15 — Long Title Display Truncation (`// Validates: Requirements 8.3`): `fc.string({ minLength: 201, maxLength: 1000 })` → `renderTaskCard` → displayed text ≤ 200 chars + ellipsis; `task.title` unchanged
  - P16 — Duplicate Titles Produce Unique IDs (`// Validates: Requirements 8.4`): same title × N (`fc.integer({ min: 2, max: 20 })`) → assert all IDs distinct
  - P17 — Empty Filter Result Shows No-Results Message (`// Validates: Requirements 8.2`): task list + filter producing 0 results with `tasks.length > 0` → render → no-results element present; `#task-list` empty of task cards
  - **Acceptance criteria**: all 17 properties are implemented with `// Validates` comments; each test runs ≥100 iterations; all tests pass in `tests/property.html`; `taskArb` is shared across tests

- [~] 9. Complete manual and visual verification checklist
  - Responsive at 320px: single-column layout, no horizontal overflow
  - Responsive at 768px: layout transitions to multi-column at exactly 768px
  - Responsive at 1024px and 1440px: multi-column layout is comfortable and readable
  - Touch targets: all buttons and checkboxes are at least 44×44 CSS pixels on mobile emulation
  - Cross-browser: open `index.html` in Chrome, Firefox, Edge, and Safari with no layout breaks or JS errors
  - LocalStorage persistence: add 3 tasks, close and reopen the tab, verify all 3 tasks are present
  - LocalStorage quota: fill storage to near-quota in DevTools, create a task, verify graceful error log and no crash
  - Empty state: clear all tasks, verify friendly empty-state message appears
  - No-results state: add pending tasks only, switch to "Completed" filter, verify no-results message appears
  - Long title: paste a 300-character title, verify displayed card truncates to 200 chars + ellipsis, verify localStorage stores the full text
  - Duplicate titles: add two tasks with identical titles, verify both appear with unique actions
  - Priority badges: create one task of each priority, verify three visually distinct badge colors
  - Filter tabs: add mixed pending/completed tasks, cycle through All / Pending / Completed, verify correct subsets
  - Sort: add tasks with varied due dates, priorities, and creation times, verify each sort option reorders the list correctly
  - Validation: submit with a blank title and with a whitespace-only title, verify inline error appears and no task is added
  - **Acceptance criteria**: all checklist items pass without errors or unexpected behavior; no console errors in any supported browser during normal use; app is fully functional offline

## Notes

- All logic modules (Storage, State, View) must expose their functions on `window._todoApp` for testability from Jasmine specs loaded in a separate file.
- The IIFE wraps all application code to avoid polluting the global scope; `window._todoApp` is the sole intentional export.
- fast-check is loaded via CDN in `tests/property.html` — no bundler or build step required.
- The `PRIORITY_RANK` constant (`{ high: 0, medium: 1, low: 2 }`) should be defined at the top of the IIFE and also exposed on `window._todoApp` for use in property tests.
- Tasks 7 and 8 are independent of each other and can be implemented in parallel once Tasks 2–5 are complete.
