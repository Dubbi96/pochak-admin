import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Dimensions } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// 720×1280 H.264, 105KB (원본 4K 27MB에서 다운스케일)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const introVideo = require('../../assets/pochak_intro.mp4');

interface SplashScreenProps {
  onComplete?: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const hasCompleted = useRef(false);

  const player = useVideoPlayer(introVideo, (p) => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    let playStarted = false;
    let safetyTimer: ReturnType<typeof setTimeout> | null = null;

    const complete = () => {
      if (hasCompleted.current) return;
      hasCompleted.current = true;
      if (safetyTimer) clearTimeout(safetyTimer);
      onComplete?.();
    };

    const sub = player.addListener('statusChange', (payload) => {
      if (payload.status === 'readyToPlay' && !playStarted) {
        playStarted = true;
      }
      if (payload.status === 'idle' && playStarted) {
        complete();
      }
    });

    // Safety: 6초 후 강제 진행
    safetyTimer = setTimeout(complete, 6000);

    return () => {
      sub.remove();
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, [player, onComplete]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00C700" translucent />
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00C700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH * 1.75,
    height: SCREEN_HEIGHT * 1.75,
  },
});
