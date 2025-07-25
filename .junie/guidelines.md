# Task List Management Guidelines

## Overview
The `docs/tasks.md` file contains 110 enumerated technical tasks derived from the development plan. Tasks are organized by phases and priorities for systematic implementation.

## Task Structure
- **Format:** `[ ]` checkbox followed by task description
- **Numbering:** Sequential 1-110 across all phases
- **Phases:** 6 phases from Foundation to Advanced Features
- **Priorities:** Critical > High > Medium > Low

## Working with Tasks

### Task Completion
1. Mark completed tasks by changing `[ ]` to `[x]`
2. Update task status in git commits for tracking
3. Reference task numbers in commit messages (e.g., "Task #12: Add service worker")

### Phase Management
- Complete Phase 1 (Critical) tasks before proceeding to Phase 2
- Within phases, prioritize by dependencies (architectural before UI)
- Test thoroughly after completing each phase

### Task Dependencies
- Tasks 1-6: Data foundation (complete first)
- Tasks 7-12: Error handling (parallel with data tasks)
- Tasks 13-18: Performance optimization (after data foundation)
- Tasks 19-29: Content management (requires data foundation)
- Tasks 30+: Feature enhancements (requires stable foundation)

### Progress Tracking
- Use `git grep "\[x\]" docs/tasks.md | wc -l` to count completed tasks
- Generate progress reports: `(completed_tasks / 110) * 100`
- Review and update task priorities quarterly

### Current Development Status Management
- Update the "Current Development Status" section when starting new tasks
- Change task status from "Not Started" to "In Progress" when work begins
- Update "Assigned" field with developer name/team
- Set realistic "Estimated Completion" dates
- Move completed tasks to "Next Up" and advance to next task
- Update "Development Notes" with important decisions or blockers
- Always update "Last Updated" timestamp and "Updated By" field
- When phase completes, advance to next phase and update active phase indicator

### Task Modification
- Add new tasks at end of appropriate phase
- Update numbering if tasks are removed
- Document changes in commit messages
- Maintain phase organization and priority levels

## Implementation Notes
- Each task should result in working, tested code
- Document architectural decisions for tasks 1-18
- Create feature branches for complex tasks (20+ lines of code)
- Update documentation when completing documentation tasks (93-97)

## Development

**IMPORTANT** After completing a task, validate, if the application builds and is functional (use tools)