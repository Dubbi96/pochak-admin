import { useEffect, useRef } from 'react';
import type { LatLng } from './types';

interface NaverMarkerProps {
  map: naver.maps.Map;
  position: LatLng;
  title?: string;
  icon?: {
    url: string;
    size?: { width: number; height: number };
    anchor?: { x: number; y: number };
  };
  infoContent?: string;
  onClick?: () => void;
}

export default function NaverMarker({
  map,
  position,
  title,
  icon,
  infoContent,
  onClick,
}: NaverMarkerProps) {
  const markerRef = useRef<naver.maps.Marker | null>(null);
  const infoRef = useRef<naver.maps.InfoWindow | null>(null);
  const listenerRef = useRef<unknown>(null);

  useEffect(() => {
    const markerOptions: Record<string, unknown> = {
      map,
      position: new naver.maps.LatLng(position.lat, position.lng),
    };

    if (title) markerOptions.title = title;

    if (icon) {
      markerOptions.icon = {
        url: icon.url,
        size: icon.size ? new naver.maps.Size(icon.size.width, icon.size.height) : undefined,
        anchor: icon.anchor ? new naver.maps.Point(icon.anchor.x, icon.anchor.y) : undefined,
      };
    }

    const marker = new naver.maps.Marker(markerOptions);
    markerRef.current = marker;

    if (infoContent) {
      const infoWindow = new naver.maps.InfoWindow({
        content: `<div style="padding:10px;font-size:13px;background:#1f1f1f;color:#e0e0e0;border:1px solid #333;border-radius:8px;min-width:140px">${infoContent}</div>`,
        borderWidth: 0,
        backgroundColor: 'transparent',
        disableAnchor: true,
      });
      infoRef.current = infoWindow;

      let infoOpen = false;
      listenerRef.current = naver.maps.Event.addListener(marker, 'click', () => {
        if (infoOpen) {
          infoWindow.close();
          infoOpen = false;
        } else {
          infoWindow.open(map, marker);
          infoOpen = true;
        }
        onClick?.();
      });
    } else if (onClick) {
      listenerRef.current = naver.maps.Event.addListener(marker, 'click', onClick);
    }

    return () => {
      if (listenerRef.current) {
        naver.maps.Event.removeListener(listenerRef.current);
      }
      infoRef.current?.close();
      marker.setMap(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    markerRef.current?.setPosition(new naver.maps.LatLng(position.lat, position.lng));
  }, [position.lat, position.lng]);

  return null;
}
