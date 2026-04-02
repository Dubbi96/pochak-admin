import { useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LuLink, LuCheck, LuX } from 'react-icons/lu';
import Modal from '@/components/Modal';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  url?: string;
  title?: string;
}

const TOAST_DURATION = 2000;

export default function ShareModal({ open, onClose, url, title }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareTitle = title || '포착에서 공유합니다';

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), TOAST_DURATION);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), TOAST_DURATION);
    }
  }, [shareUrl]);

  const openShareWindow = useCallback((shareHref: string) => {
    window.open(shareHref, '_blank', 'noopener,noreferrer,width=600,height=500');
  }, []);

  const handleKakao = useCallback(() => {
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}`;
    openShareWindow(kakaoUrl);
  }, [shareUrl, openShareWindow]);

  const handleTwitter = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
    openShareWindow(twitterUrl);
  }, [shareUrl, shareTitle, openShareWindow]);

  const handleFacebook = useCallback(() => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    openShareWindow(fbUrl);
  }, [shareUrl, openShareWindow]);

  return (
    <Modal open={open} onClose={onClose} title="공유">
      {/* QR Code */}
      <div className="flex justify-center" style={{ marginBottom: 24 }}>
        <div
          className="rounded-xl overflow-hidden bg-white flex items-center justify-center"
          style={{ padding: 16 }}
        >
          <QRCodeSVG
            value={shareUrl}
            size={160}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
            includeMargin={false}
          />
        </div>
      </div>

      {/* URL display + copy button */}
      <div
        className="flex items-center rounded-lg bg-white/[0.06] border border-white/[0.08]"
        style={{ gap: 8, padding: '8px 12px', marginBottom: 20 }}
      >
        <LuLink className="w-4 h-4 text-pochak-text-tertiary flex-shrink-0" />
        <span className="flex-1 text-[13px] text-pochak-text-secondary truncate min-w-0">
          {shareUrl}
        </span>
        <button
          onClick={handleCopyLink}
          className={`flex-shrink-0 flex items-center justify-center rounded-md text-[13px] font-semibold transition-all duration-200 ${
            copied
              ? 'bg-primary/20 text-primary'
              : 'bg-primary text-primary-foreground hover:brightness-110 active:scale-95'
          }`}
          style={{ height: 32, paddingLeft: 12, paddingRight: 12, gap: 4 }}
        >
          {copied ? (
            <>
              <LuCheck className="w-3.5 h-3.5" />
              복사됨
            </>
          ) : (
            '링크 복사'
          )}
        </button>
      </div>

      {/* Social share buttons */}
      <div className="flex items-center justify-center" style={{ gap: 16 }}>
        {/* KakaoTalk */}
        <button
          onClick={handleKakao}
          className="flex flex-col items-center transition-transform duration-150 active:scale-90"
          style={{ gap: 6 }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 52, height: 52, backgroundColor: '#FEE500' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 3C6.48 3 2 6.58 2 10.89c0 2.78 1.86 5.22 4.66 6.6l-1.19 4.38c-.1.37.32.67.65.47l5.23-3.43c.21.02.43.03.65.03 5.52 0 10-3.58 10-7.94C22 6.58 17.52 3 12 3z" fill="#3C1E1E"/>
            </svg>
          </div>
          <span className="text-[12px] text-pochak-text-secondary">카카오톡</span>
        </button>

        {/* Twitter/X */}
        <button
          onClick={handleTwitter}
          className="flex flex-col items-center transition-transform duration-150 active:scale-90"
          style={{ gap: 6 }}
        >
          <div
            className="flex items-center justify-center rounded-full bg-white"
            style={{ width: 52, height: 52 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#000"/>
            </svg>
          </div>
          <span className="text-[12px] text-pochak-text-secondary">X</span>
        </button>

        {/* Facebook */}
        <button
          onClick={handleFacebook}
          className="flex flex-col items-center transition-transform duration-150 active:scale-90"
          style={{ gap: 6 }}
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: 52, height: 52, backgroundColor: '#1877F2' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill="#fff"/>
            </svg>
          </div>
          <span className="text-[12px] text-pochak-text-secondary">Facebook</span>
        </button>
      </div>

      {/* Toast notification */}
      {copied && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[1100] flex items-center bg-pochak-surface border border-white/[0.1] rounded-lg shadow-2xl animate-slide-up"
          style={{ gap: 8, padding: '10px 20px' }}
        >
          <LuCheck className="w-4 h-4 text-primary" />
          <span className="text-[14px] text-foreground font-medium">복사되었습니다</span>
        </div>
      )}
    </Modal>
  );
}
