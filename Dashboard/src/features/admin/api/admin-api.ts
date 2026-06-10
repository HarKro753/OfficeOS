export type AdminRequestStatus = "submitted" | "in_progress" | "resolved";

export type AdminCriterion = {
  description: string;
  id: string;
  required_video: boolean;
  title: string;
};

export type AdminDeliverable = {
  acceptance_criterion_id: string | null;
  download_url?: string | null;
  filename: string;
  id: string;
  kind: "answer_markdown" | "evidence_video";
  mime_type: string;
  size_bytes: number;
};

export type AdminRequest = {
  answer_sent_at: string | null;
  created_at: string;
  created_by_user_id: string;
  criteria: AdminCriterion[];
  deliverables: AdminDeliverable[];
  generated_markdown: string;
  id: string;
  raw_spec_text: string;
  status: AdminRequestStatus;
  title: string;
  updated_at: string;
  workspace_id: string;
};

export type AdminInvite = {
  email: string;
  expires_at: string;
  invite_link: string;
};

export type CreateInvitePayload = {
  app_name?: string | null;
  email: string;
  role: "customer" | "admin";
  workspace_name?: string | null;
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

export function listAdminRequests(token: string) {
  return apiFetch<AdminRequest[]>("/admin/requests", token);
}

export function createAdminInvite(token: string, payload: CreateInvitePayload) {
  return apiFetch<AdminInvite>("/admin/invites", token, {
    body: JSON.stringify(payload),
    method: "POST",
  });
}

export function startAdminRequest(token: string, requestId: string) {
  return apiFetch<AdminRequest>(`/admin/requests/${requestId}/start`, token, {
    method: "POST",
  });
}

export function resolveAdminRequest(token: string, requestId: string) {
  return apiFetch<AdminRequest>(`/admin/requests/${requestId}/resolve`, token, {
    method: "POST",
  });
}

export function uploadAnswerMarkdown(
  token: string,
  requestId: string,
  file: File,
) {
  const formData = new FormData();
  formData.set("file", file);

  return apiFetch<AdminRequest>(
    `/admin/requests/${requestId}/answer-markdown`,
    token,
    {
      body: formData,
      method: "POST",
    },
  );
}

export function uploadCriterionVideo(
  token: string,
  requestId: string,
  criterionId: string,
  file: File,
) {
  const formData = new FormData();
  formData.set("file", file);

  return apiFetch<AdminRequest>(
    `/admin/requests/${requestId}/criteria/${criterionId}/video`,
    token,
    {
      body: formData,
      method: "POST",
    },
  );
}

export function criterionHasVideo(request: AdminRequest, criterionId: string) {
  return request.deliverables.some(
    (deliverable) =>
      deliverable.kind === "evidence_video" &&
      deliverable.acceptance_criterion_id === criterionId,
  );
}

export function requestHasAnswer(request: AdminRequest) {
  return request.deliverables.some(
    (deliverable) => deliverable.kind === "answer_markdown",
  );
}
