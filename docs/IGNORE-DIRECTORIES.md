# Ignore Directories Guide

Obsidian Flux allows you to selectively exclude directories from import, making it easy to keep reference materials, sourcebooks, and other content out of your FoundryVTT journals.

## Quick Start

In the import dialog, use the **"Ignore directories"** textarea to list directories you want to exclude:

```
reference-books
sourcebooks
assets/old
```

Each directory name should be on its own line. That's it!

## How It Works

### Basic Matching

The ignore system uses **path segment matching**, which means it looks for your specified directory name as a complete folder in the file path.

**Example:** If you add `reference-books` to the ignore list:

| File Path | Ignored? | Reason |
|-----------|----------|--------|
| `reference-books/PHB.md` | ✅ Yes | Starts with the directory |
| `reference-books/spells/fireball.md` | ✅ Yes | Inside the directory |
| `campaign/reference-books/notes.md` | ✅ Yes | Contains directory in path |
| `my-reference-book.md` | ❌ No | Not a directory, just similar filename |
| `reference-bookshelves/note.md` | ❌ No | Different directory name |

### Case Insensitivity

Directory matching is **case-insensitive** for convenience:

```
Reference-Books
reference-books
REFERENCE-BOOKS
```

All three variations will match `reference-books`, `Reference-Books`, or any other case combination.

### Nested Paths

You can specify nested paths to ignore specific subdirectories:

```
campaign-notes/old-sessions
assets/images/stock
reference/5e/monsters
```

This allows fine-grained control - you can ignore `reference/5e` while still importing `reference/homebrew`.

## Common Use Cases

### Case 1: Exclude Reference Materials

You have official sourcebooks and rules reference in your vault but don't want them in FoundryVTT:

```
PHB
DMG
XGE
TCE
VGTM
reference/official-content
```

### Case 2: Exclude Work-in-Progress

Keep drafts and unfinished content out of your game:

```
drafts
wip
scratch
ideas
brainstorming
```

### Case 3: Exclude Old Campaign Content

Archive old campaigns while keeping your vault organized:

```
campaigns/2023-strahd
campaigns/archive
old-campaigns
season-1
```

### Case 4: Exclude Templates and Meta Content

Skip Obsidian-specific organizational content:

```
templates
_templates
.obsidian
assets/templates
meta
```

### Case 5: Exclude Asset Source Files

Import finished maps and handouts, but not source files:

```
assets/source
maps/photoshop
images/raw
audio/stems
```

### Case 6: Partial Vault Import

Only import specific campaign content, ignore everything else:

**Your vault structure:**
```
my-vault/
├── current-campaign/     (IMPORT THIS)
├── reference-books/      (IGNORE)
├── other-campaigns/      (IGNORE)
├── worldbuilding/        (IMPORT THIS)
└── player-handouts/      (IMPORT THIS)
```

**Ignore list:**
```
reference-books
other-campaigns
```

## Advanced Techniques

### Organize Your Vault for Easy Filtering

Structure your vault with ignore-friendly organization:

```
my-vault/
├── for-import/
│   ├── npcs/
│   ├── locations/
│   └── quests/
└── dont-import/
    ├── reference/
    ├── drafts/
    └── personal-notes/
```

Then simply ignore:
```
dont-import
```

### Use Descriptive Prefixes

Prefix directories you never want to import:

```
my-vault/
├── ARCHIVED-old-campaign/
├── DRAFT-new-adventure/
├── REF-monster-manual/
└── campaign/
```

Ignore all at once with pattern-like naming:
```
ARCHIVED-old-campaign
DRAFT-new-adventure
REF-monster-manual
```

### Test with Small Imports First

Before importing your entire vault:

1. Import just one folder to test
2. Verify ignored directories are excluded
3. Check that wanted content is included
4. Then import the full vault

## Troubleshooting

### Directory Not Being Ignored

**Problem:** Files from a directory are still being imported.

**Check:**
1. Verify exact directory name spelling
2. Check for extra spaces in the textarea
3. Ensure directory name is on its own line
4. Try refreshing FoundryVTT after changing settings

**Example Fix:**
```
Wrong:  reference books      (has space instead of dash)
Right:  reference-books

Wrong:  reference-books,sourcebooks    (comma-separated)
Right:  reference-books
        sourcebooks
```

### Too Many Files Being Ignored

**Problem:** Files you want are being skipped.

**Likely cause:** Your directory name is too generic and matching unintended paths.

