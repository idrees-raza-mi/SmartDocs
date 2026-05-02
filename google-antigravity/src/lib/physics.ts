import { MotionElement } from '@/types/gravity';

export const calculatePhysicsParams = (type: MotionElement['type']) => {
  const delay = Math.random() * 0.8;
  const yTarget = -800 - Math.random() * 600;
  const rotation = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360);
  const rotDuration = 1.8 + Math.random() * 1.4;
  const xTarget = (Math.random() > 0.5 ? 1 : -1) * (50 + Math.random() * 150);
  const scale = 0.6 + Math.random() * 0.6;
  
  let override = {};
  if (type === 'logo') {
    override = { yTarget: yTarget * 1.2, rotation: rotation * 1.5, rotDuration: 1.4 };
  } else if (type === 'nav') {
    override = { xTarget: xTarget * 3, yTarget: yTarget * 0.8 };
  } else if (type === 'button') {
    override = { rotation: rotation * 2 };
  }

  return {
    delay,
    yTarget: override.yTarget ?? yTarget,
    xTarget: override.xTarget ?? xTarget,
    rotation: override.rotation ?? rotation,
    rotDuration: override.rotDuration ?? rotDuration,
    scale,
  };
};

export const EASE_CUBIC_BEZIER = [0.25, 0.46, 0.45, 0.94];
