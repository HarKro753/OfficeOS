---
name: your-audience
description: Analyzes a product, offer, pitch, landing page, or startup idea by identifying the real audience, creating practical behavioral personas, spawning independent subagents to simulate audience reactions, and turning those reactions into product, positioning, onboarding, pricing, and messaging recommendations. Use when the user asks who a product is for, wants audience analysis, persona analysis, ICP discovery, customer segments, buyer/user roles, simulated audience feedback, persona reactions, product-market fit assumptions, or audience-specific product changes. Triggers include "who is this for", "your audience", "audience analysis", "define personas", "ICP", "customer segments", "what would users think", "simulate audience feedback", "target customer", "buyer persona", "user persona", "adapt this product for the audience", or "change the product based on personas".
---

# Your Audience

Use independent audience analysis to discover who the product is really for, what those people would think when they encounter it, what they would misunderstand or reject, and what should change in the product or message as a result.

This skill is not a generic persona generator. Its job is to produce audience insight that changes decisions.

## Core Standard

Audience analysis is useful only when it answers:

- Who has the painful problem
- Who pays, who uses, who evaluates, who blocks, and who influences
- What the audience already believes before seeing the product
- What they compare the product against
- What they would misunderstand, ignore, fear, or reject
- What would make them care, switch, buy, use, or recommend it
- What should change in product, positioning, pricing, onboarding, sales, or messaging

Weak persona work is not acceptable. Avoid:

- Fictional demographic filler
- Generic names like "Busy Manager" or "Tech-Savvy User"
- Unsupported psychographics
- Invented willingness to pay or adoption rates
- Treating the user, buyer, evaluator, and blocker as the same person
- Recommending product changes based on one imagined opinion

## Language

Default output language is **English**. If the user writes in another language or explicitly requests one, use that language for all outputs instead.

Preserve useful domain language from the user, but do not preserve vague audience labels. If the user says "small businesses", "creators", "professionals", "parents", "students", or "teams", narrow the audience into concrete segments or label the uncertainty.

## How It Works

```
INTAKE -> AUDIENCE MAP -> PERSONA CREATION -> SUBAGENT SIMULATION -> SYNTHESIS -> PRODUCT CHANGES -> VALIDATION PLAN
```

The defining step is **Subagent Simulation**. The main agent must not invent one blended audience opinion. It must create separate audience viewpoints, run them independently through subagents when available, and synthesize only after those reports return.

## Phase 1: Intake

This skill can work from a product idea, landing page, pitch, feature concept, app screenshot description, deck, memo, or existing persona list.

### Check for Provided Material

First inspect what the user has already provided:

- Product or startup idea
- Current target audience hypothesis
- Existing pitch, website, deck, product spec, or landing page copy
- Buyer, user, or customer segment
- Current product features or planned features
- Problem being solved
- Business model or pricing assumptions
- Specific decision the audience analysis should support

If the user provides a document path, read it. If the user provides pasted text, work from the pasted text.

### Ask Only If Needed

If the product context is too thin to simulate meaningful audience reactions, ask at most four questions:

- What is the product in one sentence?
- Who do you currently think it is for?
- What painful problem or job does it address?
- What decision should this analysis help with: product, positioning, pricing, onboarding, or messaging?

Do not over-interview. Move quickly to audience hypotheses and clearly label assumptions.

## Phase 2: Audience Map

Separate the audience into decision roles before creating personas.

### Required Role Scan

Identify which of these roles exist:

- **Economic Buyer** - Controls budget or purchase approval
- **Daily User** - Uses the product in the workflow
- **Technical Evaluator** - Reviews integration, security, reliability, or implementation risk
- **Internal Champion** - Wants the product and sells it internally
- **Blocker or Skeptic** - Has a reason to delay, reject, or ignore it
- **Influencer or Partner** - Shapes the buyer's opinion without buying directly
- **False Audience** - Sounds plausible but is probably not a good first target

For each role, state whether it is:

- **Known** - Supported by the user's input
- **Inferred** - Reasonable assumption from the product context
- **Unknown** - Requires validation

## Phase 3: Persona Creation

Create behavioral personas, not demographic caricatures. Personas should be based on role, workflow, pain, decision context, and current alternatives.

### Persona Requirements

Each persona must include:

- Persona label
- Role in the decision
- Job-to-be-done
- Current workaround or alternative
- Trigger moment that makes the problem urgent
- Desired outcome
- Buying power or influence
- Likely objection
- Success criteria
- Adoption risk
- Product implication