**Example:**
```
Ignoring: notes
Problem: Matches campaign-notes/, session-notes/, player-notes/
```

**Solution:** Be more specific:
```
Better: reference-notes
        archive-notes
```

Or use nested paths:
```
Better: reference/notes
        archive/notes
```

### Forgot What You're Ignoring

**Problem:** Can't remember what directories are in your ignore list.

**Solution:**
1. Open the import dialog
2. Your previous settings are restored automatically
3. Check the "Ignore directories" textarea

Settings persist between imports, so your list is always saved.

### Want to Re-Import Ignored Content

**Steps:**
1. Open import dialog
2. Remove directory names from the textarea
3. Re-run the import

Or, to import ONLY previously ignored content:
1. Clear the textarea
2. Add all OTHER directories to ignore
3. Import (inverted selection)

## Best Practices

### 1. Keep a Master Ignore List

Document your standard ignore list in your vault:

```markdown
# Import Settings

## Directories to Ignore
- reference-books
- sourcebooks
- drafts
- archive
- assets/stock
```

Copy-paste when importing.

### 2. Use Consistent Naming

Establish directory naming conventions:

- `_private/` - Personal notes
- `_draft/` - Work in progress
- `_archive/` - Old content
- `_ref/` - Reference materials

Prefix makes them easy to spot and ignore.

### 3. Review Before Big Imports

Before importing a large vault:

1. List all top-level directories
2. Decide which to import
3. Add the rest to ignore list
4. Import and verify

### 4. Separate Reference from Content

Organize vault with clear separation:

```
my-vault/
├── game-content/         (always import)
│   ├── npcs/
│   ├── locations/
│   └── quests/
└── reference/            (always ignore)
    ├── rules/
    ├── lore/
    └── inspiration/
```

Consistent structure makes future imports easier.

### 5. Document Your Choices

Add a note in your vault explaining your import strategy:

```markdown
# Foundry Import Guide

## What Gets Imported
- Current campaign content
- Worldbuilding notes
- NPCs and locations
- Quests and plot threads

## What Stays in Obsidian
- Reference books (PHB, DMG, etc.)
- Session prep and planning
- Personal DM notes
- Campaign archives
```

## Limitations

### Current Limitations

1. **No wildcard/glob patterns** (yet)
   - Can't use `**/drafts` or `*.pdf`
   - Must list each directory explicitly

2. **Directory-level only**
   - Can't filter individual files
   - Can't filter by file extension via this feature
   - All files in a directory are ignored

3. **No preview**
   - Can't see what will be ignored before import
   - Have to run import to verify

4. **Case-insensitive only**
   - Can't have case-sensitive matching
   - `notes` and `Notes` are treated the same

### Workarounds

**Want to ignore file types?**
- Organize files by type into folders
- Ignore those folders

**Want wildcard matching?**
- Use consistent naming prefixes
- List each directory

**Want to preview what will be ignored?**
- Import to a test world first
- Or do a small test import

## Future Enhancements

Potential features being considered:

- Glob pattern support (`**/drafts`, `*.pdf`)
- Preview/dry-run mode
- File-level filtering
- Import profiles (save multiple ignore configurations)
- Smart suggestions based on vault structure

## Examples by Vault Type

### Campaign-Focused Vault

```
# Vault structure
my-campaign/
├── session-notes/       ✅ Import
├── npcs/               ✅ Import
├── locations/          ✅ Import
├── rules-reference/    ❌ Ignore
└── dm-only/           ❌ Ignore

# Ignore list
rules-reference
dm-only
```

### Multi-Campaign Vault

```
# Vault structure
all-campaigns/
├── waterdeep-campaign/  ✅ Import (current)
├── strahd-campaign/     ❌ Ignore (complete)
├── homebrew-campaign/   ❌ Ignore (future)
├── shared-npcs/        ✅ Import
└── reference/          ❌ Ignore

# Ignore list
strahd-campaign
homebrew-campaign
reference
```

### Worldbuilding Vault

```
# Vault structure
my-world/
├── published-lore/     ✅ Import (for players)
├── secret-lore/        ❌ Ignore (GM only - use gm-only: true instead)
├── maps/              ✅ Import
├── references/        ❌ Ignore
└── inspiration/       ❌ Ignore

# Ignore list
references
inspiration
```

Note: For secret-lore, consider using the `gm-only: true` frontmatter instead of ignoring, so you still have it in FoundryVTT for GM reference.

---

**Questions or Issues?**

Report issues or request features at: https://github.com/philote/obsidian-flux/issues