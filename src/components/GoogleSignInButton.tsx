import { useEffect, useRef, useState } from 'react';
import {
  decodeGoogleCredential,
  GOOGLE_CLIENT_ID,
  isGoogleAuthConfigured,
  type GoogleCredentialResponse,
  type GoogleUserInfo,
} from '../utils/googleAuth';

interface GoogleSignInButtonProps {
  clientId?: string;
  onSuccess: (user: GoogleUserInfo) => void;
  onError?: (message: string) => void;
}

export function GoogleSignInButton({
  clientId = GOOGLE_CLIENT_ID,
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const [scriptUnavailable, setScriptUnavailable] = useState(false);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const configured = isGoogleAuthConfigured(clientId);

  useEffect(() => {
    if (!configured) return;

    let cancelled = false;
    let pollTimer: number | undefined;
    let attempts = 0;

    const handleCredentialResponse = (response: GoogleCredentialResponse) => {
      if (!response?.credential) {
        onErrorRef.current?.('توکن تایید گوگل دریافت نشد. لطفاً دوباره تلاش کنید.');
        return;
      }

      const decoded = decodeGoogleCredential(response.credential);
      if (!decoded) {
        onErrorRef.current?.('خواندن اطلاعات حساب گوگل با خطا مواجه شد. لطفاً دوباره تلاش کنید.');
        return;
      }

      if (!decoded.emailVerified) {
        onErrorRef.current?.(
          'نشانی ایمیل حساب گوگل شما تایید نشده است. لطفاً با یک حساب تاییدشده وارد شوید.'
        );
        return;
      }

      onSuccessRef.current(decoded);
    };

    const tryRenderButton = (): boolean => {
      if (cancelled || !containerRef.current) return false;
      const gsi = window.google?.accounts?.id;
      if (!gsi) return false;

      setScriptUnavailable(false);
      gsi.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      containerRef.current.innerHTML = '';
      const availableWidth = containerRef.current.parentElement?.clientWidth ?? 260;
      const buttonWidth = Math.max(200, Math.min(260, availableWidth - 16));

      gsi.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: buttonWidth,
        locale: 'fa',
      });

      return true;
    };

    if (!tryRenderButton()) {
      pollTimer = window.setInterval(() => {
        attempts += 1;
        if (tryRenderButton()) {
          window.clearInterval(pollTimer);
        } else if (attempts >= 60) {
          window.clearInterval(pollTimer);
          if (!cancelled) {
            setScriptUnavailable(true);
          }
        }
      }, 150);
    }

    return () => {
      cancelled = true;
      if (pollTimer !== undefined) {
        window.clearInterval(pollTimer);
      }
    };
  }, [clientId, configured]);

  if (!configured) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1.5">
      <div
        ref={containerRef}
        dir="ltr"
        className="flex min-h-[44px] items-center justify-center"
      />
      {scriptUnavailable && (
        <span className="text-[11px] text-[#ff9bb0]">
          بارگذاری دکمه ورود گوگل با خطا مواجه شد. لطفاً اتصال اینترنت یا مسدودکننده تبلیغات را بررسی کنید.
        </span>
      )}
    </div>
  );
}