Use names only if they help readability. The persona label should describe the behavior, such as "Ops Lead Avoiding Another Dashboard" or "Founder Manually Coordinating Client Work".

### Persona Table

Use this format:

| Persona | Role | Current Alternative | Trigger Moment | Desired Outcome | Objection | Product Implication |
| ------- | ---- | ------------------- | -------------- | --------------- | --------- | ------------------- |

## Phase 4: Subagent Simulation

This skill should utilize subagents as the primary execution model.

### Subagent Requirement

When subagent tools are available and the runtime permits them, spawn independent subagents before synthesis. Each subagent receives the same neutral product brief, the relevant persona or role, and a narrow task. Do not give one subagent another subagent's conclusions before it has completed its own report.

For a **Full Audience Audit**, spawn at least four independent subagents:

- **Buyer Subagent**
- **User Subagent**
- **Skeptic Subagent**
- **Alternative/Competitor Subagent**

Spawn additional subagents when relevant:

- **Technical Evaluator Subagent** for B2B, AI, infrastructure, regulated, or integration-heavy products
- **Messaging Subagent** for pitches, websites, landing pages, and sales copy
- **Onboarding Subagent** for apps, tools, workflows, and products with activation risk
- **Pricing Subagent** when packaging, budget, or willingness-to-pay assumptions matter

For a **Quick Audience Read**, use at least two independent subagents if the tools are available:

- One high-fit persona or buyer/user subagent
- One skeptic or blocker subagent

If subagent tools are unavailable, run isolated role-based passes in the main conversation. Treat each pass as an independent process: write the role's report first, do not cross-reference other role conclusions, and synthesize only afterward. Clearly state that real subagents were unavailable.

### Required Subagent Prompts

Use or adapt these prompts.

#### Buyer Subagent

```
You are evaluating this product as the economic buyer for the assigned audience segment.

Assess:
- Budget ownership
- Urgency
- ROI logic
- Procurement friction
- Switching cost
- Internal risk
- What would make you approve, delay, or reject

Return:
1. First reaction
2. What is valuable
3. What is unclear
4. Objections
5. Required proof
6. Product or packaging change
7. Confidence level
```

#### User Subagent

```
You are evaluating this product as the daily user in the assigned workflow.

Assess:
- Workflow fit
- Time saved or effort added
- Habit disruption
- Usability concerns
- Setup burden
- Emotional reaction
- What would make this become part of the routine

Return:
1. First reaction
2. Moment of interest
3. Moment of friction
4. Likely workaround
5. Adoption blocker
6. Product or onboarding change
7. Confidence level
```

#### Skeptic Subagent

```
You are the skeptical audience member looking for reasons to ignore, delay, mistrust, or reject this product.

Assess:
- Why this may not be urgent
- Why current alternatives may be good enough
- Claims that sound inflated
- Missing proof
- Trust, privacy, reliability, or implementation concerns
- Hidden reasons the audience may not say yes

Return:
1. Strongest rejection reason
2. Most suspicious claim
3. Missing evidence
4. Lowest-confidence assumption
5. Change that would reduce skepticism
6. What should not be changed
7. Confidence level
```

#### Alternative/Competitor Subagent

```
You are comparing this product against the audience's current alternatives.

Assess:
- Direct competitors
- Indirect alternatives
- Manual workarounds
- Spreadsheets, agencies, consultants, internal tools, or doing nothing
- Switching triggers
- Where the proposed product is meaningfully better or worse

Return:
1. Default alternative
2. Why the audience uses it now
3. Where the new product wins
4. Where the alternative still wins
5. Switching requirement
6. Product or positioning change
7. Confidence level
```

#### Technical Evaluator Subagent

```
You are evaluating technical, operational, compliance, security, integration, or implementation risk.

Assess:
- Setup complexity
- Integration requirements
- Data sensitivity
- Reliability expectations
- Compliance concerns
- Admin controls
- Support burden

Return:
1. Technical acceptance criteria
2. Deal-breaking risk
3. Missing feature or proof
4. Implementation concern
5. Product or documentation change
6. Confidence level
```

#### Messaging Subagent

```
You are evaluating how the assigned audience interprets the product message.

Assess:
- Words that resonate
- Words that confuse
- Claims that require proof
- Category clarity
- Value clarity
- Whether the audience can repeat what the product does

Return:
1. What the audience thinks it means
2. Best phrase
3. Worst phrase
4. Most likely misunderstanding
5. Messaging change
6. Confidence level
```

