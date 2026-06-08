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

### Phase 0: Frame The Starting Point

First capture the current raw material. Keep this short.

Ask or infer:

1. What is the rough idea?
2. What domain or market is it in?
3. Who might care?
4. What triggered the idea?
5. What feels unclear right now: niche, pain, solution, pitch, business model, differentiation, or all of them?

If the user already gave enough context, do not over-interview. Move into divergence.

### Phase 1: Diverge On The Problem Space

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

### Phase 2: Cluster The Map

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

### Phase 3: Converge On Candidate Niches

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

### Phase 4: Diverge On Solution Shapes

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

### Phase 5: Converge On A Specific Concept

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

### Phase 6: Stress-Test The Concept

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

## Handling Complexity

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

## Output Formats

Choose the output format based on the user's request.

### If The User Wants Exploration

Use:

```markdown
## Wide Map
[Broad opportunity map across audiences, moments, pains, alternatives]

## Clusters
[Grouped opportunity areas]

## Candidate Niches
[3-5 scored niches with tradeoffs]

## Recommendation
[Best next narrowing move]
```

### If The User Wants A Specific Idea

Use:

```markdown
## Best Concept
[Filled concept template]

## Why This Wedge
[Why this is the strongest scope]

## Alternatives Considered
[Other good options and why they lost]

## Validation Plan
[Fastest tests]
```

### If The User Wants A Pitch

Use:

```markdown
## Scope
[Who and what this pitch is for]

## One-Liner
[Clear scoped statement]

## 10-Second Pitch
[One spoken version]

## 30-Second Pitch
[One spoken version]

## What To Leave Out
[Details that belong in FAQ/proof, not the opening]
```

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

