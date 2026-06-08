---
name: double-diamond-ideation
description: Use this skill for LLM-assisted idea generation, startup ideation, niche finding, product strategy exploration, positioning discovery, pitch clarification, or when the user wants to "think broadly then specify", use a double diamond, find a wedge, handle complexity, turn a vague idea into a sharp target customer/use case, or avoid premature narrowing. This skill is especially important when the user is overwhelmed by alternatives, competitors, edge cases, or technical complexity and needs a structured process to diverge, converge, diverge again, and converge into a clear idea, niche, or pitch.
---

# Double Diamond Ideation

Use this skill to help the user move from a vague or complex idea to a sharp, scoped concept. The core pattern is:

**Diverge broadly -> converge on the strongest problem/wedge -> diverge on solution/positioning options -> converge on a specific, testable concept.**

This is useful because LLMs are strongest when they can generate many plausible perspectives, but weak outputs happen when the model picks a polished answer too early. The skill forces breadth first, then structured narrowing.

## Core Principle

Do not start by asking: "What is the best idea?"

Start by asking:

**"What are all the plausible problem spaces, customer moments, alternatives, pains, and wedges this idea could contain?"**

Then narrow based on evidence, intensity, and clarity.

The goal is not to find a universally true idea. The goal is to find the smallest scope where the idea becomes maximally true, useful, and pitchable.

## When To Use

Use this skill when the user wants to:

1. Generate startup ideas or product ideas.
2. Find a niche, ICP, wedge, or first market.
3. Turn a broad concept into a specific use case.
4. Clarify a pitch or value proposition.
5. Handle complexity without flattening the truth.
6. Compare many possible audiences, use cases, or product directions.
7. Use LLMs systematically for ideation rather than asking for one answer.
8. Avoid technical-founder overthinking around competitors, alternatives, and edge cases.

## Required Mindset

Treat ideation as search, not as immediate answer generation.

Bad pattern:

**User gives idea -> assistant chooses one positioning -> assistant writes pitch.**

Good pattern:

**User gives idea -> assistant expands the map -> assistant clusters options -> assistant selects promising wedges -> assistant stress-tests them -> assistant specifies one or more concrete concepts.**

## Workflow

### File-Based Operating Model

This skill should not rely on one-session memory for serious ideation work.

When filesystem access is available, create a project workspace and write every phase to files. Later phases must read the previous files before synthesizing the next stage.

Use this structure:

```text
{project-name}/
├── PROGRESS.md
├── 00-intake/
│   ├── brief.md
│   └── checkpoint.md
├── 01-discover/
│   ├── wide-map.md
│   └── checkpoint.md
├── 02-define/
│   ├── clusters.md
│   ├── candidate-wedges.md
│   ├── scoring.md
│   └── checkpoint.md
├── 03-develop/
│   ├── solution-shapes.md
│   └── checkpoint.md
├── 04-deliver/
│   ├── concept.md
│   ├── validation-plan.md
│   ├── pitch.md
│   └── checkpoint.md
└── raw/
    └── notes.md
```

Use a kebab-case project name based on the user's idea, such as `ai-compliance-assistant` or `creator-update-workflows`. If no name is obvious, ask for one or choose a neutral descriptive name.

If filesystem access is not available, simulate the same structure in the response with clear file labels. Do not collapse the workflow into one unstructured answer.

### Phase-Gated Execution

Do not generate the whole workspace in one pass by default.

This skill works by alternating between:

1. Read previous artifacts.
2. Produce exactly the next phase artifact(s).
3. Re-read or inspect the new artifact(s).
4. Write a concise `checkpoint.md` for that phase.
5. Update `PROGRESS.md`.
6. Stop and present the checkpoint to the user.

The checkpoint is not private chain-of-thought. It is a decision record: what was learned, what changed, what candidates remain, what was rejected, and what the next phase should do.

Default rule:

**Complete at most one phase per assistant turn.**

Only continue into the next phase when one of these is true:

1. The user explicitly says to continue.
2. The user explicitly asked for an unattended full run.
3. The current phase is purely mechanical and has no real decision point.

