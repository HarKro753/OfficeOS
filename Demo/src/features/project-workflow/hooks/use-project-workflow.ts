"use client";

import { useCallback, useMemo, useState } from "react";
import {
  baselineScreenshots,
  generatedRequest,
  updateReport,
  updateScreenshots,
} from "../data/mock-workflow";
import { readState, writeState } from "../storage/project-workflow-storage";
import type {
  ProjectWorkflowState,
  UpdateRequest,
} from "../types";
import { hasVersion, uniqueById } from "../utils/collections";

export function useProjectWorkflow() {
  const [state, setState] = useState<ProjectWorkflowState>(() =>
    readState(),
  );

  const sync = useCallback((nextState: ProjectWorkflowState) => {
    writeState(nextState);
    setState(nextState);
    return nextState;
  }, []);

  const ensureGeneratedRequest = useCallback(() => {
    const current = readState();
    if (current.activeRequest?.sourceReady) {
      setState(current);
      return current.activeRequest;
    }

    const request = generatedRequest();
    const report = updateReport(request.id, request.reportId);
    const nextState: ProjectWorkflowState = {
      ...current,
      activeRequest: request,
      reports: uniqueById([report, ...current.reports]),
      versions: hasVersion(current, request.versionTarget)
        ? current.versions
        : [
            {
              createdAt: request.createdAt,
              id: "version-yuka-1-1-pending",
              reportId: report.id,
              screenshots: updateScreenshots,
              status: "pending",
              summary: request.summary,
              title: request.title,
              version: request.versionTarget,
            },
            ...current.versions,
          ],
    };

    return sync(nextState).activeRequest ?? request;
  }, [sync]);

  const approveGeneratedRequest = useCallback(() => {
    const current = readState();
    const request = current.activeRequest ?? generatedRequest();
    const approvedAt = new Date().toISOString();
    const approvedRequest: UpdateRequest = {
      ...request,
      approvedAt,
      stage: "in-implementation",
      status: "implementing",
    };
    const nextState: ProjectWorkflowState = {
      ...current,
      activeRequest: approvedRequest,
      reports: current.reports.map((report) =>
        report.id === request.reportId
          ? { ...report, status: "in-implementation" }
          : report,
      ),
      versions: current.versions.map((version) =>
        version.version === request.versionTarget
          ? { ...version, status: "pending" }
          : version,
      ),
    };

    return sync(nextState);
  }, [sync]);

  const completeApprovedUpdate = useCallback(() => {
    const current = readState();
    const request = current.activeRequest;

    if (!request || request.status === "generated") {
      setState(current);
      return current;
    }

    const nextState: ProjectWorkflowState = {
      ...current,
      activeRequest: null,
      app: {
        ...current.app,
        currentVersion: request.versionTarget,
      },
      reports: current.reports.map((report) =>
        report.id === request.reportId
          ? {
              ...report,
              approvedAt: report.approvedAt ?? request.approvedAt,
              status: "live",
            }
          : report,
      ),
      versions: current.versions.map((version) =>
        version.version === request.versionTarget
          ? { ...version, status: "live" }
          : version,
      ),
    };

    return sync(nextState);
  }, [sync]);

  const latestVersion = state.versions[0] ?? null;
  const activeReport = state.activeRequest
    ? state.reports.find((report) => report.id === state.activeRequest?.reportId) ??
      null
    : null;
  const reportById = useCallback(
    (reportId: string) =>
      state.reports.find((report) => report.id === reportId) ?? null,
    [state.reports],
  );
  const previewVersion = state.activeRequest?.versionTarget ?? state.app.currentVersion;
  const previewScreenshots =
    state.activeRequest?.sourceReady && activeReport
      ? activeReport.screenshots
      : (latestVersion?.screenshots ?? baselineScreenshots);

  return useMemo(
    () => ({
      activeReport,
      approveGeneratedRequest,
      completeApprovedUpdate,
      ensureGeneratedRequest,
      previewScreenshots,
      previewVersion,
      reportById,
      state,
    }),
    [
      activeReport,
      approveGeneratedRequest,
      completeApprovedUpdate,
      ensureGeneratedRequest,
      previewScreenshots,
      previewVersion,
      reportById,
      state,
    ],
  );
}
