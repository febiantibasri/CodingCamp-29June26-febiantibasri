# Requirements Document

## Introduction

A personal life dashboard built with HTML, CSS, and Vanilla JavaScript that helps users manage their daily tasks, track progress, and stay organized — all persisted in the browser's LocalStorage. The app runs entirely client-side in a single `index.html` + `css/style.css` + `js/app.js` structure and must work in Chrome, Firefox, Edge, and Safari.

## Requirements

### Requirement 1: Task Management

**User Story:** As a user, I want to add, view, edit, and delete tasks, so that I can capture and manage things I need to accomplish.

#### Acceptance Criteria

1. WHEN a user types a task title and submits the form THEN the system SHALL create a new task with a unique ID, a title, an optional due date, an optional priority level (low/medium/high), and a default status of "pending"
2. WHEN a user attempts to submit a task with an empty or whitespace-only title THEN the system SHALL reject the submission and display an inline validation message
3. WHEN a user edits an existing task THEN the system SHALL update the task's fields and reflect the changes immediately in the task list
4. WHEN a user deletes a task THEN the system SHALL remove it from the list and from LocalStorage permanently
5. WHEN a task is displayed THEN the system SHALL show the task title, priority badge, due date (if set), and completion status

---

### Requirement 2: Task Completion

**User Story:** As a user, I want to mark tasks as complete or incomplete, so that I can track my progress.

#### Acceptance Criteria

1. WHEN a user marks a task as complete THEN the system SHALL update the task's status to "completed" and apply a visual completion style (e.g., strikethrough)
2. WHEN a user marks a completed task as incomplete THEN the system SHALL restore the task's status to "pending" and remove the completion style
3. WHEN the completion status of a task changes THEN the system SHALL persist the updated status to LocalStorage immediately
4. WHEN tasks are displayed THEN the system SHALL visually distinguish completed tasks from pending tasks

---

### Requirement 3: Task Filtering and Sorting

**User Story:** As a user, I want to filter and sort my tasks, so that I can focus on what matters most.

#### Acceptance Criteria

1. WHEN a user selects a filter option (All / Pending / Completed) THEN the system SHALL display only tasks matching the selected filter
2. WHEN a user sorts by "Due Date" THEN the system SHALL order tasks with the earliest due date first, placing tasks without a due date at the end
3. WHEN a user sorts by "Priority" THEN the system SHALL order tasks high → medium → low
4. WHEN a user sorts by "Created Date" THEN the system SHALL order tasks from newest to oldest
5. WHEN a filter or sort selection is changed THEN the system SHALL update the displayed list immediately without a page reload

---

### Requirement 4: LocalStorage Persistence

**User Story:** As a user, I want my tasks to be saved automatically so that my data is preserved across browser sessions.

#### Acceptance Criteria

1. WHEN a task is created, updated, or deleted THEN the system SHALL immediately write the full task list to LocalStorage under a consistent key
2. WHEN the page loads THEN the system SHALL read all tasks from LocalStorage and render them in the task list
3. WHEN LocalStorage is empty or missing the data key THEN the system SHALL initialize with an empty task list and render an empty state message
4. WHEN LocalStorage data is malformed or unparseable THEN the system SHALL gracefully recover by falling back to an empty task list and logging a console warning

---

### Requirement 5: Summary Dashboard

**User Story:** As a user, I want to see a summary of my task progress, so that I can understand my productivity at a glance.

#### Acceptance Criteria

1. WHEN the dashboard is rendered THEN the system SHALL display the total number of tasks, the number of completed tasks, and the number of pending tasks
2. WHEN any task is added, completed, or deleted THEN the system SHALL update the summary counts immediately
3. WHEN tasks exist THEN the system SHALL display a progress bar or percentage reflecting the ratio of completed tasks to total tasks
4. WHEN there are no tasks THEN the system SHALL display zero counts and an empty/zero progress indicator

---

### Requirement 6: Priority Management

**User Story:** As a user, I want to assign and change task priorities so that I can identify the most important work.

#### Acceptance Criteria

1. WHEN a task is created or edited THEN the system SHALL allow the user to assign one of three priority levels: low, medium, or high
2. WHEN a priority level is assigned THEN the system SHALL display a visually distinct badge or color indicator for each priority level
3. WHEN no priority is explicitly set THEN the system SHALL default to "medium" priority
4. WHEN tasks are sorted by priority THEN the system SHALL consistently order them high → medium → low

---

### Requirement 7: Responsive Layout

**User Story:** As a user, I want the dashboard to be usable on different screen sizes, so that I can access it from desktop and mobile.

#### Acceptance Criteria

1. WHEN the viewport width is 768px or wider THEN the system SHALL display the layout in a multi-column desktop view
2. WHEN the viewport width is less than 768px THEN the system SHALL stack components in a single-column mobile view
3. WHEN the user resizes the browser THEN the system SHALL reflow the layout responsively without requiring a page reload
4. WHEN the app is displayed on any supported screen size THEN touch targets (buttons, checkboxes) SHALL be at minimum 44×44 CSS pixels

---

### Requirement 8: Empty and Edge-Case States

**User Story:** As a user, I want the app to handle edge cases gracefully, so that I always see meaningful feedback.

#### Acceptance Criteria

1. WHEN the task list is empty THEN the system SHALL display a friendly empty-state message encouraging the user to add a task
2. WHEN a filter is applied and no tasks match THEN the system SHALL display a "no results" message for the active filter
3. WHEN a task title exceeds 200 characters THEN the system SHALL truncate display to 200 characters and indicate truncation with an ellipsis, while storing the full text
4. WHEN the user submits duplicate task titles THEN the system SHALL allow them (duplicates are permitted) and assign each a unique ID

## Glossary

- **Task**: A user-defined item representing something to be accomplished, with a title, optional due date, priority, and completion status.
- **Priority**: A categorical importance level assigned to a task: low, medium, or high.
- **LocalStorage**: A browser-native key/value storage API that persists data across sessions without a server.
- **Pending**: The default task status indicating the task has not yet been completed.
- **Completed**: A task status indicating the user has marked the task as done.
- **Dashboard**: The summary panel showing aggregate statistics (total, completed, pending counts and progress).