Even in an unattended full run, do not write all files in a single reasoning pass. Run the same loop internally for each phase: write artifact, inspect it, write checkpoint, update progress, then continue.

Important convergence gates:

1. After `01-discover/wide-map.md`, stop before clustering unless the user asked for unattended continuation.
2. After `02-define/scoring.md`, stop before solution-shape development unless the user confirms or unattended continuation was requested.
3. After `03-develop/solution-shapes.md`, stop before final concept selection unless the user confirms or unattended continuation was requested.

### Resume Behavior

Before starting a new session, check whether a relevant ideation workspace already exists in the current directory or subdirectories.

If `{project-name}/PROGRESS.md` exists:

1. Read `PROGRESS.md`.
2. Read the latest completed phase files.
3. Resume from the first incomplete phase.
4. Do not redo earlier phases unless the user asks or the prior files are clearly insufficient.

### Progress Tracking

Create and update `{project-name}/PROGRESS.md` after every phase.

Use this format:

```markdown
# Progress: {project-name}

*Skill: double-diamond-ideation | Started: {date}*

## Context

**Starting idea:**
**Language:**
**Mode:** File-based / Simulated files
**Current phase:**

## Phase Checklist

- [ ] 00 Intake
- [ ] 01 Discover: wide map
- [ ] 02 Define: clusters, candidate wedges, scoring
- [ ] 03 Develop: solution shapes
- [ ] 04 Deliver: concept, validation plan, pitch

## Decisions

- [Decision log entries]

## Open Questions

- [Questions that need user input or validation]
```

### File Rules

1. Write each phase artifact immediately after completing that phase.
2. Read the previous phase files before creating the next phase artifact.
3. Write a `checkpoint.md` before marking a phase complete.
4. Do not write later-phase files before the earlier phase checkpoint exists.
5. Keep raw exploration in `raw/` or phase files; keep final recommendations in `04-deliver/`.
6. Do not overwrite user-edited files blindly. If a file exists, read it first and append or update carefully.
7. Every artifact should include a short header: `# {Title}: {project-name}` and `*Skill: double-diamond-ideation | Generated: {date}*`.

### Required Resource Rules

Bundled resources are not optional inspiration. They are required inputs for the parts of the workflow they support.

Load these files before producing the corresponding output:

1. **Always load `data/lens-bank.json` before Phase 1 divergence.** Use it to broaden audiences, moments, alternatives, broken tradeoffs, solution shapes, and validation tests.
2. **Always load `references/scoring-rubric.md` before Phase 3 convergence.** Use it whenever ranking niches, wedges, audiences, or solution shapes.
3. **Always load `references/anti-patterns.md` when the user mentions complexity, competitors, edge cases, technical-founder overthinking, vague pitches, or simplifying without lying.**
4. **Always load `references/double-diamond-canvas.md` when the user wants a full ideation session, workshop-style flow, worksheet, or guided end-to-end process.**
5. **Always load `references/artifact-templates.md` before writing or updating phase files.** Use its templates for `PROGRESS.md`, intake, wide map, clusters, scoring, solution shapes, concept, validation, and pitch artifacts.

If a required resource cannot be loaded, state that the corresponding phase cannot be completed properly and continue only with phases whose required inputs are available.

### Phase 0: Frame The Starting Point

First capture the current raw material. Keep this short.

Ask or infer:

1. What is the rough idea?
2. What domain or market is it in?
3. Who might care?
4. What triggered the idea?
5. What feels unclear right now: niche, pain, solution, pitch, business model, differentiation, or all of them?

If the user already gave enough context, do not over-interview. Move into divergence.

Write the result to `{project-name}/00-intake/brief.md`.
Inspect the brief, then write `{project-name}/00-intake/checkpoint.md` with:

1. What the starting idea appears to be.
2. What is still ambiguous.
3. Whether there is enough input to diverge.
4. The recommended next action.

Update `PROGRESS.md`. Stop unless the user explicitly asked to continue.

### Phase 1: Diverge On The Problem Space

Before this phase, load `data/lens-bank.json`. Use its lenses as the minimum divergence set, then add context-specific lenses relevant to the user's domain.

