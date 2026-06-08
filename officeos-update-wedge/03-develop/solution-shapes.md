# Solution Shapes: officeos-update-wedge

*Skill: double-diamond-ideation | Generated: 2026-06-08*

## Source Inputs

- `02-define/candidate-wedges.md`
- `02-define/scoring.md`
- `data/lens-bank.json`

## Selected Wedge

Human-verified updates for non-technical app owners.

## Shape 1: Productized Update Service

**Customer input:** A plain-language update request, existing source-of-truth files, assets, and access to the app baseline.
**Output / result:** Tested mobile update, release notes, QA status, and app-store-ready package.
**What it removes from the customer's life:** Developer hiring, spec translation, QA coordination, release preparation, and acceptance ambiguity.
**Trust mechanism:** Readiness gate before implementation, human operator review, visible acceptance criteria, update report.
**Smallest credible version:** Manually deliver 3-5 narrow updates using AI-assisted coding plus human QA.
**Main risk:** Service margin if updates are too broad or app quality is poor.

## Shape 2: Update Readiness Gate

**Customer input:** Change request and current app/source package.
**Output / result:** Accepted scope, missing information list, and build/no-build decision.
**What it removes from the customer's life:** Hidden ambiguity before a developer starts coding.
**Trust mechanism:** Standardized checklist and source-of-truth diff.
**Smallest credible version:** Free or low-cost audit before paid update delivery.
**Main risk:** Useful but not sufficient as the whole company story.

## Shape 3: Agency Maintenance Engine

**Customer input:** Client change requests and app baselines.
**Output / result:** White-labeled update packages and release reports.
**What it removes from the customer's life:** Low-margin maintenance coordination.
**Trust mechanism:** Approval gates and audit trail.
**Smallest credible version:** One agency pilot with one recurring client app.
**Main risk:** Requires agency workflow integration and trust.

## Recommendation

Lead with the productized update service. Use the readiness gate as the product proof and demo mechanism. Keep agency maintenance as a later distribution path.
