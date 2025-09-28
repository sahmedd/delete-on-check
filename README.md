# Delete on Check Plugin

A simple Obsidian plugin that automatically deletes tasks when they are checked in files tagged with `#deleteoncheck`.

## How it works

1. Add the `#deleteoncheck` tag anywhere in your note
2. Create tasks using the standard markdown format: `- [ ] Your task`
3. When you check a task (making it `- [x] Your task`), it will be automatically deleted

## Use Cases

- Quick todo lists that you want to disappear when completed
- Temporary reminders that don't need to persist
- Clean, minimal task management

## Installation

1. Copy this plugin to your `.obsidian/plugins/delete-on-check/` folder
2. Enable the plugin in Obsidian settings under Community Plugins
3. Start using it by adding `#deleteoncheck` to any note with tasks

## Example

```markdown
# My Tasks #deleteoncheck

- [ ] Buy groceries
- [ ] Call mom
- [ ] Finish report
```

When you check any of these tasks, they will be immediately deleted from the note.
