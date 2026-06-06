# OfficeOS

<p align="center">
  <img src="Assets/github-banner.png" alt="OfficeOS GitHub banner" width="100%" />
</p>

**Bring the app direction. OfficeOS owns delivery.**

OfficeOS is an app delivery operating layer for teams that know what mobile app they want, but do not want to run the production lifecycle themselves.

The prototype shows one product loop: a customer submits app direction, OfficeOS turns it into a source-of-truth package, the update moves through implementation and QA, and the delivered version becomes the new live baseline.

## Highlights

- Turns scattered app direction into structured delivery artifacts: `SPEC.md`, `DESIGN.md`, `ChangeRequest.md`, and `UpdateReport.md`.
- Uses source-of-truth approval as the gate before implementation starts.
- Shows the post-launch lifecycle, not only the first build.
- Tracks each update through request validation, implementation, testing, and release.
- Keeps ownership clear: the customer owns product direction, OfficeOS owns delivery readiness, QA, release preparation, monitoring, and maintenance workflow.

## Product Problem

Apps are not finished artifacts. Version one is the first time the product meets real users.

After launch, users get stuck in unexpected places, ignore features that seemed important, and pull the product in directions the original team did not plan for. That work usually falls into a handoff gap between people who can describe the app and people who can operate the mobile delivery lifecycle.

OfficeOS closes that gap by making the source of truth explicit and keeping the app lifecycle moving after the first build.

<img src="Assets/1-Problem.png" alt="OfficeOS problem slide" width="100%" />

## What OfficeOS Does

OfficeOS accepts a product source package and turns it into an accountable delivery workflow.

The customer brings:

- Product direction
- Design direction
- App requirements
- Change requests
- Acceptance decisions

OfficeOS owns:

- Delivery readiness review
- Implementation workflow
- QA and acceptance checks
- Release preparation
- Monitoring handoff
- Maintenance and update workflow

<img src="Assets/2-Solution.png" alt="OfficeOS solution slide" width="100%" />

## How It Works

The workflow is built around source-of-truth documents.

1. The customer submits `SPEC.md`, `DESIGN.md`, and referenced assets.
2. OfficeOS checks whether the package is complete enough to build.
3. If the package is ready, implementation begins.
4. QA verifies the accepted requirements.
5. The release becomes the live baseline.
6. Future updates start with `ChangeRequest.md`.
7. OfficeOS converts the request into source-of-truth changes before implementing the update.

The rule is simple: when the source of truth changes, the app changes. When the source of truth is incomplete, implementation does not start.

<img src="Assets/3-HowItWorks.png" alt="OfficeOS source-of-truth workflow slide" width="100%" />

## Demo

The hackathon demo uses a mocked mobile app update for a YUKA-style product. The demonstrated request adds a Product History tab, then moves that update through the OfficeOS lifecycle.

The prototype includes:

- A dashboard for the app delivery state.
- A chat intake panel for update requests.
- A markdown workspace for reviewing generated source documents.
- A delivery timeline for request sent, implementation, test passed, and live.
- An update report with changed screens, acceptance criteria, release links, and known limitations.

[Watch the demo video](Assets/DemoVid.mp4)

<a href="Assets/DemoVid.mp4">
  <img src="Assets/3-HowItWorks.png" alt="Click to watch the OfficeOS demo video" width="100%" />
</a>

## Repository Structure

```text
OfficeOS/
  Assets/                  Hackathon slides, logo, and demo video
  Demo/                    Next.js prototype
  Demo/templates/          Source-of-truth and update-report markdown templates
  Demo/src/app/            Next.js app routes defined in page.tsx files
  Demo/src/features/       Feature-based product modules
```

The demo follows the repo's Bulletproof React direction by organizing product behavior into feature folders while keeping page definitions inside `page.tsx`.

## Running The Demo

The application lives in `Demo/`.

```bash
cd Demo
bun install
bun dev
```

Open the local Next.js URL and start at `/dashboard`.

## Hackathon Scope

This project was built for the AI BEAVERS x Mollie Founder Hackathon at House of AI Hamburg on June 6, 2026.

The current prototype focuses on the product workflow: app direction in, source-of-truth review, implementation state, QA state, release state, and update reporting.

## Source Materials

- [Miro slides board](https://miro.com/app/board/uXjVHJdkql8=/?share_link_id=49241611693)
- [Demo video](Assets/DemoVid.mp4)
- [Problem slide](Assets/1-Problem.png)
- [Solution slide](Assets/2-Solution.png)
- [How it works slide](Assets/3-HowItWorks.png)
- [Hackathon scoring guide](HackathonScoring.md)
- [Hackathon logistics](HackathonLogistics.md)
- [Brand identity](OfficeOsBrandIdentity.md)
- [Pitch notes](OfficeOsPitch.md)
