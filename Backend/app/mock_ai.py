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
    markdown = f"""# ChangeRequest

## Title
{normalized_title}

## Submitted Spec
{raw_spec_text.strip()}

## Mock Readiness Result
OfficeOS accepted this pilot request as structurally complete enough for manual review.
The AI logic is intentionally mocked for now; an operator must review the spec and
send back the final Markdown answer plus verification videos.

## Acceptance Criteria
{chr(10).join(f"- {criterion.title}: {criterion.description}" for criterion in criteria)}
"""
    return MockRequestOutput(markdown=markdown, criteria=criteria)
