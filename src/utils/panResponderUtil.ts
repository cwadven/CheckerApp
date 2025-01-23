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
  let initialFocalPoint = { x: 0, y: 0 };
  let lastFocalPoint = { x: 0, y: 0 };

  const calculateDistance = (touch1: TouchPoint, touch2: TouchPoint): number => {
    return Math.sqrt(
      Math.pow(touch2.pageX - touch1.pageX, 2) +
      Math.pow(touch2.pageY - touch1.pageY, 2)
    );
  };

  const calculateFocalPoint = (touch1: TouchPoint, touch2: TouchPoint) => {
    return {
      x: (touch1.pageX + touch2.pageX) / 2,
      y: (touch1.pageY + touch2.pageY) / 2,
    };
  };

  return PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onStartShouldSetPanResponderCapture: () => false,
    
    onMoveShouldSetPanResponder: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const isDragging = Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      const isPinching = evt.nativeEvent.touches.length === 2;
      return isDragging || isPinching;
    },
    onMoveShouldSetPanResponderCapture: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
      const isDragging = Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      const isPinching = evt.nativeEvent.touches.length === 2;
      return isDragging || isPinching;
    },

    onPanResponderGrant: (evt) => {
      setIsPanning(true);
      const touches = evt.nativeEvent.touches;
      
      if (touches.length === 2) {
        initialFocalPoint = calculateFocalPoint(touches[0], touches[1]);
        lastFocalPoint = { ...initialFocalPoint };
      }

      pan.setOffset({
        x: pan.x._value,
        y: pan.y._value,
      });
      pan.setValue({ x: 0, y: 0 });
    },

    onPanResponderMove: (evt, gestureState) => {
      const touches = evt.nativeEvent.touches;
      
      if (touches.length === 2) {
        const currentFocalPoint = calculateFocalPoint(touches[0], touches[1]);
        const distance = calculateDistance(touches[0], touches[1]);

        if (lastDistance.current === 0) {
          lastDistance.current = distance;
          lastFocalPoint = currentFocalPoint;
          return;
        }

        const newScale = lastScale.current * (distance / lastDistance.current);
        const constrainedScale = Math.min(Math.max(newScale, 0.5), 3);
        
        scale.setValue(constrainedScale);

        // 핀치 줌의 중심점 이동 계산
        const focalDeltaX = currentFocalPoint.x - lastFocalPoint.x;
        const focalDeltaY = currentFocalPoint.y - lastFocalPoint.y;

        pan.setValue({
          x: focalDeltaX + gestureState.dx,
          y: focalDeltaY + gestureState.dy,
        });

        lastFocalPoint = currentFocalPoint;
      } else {
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