Read `{project-name}/00-intake/brief.md` before writing the wide map.

Generate a broad map before judging. Explore at least these lenses:

1. **Audience lenses:** Who could have this problem?
2. **Moment lenses:** When does the problem become acute?
3. **Pain lenses:** What is slow, expensive, risky, confusing, embarrassing, or repetitive?
4. **Alternative lenses:** What do people do today instead?
5. **Budget lenses:** Who already spends money, time, status, or attention on this?
6. **Frequency lenses:** Where does the problem happen repeatedly?
7. **Urgency lenses:** Where does delay hurt?
8. **Trust lenses:** Where does the user need confidence, verification, or accountability?
9. **Complexity lenses:** Where are current workflows too hard to manage?
10. **Market timing lenses:** What changed recently that makes this newly possible or more painful?

If current market facts, competitor claims, pricing, regulations, or recent trends matter, research them with web search and cite sources. If the task is purely conceptual, stay offline.

Write the result to `{project-name}/01-discover/wide-map.md`.
Inspect the wide map, then write `{project-name}/01-discover/checkpoint.md` with:

1. The strongest audience/moment patterns.
2. Surprising or weak opportunity areas.
3. Which areas should be clustered next.
4. Any missing information that would improve clustering.

Update `PROGRESS.md`. Stop unless the user explicitly asked to continue.

### Phase 2: Cluster The Map

Read `{project-name}/01-discover/wide-map.md` before clustering.

Group the broad ideas into clusters. Do not score individual random ideas yet; score clusters first.

Useful cluster types:

1. Customer segment clusters.
2. Workflow/job-to-be-done clusters.
3. Pain intensity clusters.
4. Current alternative clusters.
5. Distribution channel clusters.
6. Willingness-to-pay clusters.
7. Technical feasibility clusters.
8. Pitch simplicity clusters.

For each cluster, write:

1. Who is this for?
2. What painful moment defines it?
3. What do they use today?
4. Why does that alternative break?
5. Why might this be a good wedge?
6. What makes it risky or weak?

Write the result to `{project-name}/02-define/clusters.md`.
Inspect the clusters, then write or update `{project-name}/02-define/checkpoint.md` with:

1. Which clusters look strongest.
2. Which clusters look weak or too broad.
3. What the scoring phase should pay attention to.

Update `PROGRESS.md`. Stop unless the user explicitly asked to continue.

### Phase 3: Converge On Candidate Niches

Before this phase, load `references/scoring-rubric.md`. Use its dimensions, interpretation bands, tie-breakers, red flags, and green flags when comparing candidates.

Read `{project-name}/02-define/clusters.md` before selecting and scoring candidates.

Pick 3-5 candidate niches. Use this scoring rubric:

1. **Pain intensity:** Is the problem expensive, risky, or deeply annoying?
2. **Frequency:** Does it happen often enough to matter?
3. **Reachability:** Can this audience be found and sold to?
4. **Budget:** Do they already spend money or effort here?
5. **Alternative weakness:** Is today's solution clearly flawed?
6. **Value clarity:** Can the benefit be understood without a long explanation?
7. **Scope control:** Is the use case narrow enough that edge cases do not dominate?
8. **Founder advantage:** Does the user have insight, credibility, access, or speed here?

Use simple scoring from 1-5. Explain tradeoffs, not just totals. A niche with a lower total can still be best if it is sharper, easier to test, or more founder-aligned.

Write candidate descriptions to `{project-name}/02-define/candidate-wedges.md`.
Write scoring details to `{project-name}/02-define/scoring.md`.
Inspect the candidates and scoring, then update `{project-name}/02-define/checkpoint.md` with:

1. Recommended wedge.
2. Runner-up wedge.
3. Why the recommendation won.
4. Which assumptions could reverse the decision.
5. Whether to proceed to solution-shape divergence.

Update `PROGRESS.md`. Stop unless the user explicitly asked to continue.

### Phase 4: Diverge On Solution Shapes

Use the `solution_shapes` in `data/lens-bank.json` as the minimum set for this phase. If Phase 1 already loaded that file, reuse it; otherwise load it before generating solution shapes.

