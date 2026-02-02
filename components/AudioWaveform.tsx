import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface AudioWaveformProps {
  isActive: boolean;
  color?: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ isActive, color = '#A4D65E' }) => {
  const bars = useRef(
    Array.from({ length: 5 }, () => ({
      height: new Animated.Value(8),
    }))
  ).current;

  useEffect(() => {
    if (isActive) {
      // Crear animaciones para cada barra con diferentes delays
      const animations = bars.map((bar, index) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(bar.height, {
              toValue: Math.random() * 40 + 20, // Altura aleatoria entre 20 y 60
              duration: 300 + Math.random() * 200, // Duración aleatoria entre 300 y 500ms
              useNativeDriver: false,
            }),
            Animated.timing(bar.height, {
              toValue: 8,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ]),
          { iterations: -1 }
        );
      });

      // Iniciar todas las animaciones con delays escalonados
      animations.forEach((anim, index) => {
        setTimeout(() => {
          anim.start();
        }, index * 50);
      });

      return () => {
        animations.forEach((anim) => anim.stop());
      };
    } else {
      // Detener animaciones y resetear a altura mínima
      bars.forEach((bar) => {
        bar.height.stopAnimation();
        Animated.timing(bar.height, {
          toValue: 8,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isActive, bars]);

  return (
    <View style={styles.container}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: bar.height,
              backgroundColor: color,
              opacity: isActive ? 1 : 0.3,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 60,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    minHeight: 8,
  },
});

export default AudioWaveform;

