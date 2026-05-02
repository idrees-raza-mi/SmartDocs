export const useLogo = () => {
  const staggerDelay = 0.1;
  const idleAnimation = {
    y: [-4, 4, -4],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    }
  };

  return { staggerDelay, idleAnimation };
};
