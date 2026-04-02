/**
 * MediaImage — URI 이미지 실패 or 빈값 시 Pochak 로고 썸네일로 fallback
 */
import React, {useState} from 'react';
import {Image, View, type ImageStyle, type StyleProp, type ViewStyle} from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const POCHAK_THUMB = require('../../../assets/pochak_thumb.png');

interface MediaImageProps {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  /** true: 검정 배경 + contain으로 비율 유지 (letterbox) */
  letterbox?: boolean;
}

export default function MediaImage({
  uri,
  style,
  resizeMode = 'cover',
  letterbox = false,
}: MediaImageProps) {
  const [failed, setFailed] = useState(false);

  const isPlaceholder =
    !uri ||
    uri.includes('via.placeholder.com') ||
    uri.trim() === '';

  const effectiveResizeMode = letterbox ? 'contain' : resizeMode;

  const renderImage = (source: any, onError?: () => void) => {
    const image = (
      <Image
        source={source}
        style={letterbox ? {width: '100%', height: '100%'} : style}
        resizeMode={effectiveResizeMode}
        {...(onError ? {onError} : {})}
      />
    );

    if (letterbox) {
      return (
        <View style={[style as StyleProp<ViewStyle>, {backgroundColor: '#000', overflow: 'hidden'}]}>
          {image}
        </View>
      );
    }

    return image;
  };

  if (isPlaceholder || failed) {
    return renderImage(POCHAK_THUMB);
  }

  return renderImage({uri}, () => setFailed(true));
}
