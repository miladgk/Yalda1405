const PLACEHOLDER_GAS_URL =
  'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec';

export const GAS_WEB_APP_URL =
  (import.meta.env.VITE_GAS_WEB_APP_URL as string | undefined)?.trim() ||
  PLACEHOLDER_GAS_URL;

export interface GasEventStatusResponse {
  capacity?: number;
  maxCapacity?: number;
  registered?: number;
  booked?: number;
  remaining?: number;
  isFull?: boolean;
}

export interface GasSubmitRegistrationResponse {
  success?: boolean;
  error?: string;
  trackingCode?: string;
  totalFee?: number;
  guests?: number;
  fullName?: string;
  emailSent?: boolean;
  capacity?: number;
  registered?: number;
}

/**
 * Returns true only when a real Google Apps Script deployment URL is configured.
 */
export function isGasUrlConfigured(): boolean {
  return (
    GAS_WEB_APP_URL.startsWith('https://script.google.com/macros/s/') &&
    !GAS_WEB_APP_URL.includes('YOUR_DEPLOYMENT_ID')
  );
}

/**
 * Fetches current event capacity and registration counts from the Apps Script Web App (`doGet`).
 */
export async function fetchEventStatusFromGas(): Promise<GasEventStatusResponse> {
  const response = await fetch(GAS_WEB_APP_URL, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as GasEventStatusResponse;
}

/**
 * Submits registration data to the Apps Script Web App (`doPost`) using text/plain to avoid CORS preflight.
 */
export async function submitRegistrationToGas(
  payload: unknown
): Promise<GasSubmitRegistrationResponse> {
  const response = await fetch(GAS_WEB_APP_URL, {
    method: 'POST',
    redirect: 'follow',
    headers: {
      // Apps Script Web Apps reject CORS preflight OPTIONS requests for application/json.
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as GasSubmitRegistrationResponse;
}
