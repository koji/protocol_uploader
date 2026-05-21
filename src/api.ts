import * as fs from "fs";
import * as path from "path";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function baseUrl(ip: string): string {
  return `http://${ip}:31950`;
}

async function request<T>(
  url: string,
  options: RequestInit
): Promise<T> {
  const headers = new Headers(options.headers as HeadersInit | undefined);
  headers.set("opentrons-version", "3");
  const res = await fetch(url, { ...options, headers });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      `HTTP ${res.status} ${res.statusText}`,
      res.status,
      body
    );
  }
  return body as T;
}

export interface UploadResponse {
  data: {
    id: string;
    analysisSummaries: Array<{ id: string; status: string }>;
  };
}

export async function uploadProtocol(
  ip: string,
  filePath: string
): Promise<UploadResponse> {
  const buffer = fs.readFileSync(filePath);
  const filename = path.basename(filePath);
  const form = new FormData();
  form.append("files", new Blob([buffer]), filename);

  return request<UploadResponse>(`${baseUrl(ip)}/protocols`, {
    method: "POST",
    body: form,
  });
}

export interface AnalysisResponse {
  data: { status: string };
}

export async function getAnalysis(
  ip: string,
  protocolId: string,
  analysisId: string
): Promise<string> {
  const res = await request<AnalysisResponse>(
    `${baseUrl(ip)}/protocols/${protocolId}/analyses/${analysisId}`,
    { method: "GET" }
  );
  return res.data.status;
}

export interface CreateRunResponse {
  data: { id: string };
}

export async function createRun(
  ip: string,
  protocolId: string
): Promise<string> {
  const res = await request<CreateRunResponse>(`${baseUrl(ip)}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { protocolId } }),
  });
  return res.data.id;
}

export async function startRun(ip: string, runId: string): Promise<void> {
  await request(`${baseUrl(ip)}/runs/${runId}/actions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: { actionType: "play" } }),
  });
}

export interface RunResponse {
  data: { status: string };
}

export async function getRun(ip: string, runId: string): Promise<string> {
  const res = await request<RunResponse>(`${baseUrl(ip)}/runs/${runId}`, {
    method: "GET",
  });
  return res.data.status;
}
