// OTTO's outlines, drawn from the club logo on a 100-unit grid.
export const HEAD = 'M100 50A50 50 0 0 1 150 0H350A50 50 0 0 1 400 50A50 50 0 0 0 450 100A50 50 0 0 1 500 150V350A50 50 0 0 1 400 350V150A50 50 0 0 0 350 100H150A50 50 0 0 0 100 150V350A50 50 0 0 1 0 350V150A50 50 0 0 1 50 100A50 50 0 0 0 100 50Z';
export const STEM = 'M228 0Q240-25 228-50H272Q260-25 272 0Z';
export const STANDING = 'M150 380H350A50 50 0 0 1 350 480A50 50 0 0 0 300 530V630A50 50 0 0 0 350 680A50 50 0 0 1 400 730A50 50 0 0 0 450 780A50 50 0 0 1 500 830V1030A50 50 0 0 0 550 1080H350A50 50 0 0 0 400 1030V830A50 50 0 0 0 350 780H150A50 50 0 0 0 100 830V1030A50 50 0 0 0 150 1080H-50A50 50 0 0 0 0 1030V830A50 50 0 0 1 50 780A50 50 0 0 0 100 730A50 50 0 0 1 150 680A50 50 0 0 0 200 630V530A50 50 0 0 0 150 480A50 50 0 0 1 150 380Z';
export const TORSO = 'M150 380H350A50 50 0 0 1 350 480A50 50 0 0 0 300 530V630A50 50 0 0 0 350 680H150A50 50 0 0 0 200 630V530A50 50 0 0 0 150 480A50 50 0 0 1 150 380Z';
export const LEGS = 'M150 680H350A50 50 0 0 1 400 730A50 50 0 0 0 450 780A50 50 0 0 1 500 830V1030A50 50 0 0 1 400 1030V830A50 50 0 0 0 350 780H150A50 50 0 0 0 100 830V1030A50 50 0 0 1 0 1030V830A50 50 0 0 1 50 780A50 50 0 0 0 100 730A50 50 0 0 1 150 680Z';
export const EYE_L = [176, 238] as const;
export const EYE_R = [324, 238] as const;
export const EYE_R_SIZE = 32.5;
export const BALL = [250, -74, 38] as const;
export const VIEWBOX = '-50 -114 600 1194';

export const webglOk = () => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if ((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) return false;
  try { return !!document.createElement('canvas').getContext('webgl2'); } catch { return false; }
};
