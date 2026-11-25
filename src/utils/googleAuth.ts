export interface GoogleUserInfo {
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
}

export interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleButtonConfiguration {
  type?: 'standard' | 'icon';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
  width?: number;
  locale?: string;
}

export interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void;
  renderButton: (parent: HTMLElement, options: GoogleButtonConfiguration) => void;
  disableAutoSelect: () => void;
}

declare global {
  interface Window {
    google?: {
      script?: {
        run?: {
          withSuccessHandler: (cb: (res: unknown) => void) => {
            withFailureHandler: (errCb: (err: unknown) => void) => {
              getEventStatus: () => void;
              submitRegistration: (payload: unknown) => void;
            };
          };
        };
      };
      accounts?: {
        id?: GoogleAccountsId;
      };
    };
  }
}

export const GOOGLE_CLIENT_ID =
  (import.meta.env?.VITE_GOOGLE_CLIENT_ID as string | undefined)?.trim() || '';

/**
 * Returns true when a real Google OAuth Client ID is configured via VITE_GOOGLE_CLIENT_ID.
 */
export function isGoogleAuthConfigured(clientId: string = GOOGLE_CLIENT_ID): boolean {
  const trimmed = clientId.trim();
  return trimmed.length > 0 && !trimmed.includes('YOUR_GOOGLE_CLIENT_ID');
}

/**
 * Safely decodes a Google Identity Services JWT credential on the client without external dependencies.
 */
export function decodeGoogleCredential(credential: string): GoogleUserInfo | null {
  if (!credential || typeof credential !== 'string') return null;

  const parts = credential.split('.');
  if (parts.length !== 3 || !parts[1]) return null;

  try {
    const base64Url = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64Url.padEnd(Math.ceil(base64Url.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder('utf-8').decode(bytes);
    const payload = JSON.parse(json) as {
      email?: unknown;
      email_verified?: unknown;
      name?: unknown;
      picture?: unknown;
    };

    const email = typeof payload.email === 'string' ? payload.email.trim() : '';
    if (!email) return null;

    const emailVerified =
      payload.email_verified === true || payload.email_verified === 'true';
    const name = typeof payload.name === 'string' ? payload.name.trim() : '';
    const picture = typeof payload.picture === 'string' ? payload.picture : undefined;

    return {
      email,
      emailVerified,
      name,
      picture,
    };
  } catch {
    return null;
  }
}
