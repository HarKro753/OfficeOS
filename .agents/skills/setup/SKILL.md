---
description: Interactive setup for the dotclaude plugin. Configures recommended plugins, statusline, and output styles. Use when asked to "set up", "configure", or "what plugins should I install".
disable-model-invocation: true
allowed-tools:
  - Bash
  - Read
  - AskUserQuestion
---

# Setup

Interactive configuration wizard for the dotclaude plugin ecosystem.

## How It Works

1. Read the registry file at `skills/setup/registry.json` (relative to this plugin's root)
2. Read the user's current settings from `~/.claude/settings.json`
3. Compare to determine what's already configured vs. what's missing
4. Present each group as a checklist using `AskUserQuestion` with `multiSelect`
5. Apply selected configurations
6. Report what changed and remind user to restart Claude Code

## Step-by-Step

### Step 1: Read Current State

Read `~/.claude/settings.json` and extract:
- `enabledPlugins` — which plugins are already enabled
- `statusLine` — whether statusline is configured

### Step 2: Read Registry

Read `skills/setup/registry.json` from this plugin's directory.

### Step 3: Present Checklist

For each group in the registry, use `AskUserQuestion` to present options.

**Important rules for the checklist:**
- For `multiSelect: true` groups, allow selecting multiple items
- For `multiSelect: false` groups (like Output Style), only one selection
- Mark items that are already configured — mention "(installed)" in the description
- Show install count and marketplace rank for each plugin
- Warn about conflicts: if an item has a `conflicts` field and the conflicting plugin is installed, show the warning

**Present groups one at a time**, not all at once. This keeps each decision focused.

### Step 4: Apply Configurations

For each selected item, apply the configuration:

**Plugins** (items with a `key` ending in `@claude-plugins-official`):
```bash
jq --arg plugin "<key>" '.enabledPlugins[$plugin] = true' \
  ~/.claude/settings.json > ~/.claude/settings.json.tmp \
  && mv ~/.claude/settings.json.tmp ~/.claude/settings.json
```

**Statusline** (item with `type: "statusline"`):
Copy the statusline script to a stable location outside the versioned plugin cache, then point settings at that stable path. This ensures the statusline survives plugin version bumps.
```bash
cp "${CLAUDE_PLUGIN_ROOT}/statusline.sh" ~/.claude/statusline.sh \
  && chmod +x ~/.claude/statusline.sh \
  && jq '.statusLine = {"type": "command", "command": "~/.claude/statusline.sh", "padding": 0}' \
    ~/.claude/settings.json > ~/.claude/settings.json.tmp \
  && mv ~/.claude/settings.json.tmp ~/.claude/settings.json
```

### Step 5: Handle Conflicts

Before applying, check for conflicts:
- If user selects `pr-review-toolkit` and `code-simplifier` is already enabled, warn and offer to disable `code-simplifier`
- If user selects `learning-output-style` and `explanatory-output-style` is enabled, warn and offer to disable `explanatory-output-style`
- If user selects `explanatory-output-style` and `learning-output-style` is enabled, warn that Learning already includes Explanatory

To disable a conflicting plugin:
```bash
jq --arg plugin "<key>" '.enabledPlugins[$plugin] = false' \
  ~/.claude/settings.json > ~/.claude/settings.json.tmp \
  && mv ~/.claude/settings.json.tmp ~/.claude/settings.json
```

### Step 6: Summary

After all changes, print a summary:
- What was added
- What was disabled (conflicts)
- What was already configured (skipped)
- Remind: "Restart Claude Code for changes to take effect."

## Bootstrap

If someone asks how to install the dotclaude plugin itself, provide this snippet for `~/.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "ng-hai": {
      "source": {
        "source": "git",
        "url": "https://github.com/ng-hai/dotclaude.git"
      }
    }
  },
  "enabledPlugins": {
    "hai@ng-hai": true
  }
}
```

Claude Code fetches from the `main` branch automatically. No local clone or update hooks needed.

## Notes

- All settings modifications use the atomic tmp-file-then-mv pattern
- `jq` is required — check before starting
- This skill only modifies `~/.claude/settings.json` (global scope)
- The plugin itself (`hai@ng-hai`) must already be registered for this skill to be discoverable
