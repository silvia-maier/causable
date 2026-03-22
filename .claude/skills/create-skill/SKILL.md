---
name: create-skill
description: Create and review Claude Code skills with proper structure, metadata, and best practices. Use when building new custom skills or reviewing existing skills for quality, conciseness, and adherence to best practices.
---

# Create Claude Code Skill

## Purpose

Guide the creation and review of Claude Code skills that follow best practices for discovery, conciseness, and progressive disclosure.

## Skill File Requirements

Every skill requires a `SKILL.md` file with YAML frontmatter:

```yaml
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it.
---
```

### Name Field

- Maximum 64 characters
- Lowercase letters, numbers, and hyphens only
- Use gerund form: `processing-pdfs`, `analyzing-data`, `writing-documentation`
- Avoid: `anthropic`, `claude`, vague names like `helper` or `utils`

### Description Field

- Maximum 1024 characters
- Must include BOTH what the skill does AND when to use it
- Write in third person (injected into system prompt)
- Include key trigger terms for discovery

**Good examples:**

```yaml
description: Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction.
```

```yaml
description: Generate descriptive commit messages by analyzing git diffs. Use when the user asks for help writing commit messages or reviewing staged changes.
```

**Avoid:**

```yaml
description: Helps with documents  # Too vague
description: I can help you process files  # Wrong person
```

## Skill Body Structure

### Conciseness is Critical

The context window is shared. Claude is already smart - only add context Claude doesn't have.

**Good** (~50 tokens):

```markdown
## Extract PDF text

Use pdfplumber:
\`\`\`python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
text = pdf.pages[0].extract_text()
\`\`\`
```

**Bad** (~150 tokens):

```markdown
## Extract PDF text

PDF files are a common format containing text and images.
To extract text, you'll need a library. There are many options
but we recommend pdfplumber because it's easy to use...
```

### Progressive Disclosure Pattern

Keep `SKILL.md` under 500 lines. Split larger content into separate files:

```
my-skill/
├── SKILL.md           # Main instructions (loaded when triggered)
├── REFERENCE.md       # Detailed API reference (loaded as needed)
├── EXAMPLES.md        # Usage examples (loaded as needed)
└── scripts/
    └── validate.py    # Utility script (executed, not loaded)
```

Reference additional files from SKILL.md:

```markdown
## Quick start

[Core instructions here]

## Advanced features

For form filling, see [FORMS.md](FORMS.md)
For API reference, see [REFERENCE.md](REFERENCE.md)
```

**Keep references one level deep** - avoid nested file references.

### Degrees of Freedom

Match specificity to task fragility:

**High freedom** (multiple approaches valid):

```markdown
## Code review process

1. Analyze code structure
2. Check for bugs or edge cases
3. Suggest improvements
```

**Low freedom** (fragile operations):

```markdown
## Database migration

Run exactly:
\`\`\`bash
python scripts/migrate.py --verify --backup
\`\`\`
Do not modify the command.
```

## Workflow Pattern

For complex tasks, provide checklists:

```markdown
## Form Processing Workflow

Copy this checklist:
\`\`\`
Progress:

- [ ] Step 1: Analyze form structure
- [ ] Step 2: Create field mapping
- [ ] Step 3: Validate mapping
- [ ] Step 4: Apply changes
- [ ] Step 5: Verify output
      \`\`\`

**Step 1: Analyze form structure**
[Instructions...]

**Step 2: Create field mapping**
[Instructions...]
```

## Feedback Loop Pattern

For quality-critical operations, include validation:

```markdown
## Editing workflow

1. Make edits
2. **Validate immediately**: `python scripts/validate.py`
3. If validation fails:
   - Review error message
   - Fix issues
   - Validate again
4. **Only proceed when validation passes**
5. Finalize output
```

## Creating a New Skill

### Step 1: Gather Requirements

Ask these questions:

1. What task does this skill accomplish?
2. Who is the audience?
3. What tools/commands are needed?
4. Is this high freedom (flexible) or low freedom (fragile)?
5. Should it include utility scripts?

### Step 2: Draft Metadata

Write the frontmatter with clear name and description:

```yaml
---
name: {gerund-form-name}
description: {what it does}. Use when {trigger conditions}.
allowed-tools: {list of tools if limited}
---
```

### Step 3: Write Core Instructions

Start with a Purpose section, then minimal instructions to accomplish the task.

### Step 4: Add Supporting Content

If needed:

- Workflow checklists for multi-step tasks
- Validation/feedback loops for critical operations
- Examples for output format clarity
- References to additional files for detailed content

### Step 5: Create Skill Directory

```bash
mkdir -p .claude/skills/{skill-name}
```

Place `SKILL.md` and any supporting files in this directory.

## Anti-Patterns to Avoid

- **Over-explaining**: Claude knows common concepts
- **Multiple options without default**: Provide a recommended approach
- **Deeply nested references**: Keep file references one level deep
- **Windows paths**: Always use forward slashes
- **Time-sensitive info**: Avoid dates that will become stale
- **Inconsistent terminology**: Pick one term per concept

## Skill Template

```markdown
---
name: {skill-name}
description: {What it does}. Use when {trigger conditions}.
---

# {Skill Title}

## Purpose

{One sentence describing what this skill accomplishes.}

## Quick Start

{Minimal example or command to get started.}

## Workflow

{Numbered steps if multi-step process.}

## References

{Links to additional files if using progressive disclosure.}
```

## Testing Your Skill

1. Test with a fresh conversation to verify discovery triggers
2. Check that instructions are clear enough without over-explaining
3. Verify any scripts execute correctly
4. Ensure file references load properly

## Reviewing an Existing Skill

Use this checklist to evaluate skill quality:

### Metadata Review

```
- [ ] Name follows conventions (lowercase, hyphens, gerund form)
- [ ] Name is under 64 characters
- [ ] Description explains WHAT the skill does
- [ ] Description explains WHEN to use it
- [ ] Description uses third person
- [ ] Description includes trigger terms for discovery
```

### Content Review

```
- [ ] SKILL.md is under 500 lines
- [ ] No unnecessary explanations (Claude already knows common concepts)
- [ ] Consistent terminology throughout
- [ ] No time-sensitive information
- [ ] Examples are concrete, not abstract
```

### Structure Review

```
- [ ] Has clear Purpose section
- [ ] Instructions are actionable
- [ ] Complex tasks have workflow/checklist
- [ ] File references are one level deep (not nested)
- [ ] Uses forward slashes in paths
```

### Freedom Level Review

Assess if freedom level matches task type:

- High freedom tasks: General guidance, multiple approaches OK
- Low freedom tasks: Exact commands, specific scripts, no deviation

### Scripts Review (if applicable)

```
- [ ] Scripts handle errors explicitly
- [ ] No magic numbers (constants are documented)
- [ ] Required packages are listed
- [ ] Validation/feedback loops for critical operations
```

### Review Output Format

After reviewing, provide:

1. **Summary**: Overall quality assessment (Good / Needs Work / Major Issues)
2. **Strengths**: What the skill does well
3. **Issues**: Specific problems found with line references
4. **Recommendations**: Concrete fixes, prioritized by impact

For detailed best practices, see [BEST-PRACTICES.md](BEST-PRACTICES.md)
