# Permissions Guide

Obsidian Flux supports granular permission control for imported journal entries using Obsidian frontmatter properties. This allows you to control which pages are visible to players and at what level.

## Quick Start

Add frontmatter to your Obsidian markdown files to control permissions:

```markdown
---
gm-only: true
---
# Secret GM Notes

Players cannot see this page.
```

## Import Options

When importing your vault, you have two main permission options:

### 1. Give all players permission to observe?

When checked, all imported journals will have **Observer** permission by default, making them visible to players.

### 2. Except pages marked as 'gm-only'?

This option appears when "Give all players permission to observe?" is checked. It allows you to exclude specific pages from player visibility by marking them with `gm-only: true` in their frontmatter.

## Frontmatter Properties

### Simple: GM-Only Pages

The simplest way to mark a page as GM-only is using the `gm-only` property:

```markdown
---
gm-only: true
---
# Secret Information

This page will only be visible to the GM.
```

**When to use:**
- Secret plot information
- NPC backstories players shouldn't know
- Campaign notes and planning
- Spoilers for future sessions

### Advanced: Explicit Permission Levels

For more control, use the `permission` property with one of these values:

#### `permission: none` - Hidden from Players (GM Only)

```markdown
---
permission: none
---
# Top Secret

Completely hidden from players.
```

#### `permission: limited` - Limited View

```markdown
---
permission: limited
---
# Mysterious NPC

Players can see this exists but content is limited.
```

**Use for:**
- NPCs players have heard about but not met
- Locations mentioned but not visited
- Clues or rumors (partial information)

#### `permission: observer` - Full View (Default for Players)

```markdown
---
permission: observer
---
# Town of Riverside

Players can fully read this page.
```

**Use for:**
- Public information
- Player-accessible locations
- Known NPCs
- Lore players have discovered

#### `permission: owner` - Full Control

```markdown
---
permission: owner
---
# Party Inventory

Players have full ownership and can edit.
```

**Use for:**
- Shared party resources
- Player-managed content
- Collaborative documents

## Permission Priority

When multiple permission settings could apply, Obsidian Flux uses this priority order:

1. **Explicit `permission` property** (highest priority)
2. **`gm-only` property** (when "Except pages marked as 'gm-only'?" is checked)
3. **Global "Give all players permission to observe?" setting**
4. **FoundryVTT default** (GM only)

### Example: Priority in Action

```markdown
---
permission: observer
gm-only: true
---
# This page is OBSERVER

The explicit permission property wins.
```

## Common Use Cases

### Case 1: Mostly Public, Some Secret

**Import Settings:**
- ✅ Give all players permission to observe?
- ✅ Except pages marked as 'gm-only'?

**In your vault:**
```markdown
# public-lore.md
---
# No frontmatter needed - will be OBSERVER by default
---
# History of the Kingdom

[Public information...]
```

```markdown
# secret-villain-plan.md
---
gm-only: true
---
# The Dark Lord's Scheme

[GM-only plot information...]
```

### Case 2: Mostly Secret, Some Public

**Import Settings:**
- ❌ Give all players permission to observe?

**In your vault:**
```markdown
# gm-notes.md
---
# No frontmatter - will be GM-only by default
---
# Session Planning

[Private GM notes...]
```

```markdown
# town-description.md
---
permission: observer
---
# The Town Square

[Public player information...]
```

### Case 3: Mixed Permissions

For complex campaigns with varied access levels:

```markdown
# npc-rumor.md
---
permission: limited
---
# Mysterious Stranger

Players know this NPC exists but haven't met them yet.
```

```markdown
# npc-full.md
---
permission: observer
---
# Sir Galahad

Complete information after players have met the NPC.
```

```markdown
# npc-secrets.md
---
permission: none
---
# Sir Galahad's Hidden Agenda

GM-only information about the NPC's true motives.
```

## Tips and Best Practices

### 1. Use Obsidian Templates

Create Obsidian templates for different page types:

**Template: GM Only**
```markdown
---
gm-only: true
---
# {{title}}

[GM notes here]
```

**Template: Player Visible**
```markdown
---
permission: observer
---
# {{title}}

[Player information here]
```

### 2. Organize by Folder

While Obsidian Flux doesn't support folder-level permissions yet, you can organize your vault:

```
my-vault/
├── player-facing/      # Use observer permission
├── gm-only/            # Use gm-only or none
└── limited-info/       # Use limited permission
```

### 3. Test Before Big Imports

Import a small test folder first to verify permissions are set correctly before importing your entire vault.

### 4. Document Your System

Add a note in your vault explaining your permission system:

```markdown
# Permission System

- `gm-only: true` = Secret GM information
- `permission: limited` = Partial information (rumors, etc.)
- `permission: observer` = Full player access
- No frontmatter = Follows global import setting
```

## Verifying Permissions in FoundryVTT

After import, you can verify permissions:

1. Right-click on a journal entry
2. Select "Configure Ownership"
3. Check the "Default" permission level:
   - **None** = Hidden from players (GM only)
   - **Limited** = Can see it exists, limited content
   - **Observer** = Full view access
   - **Owner** = Full control

## Troubleshooting

### Permissions Not Working

**Check frontmatter syntax:**
- Must start and end with `---` on separate lines
- Use lowercase for boolean values: `true` not `True`
- Use lowercase for permission values: `none` not `None`

**Valid:**
```markdown
---
gm-only: true
---
```

**Invalid:**
```markdown
---
gm-only: True  ❌ (uppercase)
---
```

### Can't Find the Checkbox

The "Except pages marked as 'gm-only'?" checkbox only appears when "Give all players permission to observe?" is checked.

### Need to Change Permissions After Import

Currently, permissions are set during import. To change them:
1. Delete the imported journals
2. Update frontmatter in your Obsidian vault
3. Re-import

Or manually adjust permissions in FoundryVTT:
1. Right-click journal → Configure Ownership
2. Change "Default" permission level

## Advanced Examples

### Campaign with Multiple Player Groups

```markdown
# faction-a-secret.md
---
# Use FoundryVTT's per-user permissions (future feature)
# For now, use separate imports or manual adjustment
---
```

### Progressive Revelation

```markdown
# mystery-clue-1.md
---
permission: limited
---
# Strange Footprints

The party notices unusual tracks...
```

Later, update to:
```markdown
# mystery-clue-1.md
---
permission: observer
---
# Strange Footprints - Identified!

These are werewolf tracks!
```

Re-import to update.

## Limitations

- Permissions are set at journal entry level, not individual page level
- Re-importing doesn't automatically update existing journals (must delete and re-import)
- No per-user permission control via frontmatter (use FoundryVTT's manual configuration)
- No folder-level permission inheritance (must set per-file)

## Future Enhancements

Potential features being considered:
- Per-user permissions via frontmatter
- Folder-level permission inheritance
- Role-based permissions (e.g., `trusted-player`, `new-player`)
- Permission update on re-import

---

**Questions or Issues?**

Report issues or request features at: https://github.com/philote/obsidian-flux/issues