export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapOptions {
  center: LatLng;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomControl?: boolean;
  mapTypeControl?: boolean;
}

export interface MarkerOptions {
  position: LatLng;
  title?: string;
  icon?: {
    url: string;
    size?: { width: number; height: number };
    anchor?: { x: number; y: number };
  };
  clickable?: boolean;
}

export interface GeocoderResult {
  address: string;
  roadAddress: string;
  lat: number;
  lng: number;
}

declare global {
  interface Window {
    naver: typeof naver;
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace naver {
    namespace maps {
      class Map {
        constructor(el: HTMLElement, options?: Record<string, unknown>);
        setCenter(latlng: LatLng): void;
        setZoom(zoom: number): void;
        getCenter(): LatLng;
        getZoom(): number;
        panTo(latlng: LatLng, options?: Record<string, unknown>): void;
        fitBounds(bounds: LatLngBounds): void;
        destroy(): void;
      }
      class LatLng {
        constructor(lat: number, lng: number);
        lat(): number;
        lng(): number;
      }
      class LatLngBounds {
        constructor(sw: LatLng, ne: LatLng);
        extend(latlng: LatLng): LatLngBounds;
        static bounds(latlng1: LatLng, latlng2: LatLng): LatLngBounds;
      }
      class Marker {
        constructor(options: Record<string, unknown>);
        setMap(map: Map | null): void;
        getPosition(): LatLng;
        setPosition(latlng: LatLng): void;
        setIcon(icon: unknown): void;
      }
      class InfoWindow {
        constructor(options: Record<string, unknown>);
        open(map: Map, marker: Marker): void;
        close(): void;
        setContent(content: string): void;
      }
      class Size {
        constructor(width: number, height: number);
      }
      class Point {
        constructor(x: number, y: number);
      }
      // eslint-disable-next-line @typescript-eslint/no-namespace
      namespace Event {
        function addListener(target: unknown, type: string, handler: (...args: unknown[]) => void): unknown;
        function removeListener(listener: unknown): void;
      }
      const Service: {
        Status: { OK: number; ERROR: number };
        geocode(options: { query: string }, callback: (status: number, response: { v2: { addresses: Array<{ x: string; y: string; roadAddress: string; jibunAddress: string }> } }) => void): void;
        reverseGeocode(options: { coords: LatLng; orders: string }, callback: (status: number, response: { v2: { results: Array<{ region: Record<string, { name: string }> }> } }) => void): void;
      };
    }
  }
}

export {};