Read `{project-name}/02-define/candidate-wedges.md` and `{project-name}/02-define/scoring.md` before generating solution shapes.

After selecting promising niches, broaden again. For each candidate niche, generate multiple solution shapes:

1. Tool.
2. Managed service.
3. Marketplace.
4. Workflow automation.
5. AI copilot.
6. Monitoring/verification layer.
7. Infrastructure/API.
8. Community or expert network.
9. Vertical SaaS.
10. Productized service.

Do not assume the first product form is correct. Sometimes the same insight should become a service first, a tool later, or a narrow wedge before a platform.

For each solution shape, answer:

1. What does the customer input?
2. What outcome do they receive?
3. What does the product remove from their life?
4. What must the product be excellent at?
5. What is the smallest credible version?
6. What would make the customer trust it?

Write the result to `{project-name}/03-develop/solution-shapes.md`.
Inspect the solution shapes, then write `{project-name}/03-develop/checkpoint.md` with:

1. Best solution shape.
2. Best low-build / concierge shape.
3. Highest-risk shape.
4. What the final concept should preserve.
5. What should be excluded.

Update `PROGRESS.md`. Stop unless the user explicitly asked to continue.

### Phase 5: Converge On A Specific Concept

Read `{project-name}/03-develop/solution-shapes.md`, `{project-name}/02-define/scoring.md`, and `{project-name}/01-discover/wide-map.md` before choosing the final concept.

Choose the strongest concept and specify it tightly.

Use this template:

```markdown
## Concept

**One-liner:** [Specific customer] gets [specific outcome] without [specific painful alternative/tradeoff].

**Customer:** [Narrow audience]

**Painful moment:** [Concrete situation where the problem becomes urgent]

**Current alternative:** [What they do today]

**Broken tradeoff:** [Why the alternative is bad]

**Product promise:** [The before/after transformation]

**First wedge:** [The narrow initial use case]

**Not for now:** [Explicit exclusions]

**Why now:** [Timing if relevant]

**Risks:** [Top assumptions that could kill the idea]

**Fastest test:** [How to validate without building too much]
```

Write the final concept to `{project-name}/04-deliver/concept.md`.
Inspect the concept, then write `{project-name}/04-deliver/checkpoint.md` with:

1. Whether the concept is scoped enough.
2. Whether the one-liner is understandable.
3. Which assumptions need validation.
4. Whether validation and pitch files can be written next.

Update `PROGRESS.md`. Stop unless the user explicitly asked to continue.

### Phase 6: Stress-Test The Concept

Read `{project-name}/04-deliver/concept.md` before stress-testing.

Stress-test without destroying focus.

Ask:

1. Is this true for the chosen scope?
2. Is the customer specific enough?
3. Is the painful moment real and repeated?
4. Is the current alternative named?
5. Is the alternative's tradeoff obvious?
6. Can the value be explained in one sentence?
7. Are edge cases moved to "not for now" instead of corrupting the core?
8. Is the idea testable within days, not months?

If the concept fails, do not patch the wording. Go back to the relevant phase:

1. If customer is vague, return to Phase 1 or 3.
2. If pain is weak, return to Phase 1.
3. If solution feels arbitrary, return to Phase 4.
4. If pitch is complex, narrow the scope.

Write the validation plan to `{project-name}/04-deliver/validation-plan.md`.
Write pitch-ready messaging to `{project-name}/04-deliver/pitch.md`.
Update `{project-name}/04-deliver/checkpoint.md` with:

1. Final concept decision.
2. Fastest validation path.
3. Pitch scope.
4. Remaining open questions.

Update `PROGRESS.md`.

## Handling Complexity

If the user is asking about complexity, competitors, edge cases, technical-founder overthinking, vague pitches, or simplifying without lying, load `references/anti-patterns.md` before answering this section.

Complex ideas need ordering, not full deletion.

Sort every detail into:

1. **Core:** The main customer transformation.
2. **Proof:** Evidence or mechanics that make the claim believable.
3. **Scope:** The boundary where the claim is true.
4. **FAQ:** Edge cases and objections to answer later.

Never let FAQ details lead the pitch. They are real, but they are not the story.

