import { useCallback, useState } from 'react';
import { useNaverMapLoaded } from './NaverMapProvider';
import type { GeocoderResult } from './types';

interface UseNaverGeocoderReturn {
  geocode: (query: string) => Promise<GeocoderResult[]>;
  loading: boolean;
  error: string | null;
}

export default function useNaverGeocoder(): UseNaverGeocoderReturn {
  const { isLoaded } = useNaverMapLoaded();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(
    (query: string): Promise<GeocoderResult[]> => {
      if (!isLoaded || !naver?.maps?.Service) {
        return Promise.reject(new Error('Naver Maps SDK not loaded'));
      }

      setLoading(true);
      setError(null);

      return new Promise((resolve, reject) => {
        naver.maps.Service.geocode({ query }, (status, response) => {
          setLoading(false);

          if (status !== naver.maps.Service.Status.OK) {
            const msg = '지오코딩에 실패했습니다.';
            setError(msg);
            reject(new Error(msg));
            return;
          }

          const results: GeocoderResult[] = response.v2.addresses.map((addr) => ({
            address: addr.jibunAddress,
            roadAddress: addr.roadAddress,
            lat: parseFloat(addr.y),
            lng: parseFloat(addr.x),
          }));

          resolve(results);
        });
      });
    },
    [isLoaded],
  );

  return { geocode, loading, error };
}
