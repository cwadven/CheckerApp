import { PanResponder, Animated, GestureResponderEvent, PanResponderGestureState } from 'react-native';

interface CreatePanResponderProps {
  pan: Animated.ValueXY;
  scale: Animated.Value;
  lastScale: React.MutableRefObject<number>;
  lastDistance: React.MutableRefObject<number>;
  setIsPanning: (isPanning: boolean) => void;
}

interface TouchPoint {
  pageX: number;
  pageY: number;
}

export const createMapPanResponder = ({
  pan,
  scale,
  lastScale,
  lastDistance,
  setIsPanning,
}: CreatePanResponderProps) => {
  const calculateDistance = (touch1: TouchPoint, touch2: TouchPoint): number => {
    return Math.sqrt(
      Math.pow(touch2.pageX - touch1.pageX, 2) +
      Math.pow(touch2.pageY - touch1.pageY, 2)
    );
  };

  return PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,

    onPanResponderGrant: () => {
      setIsPanning(true);
      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
      pan.setValue({ x: 0, y: 0 });
    },

    onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const touches = evt.nativeEvent.touches;
      
      // 두 손가락으로 터치했을 때 (핀치 줌)
      if (touches.length === 2) {
        const distance = calculateDistance(touches[0], touches[1]);

        if (lastDistance.current === 0) {
          lastDistance.current = distance;
        }

        const newScale = lastScale.current * (distance / lastDistance.current);
        scale.setValue(Math.min(Math.max(newScale, 0.5), 3));
      } 
      // 한 손가락으로 터치했을 때 (패닝)
      else {
        pan.setValue({
          x: gestureState.dx,
          y: gestureState.dy,
        });
      }
    },

    onPanResponderRelease: () => {
      setIsPanning(false);
      pan.flattenOffset();
      lastScale.current = scale._value;
      lastDistance.current = 0;
    },
  });
}; 