import { useEffect, useRef } from 'react';
import type { LatLng } from './types';

interface ClusterItem {
  position: LatLng;
  title?: string;
  data?: unknown;
}

interface NaverMarkerClusterProps {
  map: naver.maps.Map;
  items: ClusterItem[];
  gridSize?: number;
  minClusterSize?: number;
  maxZoom?: number;
  onClick?: (item: ClusterItem) => void;
}

export default function NaverMarkerCluster({
  map,
  items,
  gridSize = 60,
  minClusterSize = 2,
  maxZoom = 16,
  onClick,
}: NaverMarkerClusterProps) {
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const listenersRef = useRef<unknown[]>([]);

  useEffect(() => {
    // Clean previous markers
    markersRef.current.forEach((m) => m.setMap(null));
    listenersRef.current.forEach((l) => naver.maps.Event.removeListener(l));
    markersRef.current = [];
    listenersRef.current = [];

    const currentZoom = map.getZoom();

    if (currentZoom >= maxZoom) {
      // Show individual markers at high zoom
      items.forEach((item) => {
        const marker = new naver.maps.Marker({
          map,
          position: new naver.maps.LatLng(item.position.lat, item.position.lng),
          title: item.title,
        });
        markersRef.current.push(marker);

        if (onClick) {
          const listener = naver.maps.Event.addListener(marker, 'click', () => onClick(item));
          listenersRef.current.push(listener);
        }
      });
      return;
    }

    // Simple grid-based clustering
    const clusters = clusterByGrid(items, gridSize, currentZoom);

    clusters.forEach((cluster) => {
      if (cluster.items.length < minClusterSize) {
        // Single marker
        cluster.items.forEach((item) => {
          const marker = new naver.maps.Marker({
            map,
            position: new naver.maps.LatLng(item.position.lat, item.position.lng),
            title: item.title,
          });
          markersRef.current.push(marker);

          if (onClick) {
            const listener = naver.maps.Event.addListener(marker, 'click', () => onClick(item));
            listenersRef.current.push(listener);
          }
        });
      } else {
        // Cluster marker
        const marker = new naver.maps.Marker({
          map,
          position: new naver.maps.LatLng(cluster.center.lat, cluster.center.lng),
          icon: {
            content: `<div style="
              display:flex;align-items:center;justify-content:center;
              width:36px;height:36px;border-radius:50%;
              background:rgba(0,200,83,0.85);color:#fff;
              font-size:13px;font-weight:700;
              border:2px solid rgba(255,255,255,0.3);
              box-shadow:0 2px 8px rgba(0,0,0,0.4);
            ">${cluster.items.length}</div>`,
            anchor: new naver.maps.Point(18, 18),
          },
        });
        markersRef.current.push(marker);

        const listener = naver.maps.Event.addListener(marker, 'click', () => {
          // Zoom into cluster
          map.setZoom(currentZoom + 2);
          map.panTo(new naver.maps.LatLng(cluster.center.lat, cluster.center.lng), {} as Record<string, unknown>);
        });
        listenersRef.current.push(listener);
      }
    });

    // Re-cluster on zoom change
    const zoomListener = naver.maps.Event.addListener(map, 'zoom_changed', () => {
      // Trigger re-render by calling the effect cleanup + rerun
    });
    listenersRef.current.push(zoomListener);

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      listenersRef.current.forEach((l) => naver.maps.Event.removeListener(l));
      markersRef.current = [];
      listenersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, items, gridSize, minClusterSize, maxZoom]);

  return null;
}

interface Cluster {
  center: LatLng;
  items: ClusterItem[];
}

function clusterByGrid(items: ClusterItem[], gridSize: number, zoom: number): Cluster[] {
  const scale = Math.pow(2, zoom);
  const cellSize = gridSize / scale;
  const buckets = new Map<string, ClusterItem[]>();

  items.forEach((item) => {
    const cellX = Math.floor(item.position.lng / cellSize);
    const cellY = Math.floor(item.position.lat / cellSize);
    const key = `${cellX}:${cellY}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      buckets.set(key, [item]);
    }
  });

  const clusters: Cluster[] = [];
  buckets.forEach((clusterItems) => {
    const avgLat = clusterItems.reduce((s, i) => s + i.position.lat, 0) / clusterItems.length;
    const avgLng = clusterItems.reduce((s, i) => s + i.position.lng, 0) / clusterItems.length;
    clusters.push({ center: { lat: avgLat, lng: avgLng }, items: clusterItems });
  });

  return clusters;
}
