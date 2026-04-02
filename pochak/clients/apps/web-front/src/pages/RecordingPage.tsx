import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LuVideo, LuVideoOff, LuCircle, LuSquare, LuCheck,
  LuWifi, LuWifiOff, LuSettings, LuChevronLeft,
} from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { pochakApi } from '@/services/api-client';

type RecordingState = 'idle' | 'preview' | 'recording' | 'paused' | 'completed';

interface SessionInfo {
  id: string;
  status: string;
  startedAt?: string;
  endedAt?: string;
}

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function RecordingPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<RecordingState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [connected, setConnected] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionInfo | null>(null);

  // Post-recording form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  // Fetch session info
  useEffect(() => {
    if (!sessionId) return;
    pochakApi.get<SessionInfo>(`/api/v1/recording-sessions/${sessionId}`)
      .then((data) => {
        if (data) setSession(data);
      });
  }, [sessionId]);

  // Network connectivity monitoring
  useEffect(() => {
    const handleOnline = () => setConnected(true);
    const handleOffline = () => setConnected(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Camera access
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, facingMode: 'environment' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setState('preview');
    } catch (err) {
      setCameraError(
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? '카메라 접근 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.'
          : '카메라를 시작할 수 없습니다. 기기를 확인해주세요.',
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Timer
  const startTimer = useCallback(() => {
    setElapsed(0);
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopTimer();
    };
  }, [stopCamera, stopTimer]);

  // Start recording
  const handleStartRecording = useCallback(async () => {
    setState('recording');
    startTimer();
    // Notify server
    if (sessionId) {
      await pochakApi.post(`/api/v1/recording-sessions/${sessionId}/start`);
    }
  }, [sessionId, startTimer]);

  // Stop recording
  const handleStopRecording = useCallback(async () => {
    stopTimer();
    setState('completed');
    stopCamera();
    // Notify server
    if (sessionId) {
      await pochakApi.post(`/api/v1/recording-sessions/${sessionId}/stop`);
    }
  }, [sessionId, stopTimer, stopCamera]);

  // Submit metadata and navigate
  const handleSubmit = useCallback(async () => {
    if (sessionId) {
      await pochakApi.put(`/api/v1/recording-sessions/${sessionId}`, {
        title: title.trim() || '무제',
        description: description.trim(),
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
    }
    navigate('/my');
  }, [sessionId, title, description, tags, navigate]);

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col">
      {/* Top bar */}
      <div
        className="flex items-center justify-between border-b border-white/[0.06]"
        style={{ padding: '12px 24px' }}
      >
        <div className="flex items-center" style={{ gap: 12 }}>
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
            <LuChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-[16px] font-bold text-foreground">
            {state === 'completed' ? '촬영 완료' : '촬영'}
          </h1>
          {session && (
            <span className="text-[13px] text-pochak-text-tertiary">
              세션: {session.id.slice(0, 8)}
            </span>
          )}
        </div>

        <div className="flex items-center" style={{ gap: 8 }}>
          {/* Network indicator */}
          <div className="flex items-center" style={{ gap: 4 }}>
            {connected ? (
              <LuWifi className="w-4 h-4 text-primary" />
            ) : (
              <LuWifiOff className="w-4 h-4 text-pochak-live" />
            )}
            <span className={`text-[12px] ${connected ? 'text-primary' : 'text-pochak-live'}`}>
              {connected ? '연결됨' : '연결 끊김'}
            </span>
          </div>
          <Button variant="ghost" size="icon-sm">
            <LuSettings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      {state !== 'completed' ? (
        <div className="flex-1 flex flex-col items-center justify-center" style={{ gap: 24, padding: 24 }}>
          {/* Camera feed */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ maxWidth: 960, aspectRatio: '16/9' }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Idle overlay */}
            {state === 'idle' && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60" style={{ gap: 16 }}>
                <LuVideo className="w-12 h-12 text-pochak-text-tertiary" />
                <p className="text-[15px] text-pochak-text-secondary">카메라를 시작하여 촬영을 준비하세요</p>
                <Button onClick={startCamera}>
                  <LuVideo className="w-4 h-4" /> 카메라 시작
                </Button>
              </div>
            )}

            {/* Camera error */}
            {cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60" style={{ gap: 12 }}>
                <LuVideoOff className="w-10 h-10 text-pochak-live" />
                <p className="text-[14px] text-pochak-text-secondary text-center" style={{ maxWidth: 360 }}>
                  {cameraError}
                </p>
                <Button variant="outline" onClick={startCamera}>다시 시도</Button>
              </div>
            )}

            {/* REC indicator */}
            {state === 'recording' && (
              <div
                className="absolute top-4 left-4 flex items-center bg-black/60 backdrop-blur-sm rounded-full"
                style={{ gap: 6, padding: '6px 12px' }}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-pochak-live animate-[pulse-live_1.5s_ease-in-out_infinite]" />
                <span className="text-[13px] font-bold text-white tracking-wider">REC</span>
              </div>
            )}

            {/* Timer */}
            {(state === 'recording' || state === 'paused') && (
              <div
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg"
                style={{ padding: '6px 14px' }}
              >
                <span className="text-[18px] font-mono text-white font-bold tabular-nums">
                  {formatTimer(elapsed)}
                </span>
              </div>
            )}

            {/* Disconnected overlay */}
            {!connected && state === 'recording' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="flex flex-col items-center" style={{ gap: 8 }}>
                  <LuWifiOff className="w-8 h-8 text-pochak-live" />
                  <p className="text-[14px] text-white font-medium">네트워크 연결 끊김</p>
                  <p className="text-[13px] text-white/60">자동 재연결 시도 중...</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center" style={{ gap: 16 }}>
            {state === 'idle' && !cameraError && (
              <p className="text-pochak-text-tertiary text-[14px]">카메라를 시작해주세요</p>
            )}

            {state === 'preview' && (
              <Button
                size="lg"
                className="bg-pochak-live hover:bg-pochak-live/90 text-white"
                onClick={handleStartRecording}
              >
                <LuCircle className="w-5 h-5 fill-current" /> 촬영 시작
              </Button>
            )}

            {state === 'recording' && (
              <Button
                size="lg"
                variant="outline"
                className="border-pochak-live text-pochak-live hover:bg-pochak-live/10"
                onClick={handleStopRecording}
              >
                <LuSquare className="w-4 h-4 fill-current" /> 촬영 중단
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Post-recording metadata form */
        <div className="flex-1 flex justify-center" style={{ padding: 32 }}>
          <div className="w-full" style={{ maxWidth: 640 }}>
            <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}>
              <LuCheck className="w-5 h-5 text-primary" />
              <p className="text-[15px] text-primary font-semibold">
                촬영 완료 — {formatTimer(elapsed)}
              </p>
            </div>
            <p className="text-[14px] text-pochak-text-secondary" style={{ marginBottom: 32 }}>
              촬영 정보를 입력하고 업로드를 시작하세요.
            </p>

            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <label className="block text-[14px] font-medium text-foreground" style={{ marginBottom: 6 }}>
                제목 <span className="text-pochak-live">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="영상 제목을 입력하세요"
                className="w-full h-10 rounded-lg bg-white/[0.06] border border-white/[0.1] text-[14px] text-foreground placeholder:text-pochak-text-muted outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                style={{ paddingLeft: 14, paddingRight: 14 }}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <label className="block text-[14px] font-medium text-foreground" style={{ marginBottom: 6 }}>
                설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="영상에 대한 설명을 입력하세요"
                rows={4}
                className="w-full rounded-lg bg-white/[0.06] border border-white/[0.1] text-[14px] text-foreground placeholder:text-pochak-text-muted outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                style={{ padding: 14 }}
              />
            </div>

            {/* Tags */}
            <div style={{ marginBottom: 32 }}>
              <label className="block text-[14px] font-medium text-foreground" style={{ marginBottom: 6 }}>
                태그
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="쉼표로 구분 (예: 축구, 리틀야구, U10)"
                className="w-full h-10 rounded-lg bg-white/[0.06] border border-white/[0.1] text-[14px] text-foreground placeholder:text-pochak-text-muted outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                style={{ paddingLeft: 14, paddingRight: 14 }}
              />
            </div>

            {/* Submit */}
            <div className="flex items-center" style={{ gap: 12 }}>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="flex-1"
              >
                <LuCheck className="w-4 h-4" /> 업로드 시작
              </Button>
              <Button variant="outline" onClick={() => navigate('/my')}>
                나중에 하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
