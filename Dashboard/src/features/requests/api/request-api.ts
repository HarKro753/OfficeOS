export type CustomerRequestStatus = "submitted" | "in_progress" | "resolved";

export type CustomerCriterion = {
  description: string;
  id: string;
  required_video: boolean;
  title: string;
};

export type CustomerDeliverable = {
  acceptance_criterion_id: string | null;
  download_url?: string | null;
  filename: string;
  id: string;
  kind: "answer_markdown" | "evidence_video";
  mime_type: string;
  size_bytes: number;
};

export type CustomerRequest = {
  answer_sent_at: string | null;
  created_at: string;
  created_by_user_id: string;
  criteria: CustomerCriterion[];
  deliverables: CustomerDeliverable[];
  generated_markdown: string;
  id: string;
  raw_spec_text: string;
  status: CustomerRequestStatus;
  title: string;
  updated_at: string;
  workspace_id: string;
};

export type CustomerWorkspace = {
  apple_access_notes: string | null;
  app_name: string;
  bundle_id: string | null;
  id: string;
  name: string;
};

export type CreateCustomerRequestPayload = {
  raw_spec_text: string;
  title: string;
  workspace_id: string;
};

const yukaHistorySpec = `---
version: alpha
type: mobile-app-spec
targetVersion: "1.1"
app:
  name: YUKA
  category: Health & Fitness
  platforms:
    - iOS
request:
  title: Add product history tab
  changeType: feature
---

# YUKA App Spec

## Overview

YUKA is an iOS health app for packaged food discovery. Version 1.1 adds one new user-facing page: History.

## Requested Change

Add a History tab next to Scanner and Explore. History should let users reopen products they already viewed without scanning, searching, or finding the same product again in Explore.

## Navigation Rules

- Scanner remains a top-level section.
- Explore remains a top-level section.
- History becomes a new top-level section.
- Product Details remains a shared detail destination.
- Opening Product Details from Scanner, Search, Explore, Alternatives, or History writes or updates one History entry for that product.
- Back from Product Details returns to the section that opened it.

## Screen: Product History

![Product History](assets/screens/v1.1/history.png)

History lists recently viewed products in chronological order, most recent first. Each row includes product image, product name, brand, score indicator, numeric score, score label, last viewed time, and a chevron. The bottom app navigation shows History as the active section.

## Acceptance Criteria

- Given the user opens Product Details from a successful barcode scan, when they open History, then that product appears at the top.
- Given the user opens Product Details from a search result, when they open History, then that product appears at the top.
- Given the user opens Product Details from an Explore product card, when they open History, then that product appears at the top.
- Given the user opens Product Details from an alternative product card, when they open History, then that product appears at the top.
- Given the user views the same product multiple times, History shows one row for that product and moves it to the top.
- Given History contains products, selecting any History item opens Product Details.
- Given Product Details was opened from History, tapping back returns to History.
- Given History has no viewed products, the History screen shows a simple empty state.
- Existing Scanner, Explore, Product Details, and Alternatives behavior continues to work.

## Non-Goals

- Favorites or saved products.
- User accounts.
- Cloud-synced history.
- Manual product notes.
- Purchase history or grocery list behavior.

## Assets

- assets/screens/v1.1/history.png
- assets/data/openfoodfacts-yuka-sample.csv
`;

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) return (await response.json()) as T;

  let message = `API request failed with ${response.status}`;
  try {
    const payload = (await response.json()) as { detail?: string };
    if (payload.detail) message = payload.detail;
  } catch {
    // Ignore non-JSON error bodies.
  }
  throw new Error(message);
}

async function apiFetch<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });
  return parseResponse<T>(response);
}

export function listCustomerWorkspaces(token: string) {
  return apiFetch<CustomerWorkspace[]>("/workspaces", token);
}

export function listCustomerRequests(token: string) {
  return apiFetch<CustomerRequest[]>("/requests", token);
}

export function getCustomerRequest(token: string, requestId: string) {
  return apiFetch<CustomerRequest>(`/requests/${requestId}`, token);
}

export function createCustomerRequest(
  token: string,
  payload: CreateCustomerRequestPayload,
) {
  return apiFetch<CustomerRequest>("/requests", token, {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export async function createYukaHistoryRequest(token: string) {
  const workspaces = await listCustomerWorkspaces(token);
  const workspace = workspaces[0];

  if (!workspace) {
    throw new Error("No workspace is available for this account.");
  }

  return createCustomerRequest(token, {
    raw_spec_text: yukaHistorySpec,
    title: "Add product history tab",
    workspace_id: workspace.id,
  });
}

export function requestHasAnswer(request: CustomerRequest) {
  return request.deliverables.some(
    (deliverable) => deliverable.kind === "answer_markdown",
  );
}

export function criterionHasVideo(
  request: CustomerRequest,
  criterionId: string,
) {
  return request.deliverables.some(
    (deliverable) =>
      deliverable.kind === "evidence_video" &&
      deliverable.acceptance_criterion_id === criterionId,
  );
}
