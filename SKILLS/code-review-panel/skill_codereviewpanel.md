---
name: code-review-panel
description: Run parallel code reviews from 5 AI reviewers (3 Claude models + Gemini + Codex), then consolidate and triage findings interactively
---

# Multi-Reviewer Code Review Panel

You are orchestrating a **5-reviewer code review panel**. Your job is to launch all reviewers in parallel, wait for results, deduplicate and rank findings, then walk the user through each issue with choices and a recommendation.

## User Input

```text
$ARGUMENTS
```

If `$ARGUMENTS` is empty, determine the review scope automatically:
1. If there are uncommitted changes (staged, unstaged, or untracked) → review those
2. Else if on a feature branch with commits ahead of main/master → review the branch diff
3. Else → ask the user what to review

If `$ARGUMENTS` is provided, treat it as scope instructions (e.g., specific files, directories, or a description of what to focus on).

## Phase 1: Launch All 5 Reviewers in Parallel

Launch ALL five reviewers simultaneously using the Task tool (multiple tool calls in a single message). Each reviewer gets the same scope but operates independently.

### Reviewer 1: Claude Code-Reviewer (built-in agent)

Use the Task tool with `subagent_type: "superpowers:code-reviewer"`.

Prompt:
```
Review the current codebase for bugs, security issues, API contract mismatches, data integrity problems, and code quality issues. Focus on: $ARGUMENTS (or "all uncommitted changes" if empty).

Examine every source file thoroughly. For each finding, provide:
- Severity (CRITICAL / HIGH / MEDIUM / LOW)
- File path and line number(s)
- Description of the issue
- Recommended fix

Return findings as a structured list sorted by severity.
```

### Reviewer 2: Claude Sonnet (fast, broad coverage)

Use the Task tool with `subagent_type: "general-purpose"` and `model: "sonnet"`.

Prompt:
```
You are a code reviewer. Read all source files in the project and provide a thorough code review. Focus on: $ARGUMENTS (or "all uncommitted changes" if empty).

For each finding include:
- Severity (CRITICAL / HIGH / MEDIUM / LOW)
- File path and line number(s)
- Description of the issue
- Recommended fix

Look for: bugs, logic errors, security vulnerabilities, missing validation, API contract mismatches, data integrity issues, error handling gaps, performance problems, and code quality concerns.

Do NOT use the Edit or Write tools. This is a READ-ONLY review.
```

### Reviewer 3: Claude Opus (deep analysis)

Use the Task tool with `subagent_type: "general-purpose"` and `model: "opus"`.

Prompt:
```
You are a senior code reviewer performing a deep architectural review. Read all source files and analyze: $ARGUMENTS (or "all uncommitted changes" if empty).

For each finding include:
- Severity (CRITICAL / HIGH / MEDIUM / LOW / NIT)
- File path and line number(s)
- Detailed description with code snippets
- Recommended fix

Focus especially on: subtle logic bugs, race conditions, transaction safety, data model integrity, edge cases, and architectural concerns that other reviewers might miss.

Do NOT use the Edit or Write tools. This is a READ-ONLY review.
```

### Reviewer 4: Gemini CLI (external perspective)

Use the Bash tool to run Gemini in sandbox (read-only) mode. Run in background.

**IMPORTANT:** Gemini's `--sandbox` mode disables shell tools (`run_shell_command`), so it cannot run `git diff` itself. Instead, pipe the diff via stdin and use `--prompt` for the review instructions. Gemini retains `read_file` and `search_file_content` tools in sandbox mode, so it can still investigate full source files for context.

```bash
git diff | gemini --sandbox --prompt "Review these code changes for bugs, security issues, logic errors, data integrity problems, and code quality issues. The diff is provided via stdin. Use the read_file tool to examine full source files for additional context when needed. For each finding provide: severity (CRITICAL/HIGH/MEDIUM/LOW), file path, line numbers, description, and recommended fix. Focus on: $ARGUMENTS_OR_DEFAULT"
```

