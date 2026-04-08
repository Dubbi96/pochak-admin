import { useEffect, useRef, type ReactNode } from 'react';
import { useNaverMapLoaded } from './NaverMapProvider';
import type { LatLng as LatLngType } from './types';

interface NaverMapProps {
  center: LatLngType;
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  onMapReady?: (map: naver.maps.Map) => void;
}

export default function NaverMap({
  center,
  zoom = 14,
  className,
  style,
  children,
  onMapReady,
}: NaverMapProps) {
  const { isLoaded, error } = useNaverMapLoaded();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<naver.maps.Map | null>(null);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    const map = new naver.maps.Map(containerRef.current, {
      center: new naver.maps.LatLng(center.lat, center.lng),
      zoom,
      zoomControl: true,
      zoomControlOptions: {
        position: 3, // naver.maps.Position.TOP_RIGHT
      },
    });

    mapRef.current = map;
    onMapReady?.(map);

    return () => {
      map.destroy();
      mapRef.current = null;
    };
    // Only create map once when SDK loads
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.panTo(new naver.maps.LatLng(center.lat, center.lng), { duration: 300 } as Record<string, unknown>);
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setZoom(zoom);
  }, [zoom]);

  if (error) {
    return (
      <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', color: '#fff', fontSize: 14 }}>
        지도를 불러올 수 없습니다.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={className} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #00C853', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {children}
    </div>
  );
}
