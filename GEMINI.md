# Project Instructions: TKV KPI Evaluation Platform

This project strictly enforces the **Superpowers** software development methodology (by Jesse Vincent / obra) integrated with Google Antigravity.

---

## 1. The Core 1% Rule

> **EXTREMELY IMPORTANT:**
> If you think there is even a 1% chance a skill applies to what you are doing, you **ABSOLUTELY MUST** invoke that skill before taking action.
> 
> You MUST NOT write code, explore files blindly, or jump into implementation without invoking the relevant process skill first.
> Skill priority: **Process skills come first** (e.g. `brainstorming`, `systematic-debugging`), followed by execution skills.

---

## 2. Skills Inventory & When to Invoke

All skills are installed in `.agents/skills/`. Read the corresponding `SKILL.md` file before starting work:

| Skill | Trigger / When to Use | Path |
| :--- | :--- | :--- |
| **`brainstorming`** | Starting any new feature, page, UI component, calculation, or architectural decision. Ask clarifying questions one by one; clarify user intent and constraints before planning or coding. | `.agents/skills/brainstorming/SKILL.md` |
| **`writing-plans`** | Once the design/spec is agreed upon, create a comprehensive, granular implementation plan with bite-sized tasks and clear test criteria. | `.agents/skills/writing-plans/SKILL.md` |
| **`executing-plans`** / **`subagent-driven-development`** | Executing implementation plans systematically. Execute step-by-step without stopping for trivial confirmations; update task checklists as you go. | `.agents/skills/executing-plans/SKILL.md` |
| **`test-driven-development`** | Writing any business logic, API route, score calculation, RBAC rule, or state transition. Follow Red-Green-Refactor: write failing test first, verify failure, write minimal code to pass, refactor. | `.agents/skills/test-driven-development/SKILL.md` |
| **`systematic-debugging`** | Any bug report, unexpected error, Supabase issue, or test failure. NO guess-and-check coding. Form hypotheses, trace root cause, reproduce with a test, fix, and verify. | `.agents/skills/systematic-debugging/SKILL.md` |
| **`verification-before-completion`** | Before claiming ANY task or feature is complete. Run the test suite, lint, verify runtime behavior, and provide concrete evidence of correctness. | `.agents/skills/verification-before-completion/SKILL.md` |
| **`requesting-code-review`** / **`receiving-code-review`** | Conduct rigorous code reviews for spec compliance, security, edge cases, RBAC permissions, and code health. | `.agents/skills/requesting-code-review/SKILL.md` |
| **`finishing-a-development-branch`** | Preparing commits, checking branch health, and merging or preparing PRs cleanly. | `.agents/skills/finishing-a-development-branch/SKILL.md` |

---

## 3. Tool Mapping for Antigravity

- **Task Tracking**: Use task artifacts or markdown checklists (e.g., in `.superpowers/` or artifact files) to track progress. Mark tasks `- [x]` as they complete. Do not use `manage_task` for checklists (`manage_task` is strictly for background processes).
- **Subagents**: Use `invoke_subagent` when dispatching parallel tasks or isolated investigations.
- **Testing & Verification**: Use `run_command` to execute test runners (`npm test`, `npx vitest`, `pytest`, etc.) and verify dev server status. Never assume tests pass without running them.
- **File Modifications**: Use `replace_file_content` / `multi_replace_file_content` for precise edits; `write_to_file` for new files.

---

## 4. Domain & Architecture Specifications

Refer to [CLAUDE.md](file:///e:/Vibe%20Coding/KPT_TKV/CLAUDE.md) for full project domain knowledge:
- **10 Core Evaluation Criteria**: 100-point rating scale (Câu 1 - 10).
- **Classification**: Giỏi ($\ge 80$), Khá ($65 - 79$), Trung Bình ($50 - 64$), Yếu ($< 50$).
- **Workflow**: 3 tiers (Nhân viên tự đánh giá -> Quản lý thẩm định -> Hội đồng phê duyệt).
- **RBAC Scopes**: Scopes for 12 departments (HC01, KD01, DTK01, KT01, IT/TKV09, BGD01/Admin).
- **Stack**: Next.js 15+ App Router, TypeScript, Tailwind CSS, Supabase PostgreSQL.

---

## 5. Red Flags (Stop Rationalizing)

| Rationalization | Reality |
| :--- | :--- |
| *"This is just a simple question / quick fix"* | Questions are tasks. Check skills first. |
| *"Let me write the code first and test later"* | Violates TDD. Write failing test first. |
| *"I think I know why this broke, let me tweak it"* | Violates systematic-debugging. Reproduce and trace root cause first. |
| *"The skill is overkill for this small feature"* | Small features grow complex. Follow the process. |
| *"I can explore files quickly before checking skills"* | Skills define HOW to explore and gather context. Invoke first. |