Where `$ARGUMENTS_OR_DEFAULT` is the user's arguments or "all uncommitted changes".

For branch diffs (no uncommitted changes), use `git diff main...HEAD` instead of `git diff`.

### Reviewer 5: Codex CLI (external perspective)

Use the Bash tool to run Codex review. Run in background. Choose the command based on the review scope:

**Scope detection** (check BEFORE launching Codex):
1. Run `git status` and `git log --oneline main..HEAD 2>/dev/null | head -5` to determine scope
2. Pick the Codex command:

| Condition | Command |
|-----------|---------|
| Uncommitted changes exist | `codex review --uncommitted` |
| On a feature branch with commits ahead of main/master | `codex review --base main` (or `--base master`) |
| User specified a commit SHA | `codex review --commit <sha>` |
| User provided a custom prompt (no diff scope) | `codex review "<prompt>"` |
| No uncommitted changes AND on main with no base to diff | Skip Codex with a note: "Codex requires a diff scope — nothing to review" |

**IMPORTANT Codex notes:**
- `--uncommitted`, `--base`, `--commit`, and `[PROMPT]` are mutually exclusive — use only one
- Do NOT use `--approval-mode` (not a valid flag for `codex review`)
- If the user's `$ARGUMENTS` specify a focus area (e.g., "security issues in skills/"), pass it as a prompt: `codex review --base main "Focus on security issues in skills/"`... but note that `--base` and a prompt CAN be combined (prompt adds review instructions on top of the diff)

## Phase 2: Collect Results

Wait for all 5 reviewers to complete. Read background task outputs as needed. If any reviewer fails, note the failure and continue with the results you have. Do NOT block on a single failure.

**Truncation guard**: After collecting each reviewer's output, check whether the result was truncated (look for `[Truncated...]` markers or suspiciously incomplete output like a findings list that ends mid-sentence). If truncation occurred:
1. The TaskOutput result includes an `output_file` path — use the Read tool to read the full file
2. Extract all findings from the complete output before proceeding
3. If you cannot recover the full output, flag it to the user: "Reviewer X output was truncated and could not be fully recovered"

Do NOT proceed to Phase 3 until you have verified that every successful reviewer's findings list is complete.

## Phase 3: Consolidate & Deduplicate

Once all results are in:

1. **Extract all findings** from each reviewer into a unified list
2. **Deduplicate**: Group findings that describe the same underlying issue (even if worded differently)
3. **Count consensus**: Note how many reviewers flagged each issue (e.g., "4/5 reviewers")
4. **Rank by severity and consensus**:
   - CRITICAL issues first, then HIGH, MEDIUM, LOW
   - Within the same severity, issues flagged by more reviewers rank higher
5. **Number the issues** sequentially (Issue 1, Issue 2, ...)

## Phase 4: Interactive Triage

Present the consolidated findings to the user as a numbered summary table:

```
| #  | Severity | Consensus | Issue Summary | Files |
|----|----------|-----------|---------------|-------|
| 1  | CRITICAL | 5/5       | Brief desc    | path  |
| 2  | HIGH     | 4/5       | Brief desc    | path  |
| ...                                                |
```

Then work through issues **one at a time** (or in small batches for LOW/NIT items):

For each issue, use AskUserQuestion to present:
- **What the issue is** (1-2 sentences)
- **Which reviewers flagged it** and their specific observations
- **Your recommendation** (mark it as "(Recommended)" in the options)
- **2-4 action choices** as options (e.g., "Fix now", "Fix differently", "Skip", "Defer")

When the user chooses to fix an issue, implement the fix immediately, then move to the next issue.

For LOW/NIT severity items, you may batch 3-5 together in a single AskUserQuestion with multiSelect enabled, letting the user pick which ones to address.

## Phase 5: Wrap Up

After all issues are triaged:

1. Run the project's test suite to verify nothing broke
2. Run the project's linter to verify clean output
3. Present a final summary:
   - Total issues found across all reviewers
   - Issues fixed vs skipped vs deferred
   - Test and lint results
