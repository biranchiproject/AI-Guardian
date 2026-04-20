const API_BASE_URL = "http://localhost:5000";

export interface AnalysisResult {
  category: string;
  confidence: number;
  riskLevel: string;
  alertMessage: string;
}

export async function analyzeToxicity(text: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/analyze/toxicity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return response.json();
}

export async function analyzeScam(text: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/analyze/scam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return response.json();
}

export async function analyzeThreat(text: string): Promise<AnalysisResult> {
  const response = await fetch(`${API_BASE_URL}/analyze/threat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return response.json();
}

export async function getStats(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
  return response.json();
}

export async function getHistory(): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/analysis/history`);
  return response.json();
}

export async function chatbot(query: string, context?: any): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/chatbot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, context }),
  });
  return response.json();
}

export async function analyzeUrl(url: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/analyze/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return response.json();
}

