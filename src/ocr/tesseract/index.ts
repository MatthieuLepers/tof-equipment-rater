import nodeTextFromImage from 'node-text-from-image';

import type { TOcrSolution } from '@/ocr/TOcrSolution';

export const tesseract: TOcrSolution = {
  getTextFromImage: nodeTextFromImage,
};
