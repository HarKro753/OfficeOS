import type { UpdateReport } from "../types";

export type UpdateReportNarrative = {
  acceptanceParagraphs: string[];
  deliveryParagraphs: string[];
  deliveryTitle: string;
  screenEvidence: string[];
  testingParagraphs: string[];
};

export type UpdateReportAcceptanceEvidence = {
  criteria: string;
  description: string;
  videoLabel: string;
};

const historyUpdateNarrative: UpdateReportNarrative = {
  acceptanceParagraphs: [
    "The change was reviewed against the full source request, not only the submitted screenshot. The accepted behavior covers every entry point named in the brief: successful barcode scans, search results, Explore product cards, and alternative product cards all need to write the opened product into History.",
    "The review also covers the product-list rules that make History useful in a real shopping session. Recently opened products are ordered with the latest item first, repeat views do not create duplicate rows, and selecting any History row returns the user to the same shared Product Details destination used elsewhere in the app.",
    "Navigation was considered as part of acceptance. Product Details remains a shared destination rather than a fourth workflow, and back navigation must return to History when History was the source. Existing Scanner, Explore, Product Details, and Alternatives behavior is expected to remain intact.",
  ],
  deliveryParagraphs: [
    "Version 1.1 implements Product History as the only new top-level page in YUKA. The update gives shoppers a dedicated place to return to products they already opened, which removes the need to rescan, retype a search, or rediscover the same product from Explore while comparing items in-store.",
    "The bottom navigation has been expanded from the v1.0 Scanner and Explore structure to Scanner, Explore, and History. Product Details stays as the shared destination behind those entry points, so the update adds recall and continuity without changing the mental model of how product information is opened.",
    "The History screen is designed around recognition. Each row carries the product image, product name, brand, score, score label, last viewed time, and a chevron affordance. That set of fields matches the source brief and gives users enough context to confidently reopen the right product.",
  ],
  deliveryTitle: "Product History was added as an accountable v1.1 update.",
  screenEvidence: [
    "The submitted build evidence shows History as the active tab and presents recently viewed products as native-feeling rows. This is the only new screen introduced in v1.1, which keeps the scope intentionally narrow.",
    "The screenshot also confirms the intended hierarchy: History is a top-level app section, while each row remains a path back into Product Details.",
  ],
  testingParagraphs: [
    "The review pass was framed around the user journeys in ChangeRequest.md. The critical check is that opening Product Details from scan, search, Explore, and Alternatives writes the product to History and moves it to the top of the list.",
    "The same pass records the persistence and navigation rules that are easy to miss in a superficial visual review: repeat views produce one row, an empty History screen has a clear empty state, every populated row opens Product Details, and back navigation returns to History when that was the origin.",
  ],
};

function fallbackNarrative(report: UpdateReport): UpdateReportNarrative {
  return {
    acceptanceParagraphs: [
      report.changedScreens.join(" "),
      report.preservedBehavior.join(" "),
    ],
    deliveryParagraphs: [report.summary],
    deliveryTitle: report.title,
    screenEvidence: [
      "The screenshots attached to this report are the visual evidence for the delivered version.",
    ],
    testingParagraphs: [
      "The baseline report records the screens and behavior expected to remain available.",
    ],
  };
}

export function getUpdateReportNarrative(report: UpdateReport) {
  return report.versionTarget === "1.1"
    ? historyUpdateNarrative
    : fallbackNarrative(report);
}

export function getUpdateReportAcceptanceEvidence(
  report: UpdateReport,
): UpdateReportAcceptanceEvidence[] {
  if (report.versionTarget !== "1.1") {
    return report.acceptance.map((criteria, index) => ({
      criteria,
      description:
        "This baseline criterion is represented with a mock verification video placeholder for now. Once real clips are attached, this slot should show the recorded path that proves the behavior remains available in the release.",
      videoLabel: `Baseline check ${index + 1}`,
    }));
  }

  const descriptions = [
    "The verification clip should open Product Details from each named entry point, return to History, and show the viewed product present in the list. This proves History is written from scan, search, Explore, and Alternatives rather than only from one happy path.",
    "The verification clip should open the same product more than once and then return to History. The expected evidence is one row for that product, moved back to the top, with no duplicate row left behind.",
    "The verification clip should select a populated History row and land on the matching Product Details screen. The product identity in the row and detail view should match closely enough to make the navigation trace accountable.",
    "The verification clip should open Product Details from History and then use back navigation. The expected result is a return to History, not Scanner, Explore, or an unrelated previous surface.",
    "The verification clip should start with no recently viewed products and show the empty History state. This proves first-run behavior is handled instead of leaving users on a blank or broken page.",
    "The verification clip should run through the existing Scanner, Explore, Product Details, and Alternatives flows after the History update is present. The goal is to show that adding History did not regress the established product discovery paths.",
  ];

  return report.acceptance.map((criteria, index) => ({
    criteria,
    description:
      descriptions[index] ??
      "The verification clip should record the user journey that proves this criterion in the released build.",
    videoLabel: `History verification ${index + 1}`,
  }));
}
