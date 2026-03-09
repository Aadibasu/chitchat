import { useCallback } from 'react';

// Array of keystroke sound files (assuming they exist in public/sounds/)
const keystrokeSounds = [
  '/sounds/keystroke1.mp3',
  '/sounds/keystroke2.mp3',
  '/sounds/keystroke3.mp3',
  // Add more sound files as needed
];

const useKeyboardSound = () => {
  const playRandomKeyStrokeSound = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * keystrokeSounds.length);
    const audio = new Audio(keystrokeSounds[randomIndex]);
    audio.play().catch((error) => {
      console.error('Error playing keystroke sound:', error);
    });
  }, []);

  return { playRandomKeyStrokeSound };
};

export default useKeyboardSound;