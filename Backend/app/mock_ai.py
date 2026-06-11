from dataclasses import dataclass


@dataclass(frozen=True)
class MockCriterion:
    title: str
    description: str


@dataclass(frozen=True)
class MockRequestOutput:
    markdown: str
    criteria: list[MockCriterion]


def generate_request_artifacts(*, title: str, raw_spec_text: str) -> MockRequestOutput:
    normalized_title = title.strip() or "Untitled update request"
    if (
        normalized_title.lower() == "add product history tab"
        or "Product History" in raw_spec_text
    ):
        criteria = [
            MockCriterion(
                title="Viewed products appear in History",
                description=(
                    "Products opened from scan, search, Explore, or Alternatives "
                    "must appear at the top of History."
                ),
            ),
            MockCriterion(
                title="History rows deduplicate repeated views",
                description=(
                    "Viewing the same product multiple times must keep one row and "
                    "move it to the top."
                ),
            ),
            MockCriterion(
                title="History preserves existing app navigation",
                description=(
                    "Selecting a History row opens Product Details, back returns to "
                    "History, and Scanner, Explore, Product Details, and Alternatives "
                    "continue to work."
                ),
            ),
        ]
        markdown = f"""---
version: alpha
type: mobile-app-change-request
app:
  name: YUKA
request:
  title: {normalized_title}
  changeType: feature
---

# App Update Brief

## Generated Source Of Truth

Add a History tab to the app.

## Current Behavior

The app already has working Scanner, Explore, Product Details, and
Alternatives flows. Those flows remain part of the accepted baseline and must
continue to work after the History update.

## Desired Behavior

History is a top-level app area that lists recently viewed products. Opening a
product from scan, search, Explore, or Alternatives adds it to History. Opening
the same product again updates the existing row instead of creating a duplicate.
Selecting a History row opens Product Details, and back navigation returns to
History.

## Operator Loop Status

OfficeOS accepted this hardcoded demo request as structurally complete enough for the operator loop.
The AI loop is intentionally mocked for now.

## Acceptance Criteria
{chr(10).join(f"- {criterion.title}: {criterion.description}" for criterion in criteria)}
"""
        return MockRequestOutput(markdown=markdown, criteria=criteria)

    criteria = [
        MockCriterion(
            title="Submitted behavior is represented",
            description=(
                "The final answer must show that the requested behavior was implemented "
                "or explicitly identify the remaining gap."
            ),
        ),
        MockCriterion(
            title="Existing app behavior is preserved",
            description=(
                "The final answer must include evidence that the update did not break "
                "the previously accepted baseline flows."
            ),
        ),
        MockCriterion(
            title="Customer can review the result",
            description=(
                "The final answer must include a Markdown summary and a video for each "
                "acceptance criterion."
            ),
        ),
    ]
    markdown = f"""# Generated Source Of Truth

## Title
{normalized_title}

## Requested Outcome
Represent the customer update as one reviewable implementation package.

## Mock Readiness Result
OfficeOS accepted this pilot request as structurally complete enough for manual review.
The AI logic is intentionally mocked for now; an operator must review the spec and
send back the final Markdown answer plus verification videos.

## Acceptance Criteria
{chr(10).join(f"- {criterion.title}: {criterion.description}" for criterion in criteria)}
"""
    return MockRequestOutput(markdown=markdown, criteria=criteria)
