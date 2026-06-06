import type {
  PreviewScreenshot,
  ProjectWorkflowState,
  UpdateReport,
  UpdateRequest,
} from "../types";

export const storageKey = "officeos-demo-project-workflow-v2";

export const generatedAt = "2026-06-06T09:20:00.000Z";
const baselineAt = "2026-06-01T09:00:00.000Z";

export const baselineScreenshots: PreviewScreenshot[] = [
  {
    alt: "YUKA scanner screen",
    label: "Scanner",
    src: "/assets/screens/v1.0/scanner.png",
  },
  {
    alt: "YUKA explore screen",
    label: "Explore",
    src: "/assets/screens/v1.0/explore.png",
  },
  {
    alt: "YUKA product detail screen",
    label: "Product Details",
    src: "/assets/screens/v1.0/product-detail.png",
  },
];

export const updateScreenshots: PreviewScreenshot[] = [
  {
    alt: "YUKA product history screen after update",
    description:
      "History is the only new v1.1 page. It shows recently viewed products with image, brand, score, viewed time, and a selected History tab.",
    label: "Product History",
    src: "/assets/screens/v1.1/history.png",
  },
];

export function baselineReport(): UpdateReport {
  return {
    appName: "YUKA",
    acceptance: [
      "Scanner opens Product Details for matched products.",
      "Explore opens Product Details from product cards.",
      "Product Details can show expanded nutrition evidence and alternatives.",
      "History is not present in v1.0.",
    ],
    changedScreens: [
      "Scanner is available as the baseline product lookup page.",
      "Explore is available as the baseline browsing page.",
      "Product Details is available as the shared product review page.",
    ],
    createdAt: baselineAt,
    documentType: "mobile-app-update-report",
    documentVersion: "alpha",
    id: "report-yuka-v1-baseline",
    implementationNotes:
      "v1.0 is the live baseline before the History update. It includes Scanner, Explore, Product Details, expanded nutrients, and alternatives.",
    knownLimitations:
      "History is not available in v1.0. Recently viewed products cannot be reopened from a dedicated page.",
    preservedBehavior: [
      "Scanner opens Product Details for matched products.",
      "Explore opens Product Details from product cards.",
      "Product Details can show expanded nutrition evidence and alternatives.",
    ],
    qaChecklist: [
      "Scanner baseline screenshot is present.",
      "Explore baseline screenshot is present.",
      "Product Details baseline screenshot is present.",
      "No History page is present in v1.0.",
    ],
    releaseLinks: {
      appStoreUrl: "https://appstoreconnect.apple.com/apps/officeos-yuka",
      posthogUrl: "https://app.posthog.com/project/officeos-yuka",
    },
    requestId: "request-yuka-v1-baseline",
    screenshots: baselineScreenshots,
    sections: [
      {
        body: "Records the v1.0 baseline before Product History exists.",
        title: "Version note",
      },
    ],
    status: "live",
    summary:
      "Version 1.0 is the live YUKA baseline. It includes Scanner, Explore, and Product Details, but no History page.",
    title: "Initial YUKA baseline",
    versionTarget: "1.0",
  };
}

export function baselineState(): ProjectWorkflowState {
  return {
    activeRequest: null,
    app: {
      appStoreUrl: "https://appstoreconnect.apple.com/apps/officeos-yuka",
      bundleId: "com.officeos.yuka",
      category: "Health & Fitness",
      currentVersion: "1.0",
      name: "YUKA",
      platform: "iOS",
      posthogUrl: "https://app.posthog.com/project/officeos-yuka",
    },
    reports: [baselineReport()],
    versions: [
      {
        createdAt: baselineAt,
        id: "version-yuka-1",
        reportId: "report-yuka-v1-baseline",
        screenshots: baselineScreenshots,
        status: "live",
        summary:
          "Baseline app with onboarding, product search, and product detail review.",
        title: "Initial YUKA release",
        version: "1.0",
      },
    ],
  };
}

export function updateReport(
  requestId: string,
  reportId: string,
): UpdateReport {
  return {
    appName: "YUKA",
    acceptance: [
      "Products opened from scan, search, Explore, or Alternatives appear in History.",
      "Reopened products move to the top instead of duplicating.",
      "Selecting a History row opens Product Details.",
      "Back from Product Details returns to History when History was the source.",
      "History shows a simple empty state before any products have been viewed.",
      "Existing Scanner, Explore, Product Details, and Alternatives behavior continues to work.",
    ],
    changedScreens: [
      "Product History was added as the only new v1.1 page.",
      "The bottom app navigation now includes Scanner, Explore, and History.",
      "History is selected in the submitted screenshot and shows the latest viewed products first.",
    ],
    createdAt: generatedAt,
    documentType: "mobile-app-update-report",
    documentVersion: "alpha",
    id: reportId,
    implementationNotes:
      "The update should use the submitted History screenshot as the visual reference. The implementation work should focus on the History page and local recently viewed product behavior only.",
    knownLimitations:
      "This is a mocked update report. No real App Store release, PostHog event stream, or backend history sync is connected.",
    preservedBehavior: [
      "Scanner remains available.",
      "Explore remains available.",
      "Product Details remains the shared destination for products opened from every entry point.",
    ],
    qaChecklist: [
      "History screen matches the submitted screenshot.",
      "Products opened from scan, search, Explore, or Alternatives appear in History.",
      "Reopened products move to the top without duplication.",
      "Selecting a History row opens Product Details.",
      "Existing Scanner, Explore, and detail navigation remain usable.",
    ],
    releaseLinks: {
      appStoreUrl: "https://appstoreconnect.apple.com/apps/officeos-yuka",
      posthogUrl: "https://app.posthog.com/project/officeos-yuka",
    },
    requestId,
    screenshots: updateScreenshots,
    sections: [
      {
        body:
          "Adds Product History as a top-level page for recently viewed products.",
        title: "Changed behavior",
      },
      {
        body: "Scanner, Explore, and Product Details remain available.",
        title: "Preserved behavior",
      },
      {
        body:
          "OfficeOS should validate History rows, deduplication, ordering, and row-to-detail navigation.",
        title: "QA focus",
      },
    ],
    status: "draft",
    summary:
      "Version 1.1 adds one new page to YUKA: Product History. The page gives users a top-level place to revisit products they recently opened from Scanner, Search, Explore, or Alternatives.",
    title: "Add product history tab",
    versionTarget: "1.1",
  };
}

export function generatedRequest(): UpdateRequest {
  const requestId = "request-yuka-history-update";

  return {
    createdAt: generatedAt,
    generatedAt,
    id: requestId,
    reportId: "report-yuka-history-update",
    sourceReady: true,
    stage: "request-sent",
    status: "sent",
    summary:
      "Add Product History as a top-level tab while preserving Scanner, Explore, and Product Details.",
    title: "Add product history tab",
    versionTarget: "1.1",
  };
}
