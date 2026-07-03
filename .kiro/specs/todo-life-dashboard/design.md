# Design Document — Todo Life Dashboard

## Overview

The Todo Life Dashboard is a single-page web application built with pure HTML, CSS, and Vanilla JavaScript. It gives users a clean, responsive interface for creating and managing tasks, tracking priorities and due dates, and viewing a live progress summary — all without a backend. Data is persisted via the browser's `localStorage` API, making the app fully self-contained and offline-capable.

The app ships as three files:
- `index.html` — markup and structure
- `css/style.css` — all styling and responsive layout
- `js/app.js` — all application logic

It must work correctly in Chrome, Firefox, Edge, and Safari.

---

## Architecture

The architecture follows a simple **Model → View → Controller** pattern implemented without a framework:

```
┌─────────────────────────────────────────────────┐
│                   index.html                    │
│   (static shell: header, form, list, summary)   │
└────────────────────────┬────────────────────────┘
                         │ DOM events
                         ▼
┌─────────────────────────────────────────────────┐
│                    js/app.js                    │
│                                                 │
│  ┌────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │  Storage   │  │    State    │  │   View   │ │
│  │  Module    │◄─┤   Module    │─►│  Module  │ │
│  │(localStorage│  │(tasks array)│  │(DOM ops) │ │
│  └────────────┘  └─────────────┘  └──────────┘ │
└─────────────────────────────────────────────────┘
```

**Key design decisions:**

1. **No build step** — all JS runs directly in the browser. A single `<script src="js/app.js">` tag at the end of `<body>` keeps the load order simple and avoids deferred-loading complexity.
2. **Module pattern via IIFE** — the entire `app.js` is wrapped in an IIFE to avoid polluting the global scope, with deliberate exports only for testability.
3. **Re-render on every state change** — rather than granular DOM patching, the task list is fully re-rendered after each state mutation. For a personal todo app the list will rarely exceed a few hundred items, making this approach simple and correct.
4. **Pure functions for logic** — filtering, sorting, validation, and summary computation are written as pure functions that take a task array and return a result. This makes them independently testable without touching the DOM.

---

## Components and Interfaces

### 1. HTML Structure (`index.html`)

```
<body>
  <header>         — App title
  <main>
    <section#dashboard>   — Summary panel (counts + progress bar)
    <section#controls>    — Filter tabs + sort dropdown
    <section#task-form>   — Add/edit task form
    <section#task-list>   — Rendered task cards
  </main>
</body>
```

### 2. Storage Module

Responsible for reading/writing to `localStorage` only.

```js
const STORAGE_KEY = 'todo_life_dashboard_tasks';

// Returns parsed task array, or [] on missing/malformed data
function loadTasks(): Task[]

// Serializes tasks array and writes to localStorage
function saveTasks(tasks: Task[]): void
```

### 3. State Module

Holds the canonical in-memory task list and exposes mutation functions. Every mutation calls `saveTasks` and then triggers a re-render.

```js
let tasks = [];  // Task[]
let activeFilter = 'all';   // 'all' | 'pending' | 'completed'
let activeSort   = 'created'; // 'created' | 'dueDate' | 'priority'

function createTask(title, dueDate, priority): Task
function updateTask(id, fields): void
function deleteTask(id): void
function toggleComplete(id): void
function setFilter(filter): void
function setSort(sort): void
```

### 4. View Module

Responsible for all DOM reads and writes. Consumes the current state and produces HTML.

```js
function renderAll(tasks, filter, sort): void
function renderSummary(tasks): void
function renderTaskList(visibleTasks): void
function renderTaskCard(task): HTMLElement
function renderEmptyState(message): void
function showValidationError(message): void
function clearValidationError(): void
```

### 5. Event Handlers

Wired up once in `init()`:

| DOM Event | Handler |
|---|---|
| Form submit | `handleAddTask()` |
| Edit button click | `handleEditTask(id)` |
| Delete button click | `handleDeleteTask(id)` |
| Checkbox change | `handleToggleComplete(id)` |
| Filter tab click | `handleFilterChange(filter)` |
| Sort dropdown change | `handleSortChange(sort)` |

---

## Data Models

### Task Object

```js
{
  id:        string,   // crypto.randomUUID() or Date.now().toString(36) + Math.random().toString(36)
  title:     string,   // raw user input (full text, up to any length; display truncates at 200 chars)
  priority:  'low' | 'medium' | 'high',  // default: 'medium'
  dueDate:   string | null,  // ISO date string 'YYYY-MM-DD' or null
  status:    'pending' | 'completed',    // default: 'pending'
  createdAt: number    // Date.now() timestamp (milliseconds)
}
```

### LocalStorage Schema

- **Key:** `todo_life_dashboard_tasks`
- **Value:** JSON-serialized `Task[]` array
- **On missing key:** return `[]`
- **On parse error:** log `console.warn`, return `[]`

### Filter State

```js
type Filter = 'all' | 'pending' | 'completed'
type Sort   = 'created' | 'dueDate' | 'priority'
```

