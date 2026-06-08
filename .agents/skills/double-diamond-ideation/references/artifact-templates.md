# Artifact Templates

Use these templates whenever writing phase files for `double-diamond-ideation`.

Every artifact starts with:

```markdown
# {Title}: {project-name}

*Skill: double-diamond-ideation | Generated: {date}*
```

## PROGRESS.md

```markdown
# Progress: {project-name}

*Skill: double-diamond-ideation | Started: {date}*

## Context

**Starting idea:**
**Language:**
**Mode:** File-based / Simulated files
**Current phase:**
**Current gate:** Intake / Discover / Define / Develop / Deliver / Complete
**Next action:**

## Phase Checklist

- [ ] 00 Intake artifact
- [ ] 00 Intake checkpoint
- [ ] 01 Discover artifact
- [ ] 01 Discover checkpoint
- [ ] 02 Define artifacts
- [ ] 02 Define checkpoint
- [ ] 03 Develop artifact
- [ ] 03 Develop checkpoint
- [ ] 04 Deliver artifacts
- [ ] 04 Deliver checkpoint

## Decisions

- [Decision log entries]

## Last Checkpoint Summary

- [Most recent phase checkpoint in 1-3 bullets]

## Open Questions

- [Questions that need user input or validation]
```

## 00-intake/brief.md

```markdown
# Intake Brief: {project-name}

*Skill: double-diamond-ideation | Generated: {date}*

## Starting Idea

## Trigger / Founder Context

## Known Audiences

## Known Constraints

## What Feels Unclear

## Initial Assumptions

## Open Questions
```

## phase/checkpoint.md

Use this template for:

1. `00-intake/checkpoint.md`
2. `01-discover/checkpoint.md`
3. `02-define/checkpoint.md`
4. `03-develop/checkpoint.md`
5. `04-deliver/checkpoint.md`

```markdown
# Checkpoint: {project-name} - {phase}

*Skill: double-diamond-ideation | Generated: {date}*

## Source Artifact(s)

- [Files inspected before this checkpoint]

## What Changed

- [What this phase clarified]

## Strongest Signals

- [Strongest audiences, pains, wedges, solution shapes, or claims]

## Rejected Or Deprioritized

- [Options that should not lead the next phase]

## Decision

**Recommended next move:**
**Why:**
**Confidence:** High / Medium / Low

## Open Questions

- [Questions that should be resolved before or during the next phase]

## Next Phase Input

- [What the next phase should use as its starting point]
```

## 01-discover/wide-map.md

```markdown
# Wide Map: {project-name}

*Skill: double-diamond-ideation | Generated: {date}*

## Source Inputs

- `00-intake/brief.md`
- `data/lens-bank.json`

## Audience Lenses

## Painful Moments

## Current Alternatives

## Broken Tradeoffs

## Budget / Frequency / Urgency Signals

## Trust And Complexity Signals

## Market Timing Signals

## Raw Opportunities

## Notes For Clustering
```

## 02-define/clusters.md

```markdown
# Opportunity Clusters: {project-name}

*Skill: double-diamond-ideation | Generated: {date}*

## Source Inputs

- `01-discover/wide-map.md`

## Cluster 1: [Name]

**Customer:**
**Painful moment:**
**Current alternative:**
**Broken tradeoff:**
**Why this might be a wedge:**
**Weakness / risk:**

## Cluster 2: [Name]

## Cluster 3: [Name]

## Clustering Notes
```

## 02-define/candidate-wedges.md

```markdown
# Candidate Wedges: {project-name}

*Skill: double-diamond-ideation | Generated: {date}*

## Source Inputs

- `02-define/clusters.md`

## Candidate 1: [Name]

**Customer:**
**Painful moment:**
**Current alternative:**
**Broken tradeoff:**
**Desired outcome:**
**Why this is urgent:**
**Why this is reachable:**
**What is excluded for now:**
**Main risk:**

## Candidate 2: [Name]

## Candidate 3: [Name]
```

## 02-define/scoring.md

```markdown
# Wedge Scoring: {project-name}

*Skill: double-diamond-ideation | Generated: {date}*

## Source Inputs

- `02-define/candidate-wedges.md`
- `references/scoring-rubric.md`

## Score Table

| Candidate | Pain | Frequency | Reachability | Budget | Alternative Weakness | Value Clarity | Scope Control | Founder Advantage | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |

## Interpretation

## Tie-Breakers

## Recommendation

## Risks And Unknowns
```

## 03-develop/solution-shapes.md

```markdown
# Solution Shapes: {project-name}

*Skill: double-diamond-ideation | Generated: {date}*

## Source Inputs

- `02-define/candidate-wedges.md`
- `02-define/scoring.md`
- `data/lens-bank.json`

## Selected Wedge(s)

## Shape 1: [Name]

**Customer input:**
**Output / result:**
**What it removes from the customer's life:**
**Trust mechanism:**
**Smallest credible version:**
**Main risk:**

## Shape 2: [Name]

## Shape 3: [Name]

## Recommendation
```

## 04-deliver/concept.md

```markdown
# Final Concept: {project-name}

*Skill: double-diamond-ideation | Generated: {date}*

## Source Inputs

- `01-discover/wide-map.md`
- `02-define/scoring.md`
- `03-develop/solution-shapes.md`

## One-Liner

## Customer

## Painful Moment

## Current Alternative

## Broken Tradeoff

## Product Promise

## First Wedge

## Not For Now

## Trust Mechanism

## Why Now

## Main Risks
```

## 04-deliver/validation-plan.md

```markdown
# Validation Plan: {project-name}

*Skill: double-diamond-ideation | Generated: {date}*

## Source Inputs

- `04-deliver/concept.md`
- `data/lens-bank.json`

## Riskiest Assumptions

## Fastest Tests

## Test Scripts / Outreach Angles

## Success Signals

## Failure Signals

## Decision Rule
```

## 04-deliver/pitch.md

```markdown
# Pitch: {project-name}

*Skill: double-diamond-ideation | Generated: {date}*

## Source Inputs

- `04-deliver/concept.md`
- `04-deliver/validation-plan.md`

## Scope

## One-Liner

## 10-Second Pitch

## 30-Second Pitch

## What To Leave Out

## FAQ / Edge Cases
```
