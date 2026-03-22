# Skill Authoring Best Practices Reference

Detailed guidance extracted from official Claude documentation.

## Core Principles

### 1. Concise is Key

The context window is a shared resource. Only add context Claude doesn't already have.

**Challenge each piece of information:**
- "Does Claude really need this explanation?"
- "Can I assume Claude knows this?"
- "Does this paragraph justify its token cost?"

### 2. Set Appropriate Degrees of Freedom

| Task Type | Freedom Level | Guidance Style |
|-----------|---------------|----------------|
| Multiple valid approaches | High | Text instructions |
| Preferred pattern exists | Medium | Pseudocode with parameters |
| Fragile/error-prone ops | Low | Exact scripts, no modification |

**Analogy**: Think of Claude as a robot exploring:
- Narrow bridge with cliffs = specific guardrails (low freedom)
- Open field = general direction (high freedom)

### 3. Test with All Target Models

- **Haiku**: Does the skill provide enough guidance?
- **Sonnet**: Is the skill clear and efficient?
- **Opus**: Does the skill avoid over-explaining?

## Progressive Disclosure Details

### Three Levels of Loading

| Level | When Loaded | Token Cost | Content |
|-------|-------------|------------|---------|
| Level 1: Metadata | Always (startup) | ~100 tokens | name + description |
| Level 2: Instructions | When triggered | <5k tokens | SKILL.md body |
| Level 3: Resources | As needed | Unlimited | Bundled files via bash |

### File Organization Patterns

**Pattern 1: High-level guide with references**

```
skill/
├── SKILL.md (overview + quick start)
├── FORMS.md (specialized guide)
├── REFERENCE.md (API details)
└── EXAMPLES.md (common patterns)
```

**Pattern 2: Domain-specific organization**

```
bigquery-skill/
├── SKILL.md (overview and navigation)
└── reference/
    ├── finance.md
    ├── sales.md
    ├── product.md
    └── marketing.md
```

### Longer Reference Files

For files over 100 lines, include a table of contents:

```markdown
# API Reference

## Contents
- Authentication and setup
- Core methods (create, read, update, delete)
- Error handling patterns
- Code examples

## Authentication and setup
...
```

## Content Guidelines

### Avoid Time-Sensitive Information

**Bad:**
```markdown
If you're doing this before August 2025, use the old API.
```

**Good:**
```markdown
## Current method
Use the v2 API endpoint.

## Old patterns
<details>
<summary>Legacy v1 API (deprecated)</summary>
...
</details>
```

### Use Consistent Terminology

Pick one term and use it throughout:

- Always "API endpoint" (not URL, route, path)
- Always "field" (not box, element, control)
- Always "extract" (not pull, get, retrieve)

## Script Best Practices

### Handle Errors Explicitly

**Good:**
```python
def process_file(path):
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError:
        print(f"File {path} not found, creating default")
        with open(path, 'w') as f:
            f.write('')
        return ''
```

**Bad:**
```python
def process_file(path):
    return open(path).read()  # Just fails
```

### Document Configuration Values

**Good:**
```python
# HTTP requests typically complete within 30 seconds
REQUEST_TIMEOUT = 30

# Three retries balances reliability vs speed
MAX_RETRIES = 3
```

**Bad:**
```python
TIMEOUT = 47  # Why 47?
RETRIES = 5   # Why 5?
```

## Iterative Development Process

1. **Complete a task without a skill**: Note what context you repeatedly provide
2. **Identify the reusable pattern**: What would help in similar future tasks?
3. **Create initial skill**: Ask Claude to help structure it
4. **Review for conciseness**: Remove unnecessary explanations
5. **Test on similar tasks**: Use skill with fresh Claude instance
6. **Iterate based on observation**: Fix gaps revealed in real usage

## Checklist Before Sharing

### Core Quality
- [ ] Description includes what AND when to use
- [ ] SKILL.md body under 500 lines
- [ ] No time-sensitive information
- [ ] Consistent terminology
- [ ] Concrete examples (not abstract)
- [ ] File references one level deep
- [ ] Workflows have clear steps

### Code and Scripts (if applicable)
- [ ] Scripts handle errors explicitly
- [ ] No magic numbers (all values documented)
- [ ] Required packages listed
- [ ] Unix-style paths (forward slashes)
- [ ] Validation steps for critical operations

### Testing
- [ ] Tested with target models
- [ ] Verified discovery triggers work
- [ ] Instructions clear without over-explaining