### Subagent Output Table

Synthesize subagent outputs in this format:

| Subagent | Perspective | Positive Reaction | Negative Reaction | Hidden Concern | Recommended Change |
| -------- | ----------- | ----------------- | ----------------- | -------------- | ------------------ |

## Phase 5: Synthesis

After subagent reports are complete, combine the independent reactions.

### Required Synthesis

Identify:

- Strongest audience segment
- Weakest or wrong audience segment
- Highest-conviction persona
- Persona most likely to pay
- Persona most likely to use
- Persona most likely to block adoption
- Most common misunderstanding
- Biggest adoption barrier
- Most important product adaptation
- Most important messaging adaptation
- Assumptions requiring real validation

### Pattern Rules

Prioritize patterns that appear across multiple independent subagents. If only one subagent raised a point, label it as a single-perspective signal unless it is severe.

Separate:

- **Convergent Signal** - Multiple subagents independently agree
- **Role-Specific Signal** - Important only for one role
- **Contradiction** - Subagents disagree, and the product strategy must choose
- **Unsupported Assumption** - Plausible but not validated

## Phase 6: Product And Messaging Recommendations

Recommend changes only when they are tied to a specific persona reaction, adoption barrier, or decision role.

### Change Categories

Use these categories:

- Product features
- Onboarding
- Pricing or packaging
- Positioning
- Landing page or pitch copy
- Sales motion
- Support or documentation
- Segment focus
- Research or validation

For every recommendation, include:

- Recommendation
- Persona affected
- Change type
- Reason
- Expected impact
- Tradeoff
- Confidence
- Validation needed

### Recommendation Table

Use this format:

| Recommendation | Persona Affected | Change Type | Reason | Confidence | Validation Needed |
| -------------- | ---------------- | ----------- | ------ | ---------- | ----------------- |

Do not recommend changing the whole product unless the current audience-product fit is fundamentally weak. If recommending a major pivot, explain which audience becomes stronger and which audience becomes weaker.

## Phase 7: Validation Plan

Simulated audience reactions are not customer evidence. Always end by separating what is inferred from what must be validated.

### Validation Outputs

Provide:

- Top 3 assumptions to test
- Best validation method for each assumption
- What evidence would confirm it
- What evidence would disprove it
- Which persona to interview or observe first
- What product or message decision depends on the result

### Validation Table

Use this format:

| Assumption | Persona | Test | Confirming Evidence | Disconfirming Evidence | Decision Impact |
| ---------- | ------- | ---- | ------------------- | ---------------------- | --------------- |

## Confidence Levels

Use these levels:

- **High** - Strongly supported by user-provided evidence or repeated subagent convergence
- **Medium** - Plausible and strategically useful, but needs validation
- **Low** - Speculative, thin context, or dependent on an unverified market assumption

Do not use "High" confidence for willingness to pay, market size, buyer urgency, or adoption likelihood unless the user provided evidence or live research was performed.

## Output Styles

### Quick Audience Read

Use for short ideas, early product thoughts, or when the user asks for a fast read:

1. One-sentence audience verdict
2. Likely primary audience
3. Two or three practical personas
4. Independent subagent reactions
5. Biggest objection
6. Recommended product or message adjustment
7. Confidence and validation risk

### Full Audience Audit

Use for product strategy, landing pages, pitch decks, customer discovery, ICP work, or explicit requests for depth:

1. Executive audience verdict
2. Audience map
3. Persona table
4. Independent subagent reports
5. Cross-persona patterns
6. Product adaptation recommendations
7. Messaging recommendations
8. Validation plan
9. Confidence and assumptions

## Guardrails

- Use subagents for independent persona reactions whenever the tools are available and permitted.
- Do not synthesize before independent subagent reports are complete.
- Do not invent market facts, demographics, willingness to pay, or adoption rates without evidence.
- Label assumptions clearly.
- Do not treat simulated subagent opinions as real customer research.
- Prefer behavioral personas over demographic personas.
- Distinguish buyer, user, evaluator, champion, and blocker.
- Do not recommend product changes unless tied to a specific audience reaction or adoption barrier.
- If the audience is unclear, provide competing audience hypotheses instead of pretending certainty.
- If recommending a product change, state the tradeoff and the audience it may weaken.
- If web research is used, cite sources and distinguish sourced facts from inferred audience reactions.