### Priority Rank Map (for sorting)

```js
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Task Creation Produces a Valid Task Object

*For any* non-empty, non-whitespace title string and any combination of valid optional fields (dueDate, priority), calling `createTask(title, dueDate, priority)` SHALL return an object with a non-empty unique `id`, the given `title`, the given optional fields (or their defaults), and `status === "pending"`.

**Validates: Requirements 1.1, 6.1, 6.3**

---

### Property 2: Whitespace-Only Titles Are Rejected

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines, or any combination thereof), the task title validation function SHALL return an error result, and the task list SHALL remain unchanged.

**Validates: Requirements 1.2**

---

### Property 3: Task Update Preserves ID and Reflects New Fields

*For any* existing task in the list and any valid set of new field values, calling `updateTask(id, fields)` SHALL result in the task in the list having all the new field values while retaining its original `id` and `createdAt`.

**Validates: Requirements 1.3**

---

### Property 4: Task Deletion Removes From List and Storage

*For any* task list containing at least one task, after calling `deleteTask(id)`, the task with that `id` SHALL be absent from the in-memory task array AND from the value retrieved from `localStorage`.

**Validates: Requirements 1.4, 4.1**

---

### Property 5: Rendered Task Card Contains All Required Fields

*For any* task object (with any combination of title, priority, dueDate, and status), the rendered task card HTML SHALL contain the task title text, the appropriate priority CSS class/badge, the due date string if `dueDate` is non-null, and a completion status indicator.

**Validates: Requirements 1.5, 2.4, 6.2**

---

### Property 6: Completion Toggle Round-Trip

*For any* task, toggling its completion status twice (pending → completed → pending) SHALL restore the task to its original `status === "pending"` state, and each intermediate state SHALL be correctly persisted to `localStorage`.

**Validates: Requirements 2.1, 2.2, 2.3**

---

### Property 7: Filter Returns Only Matching Tasks

*For any* task array and any filter value (`all`, `pending`, or `completed`), calling `filterTasks(tasks, filter)` SHALL return an array where every element satisfies the filter predicate — `all` returns every task, `pending` returns only tasks with `status === "pending"`, `completed` returns only tasks with `status === "completed"`.

**Validates: Requirements 3.1**

---

### Property 8: Due-Date Sort Invariant

*For any* task array, calling `sortTasks(tasks, 'dueDate')` SHALL return an array where: (a) all tasks with a non-null `dueDate` appear before all tasks with a null `dueDate`, and (b) among tasks with non-null due dates, each task's `dueDate` is ≤ the next task's `dueDate` (ascending order).

**Validates: Requirements 3.2**

---

### Property 9: Priority Sort Invariant

*For any* task array, calling `sortTasks(tasks, 'priority')` SHALL return an array where `PRIORITY_RANK[task[i].priority] ≤ PRIORITY_RANK[task[i+1].priority]` for every adjacent pair — i.e., high tasks come before medium, medium before low.

**Validates: Requirements 3.3, 6.4**

---

### Property 10: Created-Date Sort Invariant

*For any* task array, calling `sortTasks(tasks, 'created')` SHALL return an array where `task[i].createdAt ≥ task[i+1].createdAt` for every adjacent pair (newest first).

**Validates: Requirements 3.4**

---

### Property 11: Persistence Round-Trip

*For any* task array, serializing it to `localStorage` via `saveTasks(tasks)` and then reading it back via `loadTasks()` SHALL return an array that is deeply equal to the original.

**Validates: Requirements 4.1, 4.2**

---

### Property 12: Malformed Storage Graceful Recovery

*For any* string that is not valid JSON (or is valid JSON but not an array of valid task objects), when that string is set as the `localStorage` value and `loadTasks()` is called, it SHALL return an empty array `[]` and SHALL not throw an exception.

**Validates: Requirements 4.4**

---

### Property 13: Summary Counts Are Consistent With Task List

*For any* task array, `computeSummary(tasks)` SHALL return `{ total, completed, pending }` where `total === tasks.length`, `completed === tasks.filter(t => t.status === "completed").length`, and `pending === total - completed`.

**Validates: Requirements 5.1, 5.2**

---

### Property 14: Progress Percentage Is Correct

*For any* non-empty task array, `computeProgress(tasks)` SHALL return a value equal to `Math.round((completedCount / tasks.length) * 100)` where `completedCount` is the number of tasks with `status === "completed"`.

**Validates: Requirements 5.3**

---

### Property 15: Long Title Display Truncation

*For any* task title string of length greater than 200 characters, the rendered task card SHALL display at most 200 characters followed by an ellipsis, while the stored `task.title` SHALL equal the original full-length string.

**Validates: Requirements 8.3**

---

### Property 16: Duplicate Titles Produce Unique IDs

*For any* title string, creating N tasks with the same title SHALL produce N tasks all sharing that title but each having a distinct `id` value.

**Validates: Requirements 8.4**

---

### Property 17: Empty Filter Result Shows No-Results Message

*For any* combination of a task list and a filter value where `filterTasks(tasks, filter).length === 0` and `tasks.length > 0`, the rendered view SHALL include the no-results message element and the task list container SHALL be empty.

**Validates: Requirements 8.2**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Whitespace/empty title on submit | Inline validation message shown below input; form not submitted; task list unchanged |
| `localStorage` key missing on load | Silent fallback to `[]`; empty state rendered |
| `localStorage` value is malformed JSON | `console.warn` with description; fallback to `[]`; app continues normally |
| `crypto.randomUUID` not available (old browsers) | Fallback ID: `Date.now().toString(36) + Math.random().toString(36).substring(2)` |
| `localStorage` write failure (storage quota exceeded) | `try/catch` around `saveTasks`; `console.error` logged; user data in memory for session but not persisted |
| Invalid priority value passed to `createTask` | Coerce to default `"medium"` |
| Edit form submitted with whitespace title | Same as add form — inline error, no update applied |

---

## Testing Strategy

### Approach

Because this is a pure Vanilla JS app with no build tool, tests will use **[Jasmine](https://jasmine.github.io/)** loaded directly in the browser via CDN, or via `jasmine-standalone` for Node-based runs. Jasmine requires no build step and runs in-browser, matching the zero-tooling constraint.

For property-based testing, **[fast-check](https://fast-check.dev/)** will be loaded via CDN (`<script src="https://cdn.jsdelivr.net/npm/fast-check/..."></script>`). It works without a bundler and integrates with Jasmine.

### Test Layers

#### Unit Tests (Example-Based)

Focus on specific concrete scenarios and edge cases:

- `createTask` with a specific valid input returns the expected shape
- `loadTasks` with empty `localStorage` returns `[]`
- `loadTasks` with missing key returns `[]`
- `computeSummary([])` returns `{ total: 0, completed: 0, pending: 0 }`
- `computeProgress([])` returns `0`
- Default priority on `createTask` with no priority arg is `"medium"`
- Filter tab change updates `activeFilter` and re-renders
- Responsive layout breakpoint verification (manual / CSS snapshot)

#### Property-Based Tests (fast-check, minimum 100 iterations each)

Each property test corresponds to a Correctness Property in the design.

```
// Tag format: Feature: todo-life-dashboard, Property N: <property title>
```

| Property | Test Description | Arbitraries |
|---|---|---|
| P1: Task Creation | `fc.string()` (filtered non-whitespace), optional date, optional priority → createTask → verify shape | `fc.string`, `fc.option(fc.string)`, `fc.constantFrom('low','medium','high')` |
| P2: Whitespace Rejection | `fc.stringOf(fc.char().filter(isWhitespace))` → validate → should reject | `fc.stringOf` with whitespace chars |
| P3: Update Preserves ID | Random task + random field updates → updateTask → ID and createdAt unchanged | `fc.record`, `fc.string` |
| P4: Delete Removes From List & Storage | Random list + random index → deleteTask → absent from list & localStorage | `fc.array(taskArb)`, `fc.nat` |
| P5: Rendered Card Contains Fields | Random task → renderTaskCard → HTML contains title, priority class, dueDate if present | Custom `taskArb` |
| P6: Toggle Round-Trip | Random task → toggle → toggle → status restored | `taskArb` |
| P7: Filter Correctness | Random task array + random filter → filterTasks → all results match predicate | `fc.array(taskArb)`, `fc.constantFrom(...)` |
| P8: Due Date Sort | Random task array → sortTasks('dueDate') → invariant holds | `fc.array(taskArb)` |
| P9: Priority Sort | Random task array → sortTasks('priority') → invariant holds | `fc.array(taskArb)` |
| P10: Created Sort | Random task array → sortTasks('created') → invariant holds | `fc.array(taskArb)` |
| P11: Persistence Round-Trip | Random task array → saveTasks → loadTasks → deep equal | `fc.array(taskArb)` |
| P12: Malformed Storage Recovery | `fc.string` (non-JSON or invalid schema) → loadTasks → returns `[]` | `fc.string`, `fc.anything` |
| P13: Summary Consistency | Random task array → computeSummary → counts match manual computation | `fc.array(taskArb)` |
| P14: Progress Percentage | Random non-empty task array → computeProgress → equals formula | `fc.array(taskArb, { minLength: 1 })` |
| P15: Title Truncation | `fc.string({ minLength: 201 })` → renderTaskCard → display ≤ 200 chars, stored full | `fc.string` |
| P16: Unique IDs on Duplicates | Same title, call createTask N times → all IDs distinct | `fc.string`, `fc.integer({ min: 2, max: 20 })` |
| P17: Empty Filter No-Results | Random list + filter producing 0 results → render → no-results message shown | `fc.array(taskArb)` |

#### Manual / Visual Tests

- Responsive layout at 320px, 768px, 1024px, 1440px widths
- Touch target sizes on mobile
- Cross-browser smoke test (Chrome, Firefox, Edge, Safari)
- `localStorage` read on fresh load (open browser, verify tasks persist)
- `localStorage` quota exceeded behavior (fill storage, verify graceful error)
