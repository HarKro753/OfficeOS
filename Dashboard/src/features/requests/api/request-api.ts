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
