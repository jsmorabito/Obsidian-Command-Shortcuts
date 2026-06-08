## 0.4.0

### Bug Fixes

- **settings**: Fix hotkey capture ignoring keypresses in the settings panel
  - Pressing keys while "Press hotkey..." was active would focus a nearby button
    instead of recording the key, because Obsidian's settings modal intercepted
    keyboard events before the document-level capture handler could run
  - Fix: inject a hidden `<input>` element and focus it for the duration of
    capture; the browser routes all keyboard input to the focused input, bypassing
    modal-level navigation handlers

## 0.4.0-beta.1

### Features

- **editor-scope**: Add continuous shortcuts mode for multi-shortcut execution
  - Enable sequential shortcut triggering without repeatedly pressing Esc
  - Add `EditorScopeManager` for handling editor-focused shortcuts
  - Configurable trigger key and visual border indicator
  - Settings UI for toggling and customizing editor scope mode

- **settings**: Support toggle and update setting functionality

### Bug Fixes

- **editor**: Fix issue where clicking space in editor couldn't trigger shortcuts mode

### Refactor

- **architecture**: Refactor whole component of hotkey listener into multiple specialized modules
  - Split monolithic `HotkeyMonitor` class into 10+ focused modules
  - Implement Facade pattern with `ShortcutManager` as coordinator
  - Apply SOLID principles for better maintainability
  - Modules: KeyParser, KeyboardListener, SequenceMatcher, ShortcutExecutor, FocusStateManager, etc.

### Documentation

- Update README with new feature images and usage examples

### Chores

- Remove unused files
- Update project configuration