## Technical Founder Pattern

Technical founders often block themselves because they see too many true things:

1. Competitors can do parts of it.
2. Edge cases exist.
3. The value statement is not true for every customer.
4. The product mechanics are complicated.
5. The market category is messy.

The response is not to ignore reality. The response is to scope the claim until it becomes true.

Use this rule:

**Do not weaken the statement first. Narrow the customer/context first.**

Weak:

**"We kind of help with app development."**

Scoped and strong:

**"We help non-technical app owners ship reliable updates without managing developers."**

## Deliverable Modes

Choose the target depth based on the user's request, but still execute through phase gates.

In every mode, work on the next incomplete phase only by default. Do not batch-create all listed files in one pass. The lists below define the target artifact set, not a command to write everything immediately.

### Exploration Only

Target artifact set:

1. `PROGRESS.md`
2. `00-intake/brief.md`
3. `00-intake/checkpoint.md`
4. `01-discover/wide-map.md`
5. `01-discover/checkpoint.md`
6. `02-define/clusters.md`
7. `02-define/checkpoint.md`

Final response at each gate: summarize the latest checkpoint, link the files, and state the next incomplete phase.

### Wedge Selection

Target artifact set:

1. `PROGRESS.md`
2. `00-intake/brief.md`
3. `00-intake/checkpoint.md`
4. `01-discover/wide-map.md`
5. `01-discover/checkpoint.md`
6. `02-define/clusters.md`
7. `02-define/candidate-wedges.md`
8. `02-define/scoring.md`
9. `02-define/checkpoint.md`

Final response at each gate: name the current decision, unresolved uncertainty, and next incomplete phase.

### Full Concept Development

Target artifact set:

1. `PROGRESS.md`
2. `00-intake/brief.md`
3. `00-intake/checkpoint.md`
4. `01-discover/wide-map.md`
5. `01-discover/checkpoint.md`
6. `02-define/clusters.md`
7. `02-define/candidate-wedges.md`
8. `02-define/scoring.md`
9. `02-define/checkpoint.md`
10. `03-develop/solution-shapes.md`
11. `03-develop/checkpoint.md`
12. `04-deliver/concept.md`
13. `04-deliver/validation-plan.md`
14. `04-deliver/pitch.md`
15. `04-deliver/checkpoint.md`

Final response at each gate: summarize the latest checkpoint and key file paths. Do not paste every artifact back into chat.

### Pitch Clarification

If the user only asks for pitch clarification but no full ideation session, still create or update:

1. `PROGRESS.md`
2. `00-intake/brief.md`
3. `00-intake/checkpoint.md`
4. `02-define/candidate-wedges.md`
5. `02-define/checkpoint.md`
6. `04-deliver/pitch.md`
7. `04-deliver/checkpoint.md`

If complexity, competitors, or edge cases are involved, also load `references/anti-patterns.md` and include a Core/Proof/Scope/FAQ split in `04-deliver/pitch.md`.

## Quality Bar

A good result should feel narrower than the user's starting idea but stronger, not smaller and weaker.

The final idea should answer:

1. Who exactly is it for?
2. When do they need it?
3. What do they do today?
4. Why does today's option fail?
5. What changes after using this?
6. What is excluded for now?
7. How can this be tested quickly?

If those answers are missing, continue narrowing.

## Reference Files

Read the required file at the phase where it applies.

| File | When To Read | Purpose |
| --- | --- | --- |
| `references/artifact-templates.md` | Before writing or updating any phase artifact | Stable markdown templates for `PROGRESS.md` and all stage files |
| `data/lens-bank.json` | Before Phase 1 and Phase 4 | Divergence lenses, solution shapes, scoring dimensions, validation tests |
| `references/scoring-rubric.md` | Before Phase 3 | Wedge scoring, interpretation bands, tie-breakers, red/green flags |
| `references/anti-patterns.md` | When complexity, competitors, edge cases, or vague pitches appear | Failure modes and corrections for truthful simplification |
| `references/double-diamond-canvas.md` | For full guided sessions, workshops, or reusable worksheets | Complete Discover/Define/Develop/Deliver canvas |
