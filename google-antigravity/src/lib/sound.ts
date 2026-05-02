import { Howl } from 'howler';
import { CONSTANTS } from './constants';

let soundInstance: Howl | null = null;

export const playWhoosh = () => {
  if (typeof window === 'undefined') return;
  if (!soundInstance) {
    soundInstance = new Howl({
      src: [CONSTANTS.SOUND_URL],
      volume: 0.5,
      html5: true, // Needed for large audio or cross-origin
    });
  }
  soundInstance.play();
};
