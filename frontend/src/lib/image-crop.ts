const OUTPUT_SIZE = 512;

export type CropTransform = {
  baseScale: number;
  scale: number;
  offsetX: number;
  offsetY: number;
  containerSize: number;
};

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not load image'));
    };

    image.src = url;
  });
}

export function getInitialCropTransform(
  image: HTMLImageElement,
  containerSize: number,
): CropTransform {
  const baseScale = Math.max(
    containerSize / image.naturalWidth,
    containerSize / image.naturalHeight,
  );

  return {
    baseScale,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    containerSize,
  };
}

export function cropImageToSquare(
  image: HTMLImageElement,
  transform: CropTransform,
  outputSize = OUTPUT_SIZE,
): HTMLCanvasElement {
  const displayScale = transform.baseScale * transform.scale;
  const displayW = image.naturalWidth * displayScale;
  const displayH = image.naturalHeight * displayScale;
  const { containerSize, offsetX, offsetY } = transform;

  const imgLeft = containerSize / 2 - displayW / 2 + offsetX;
  const imgTop = containerSize / 2 - displayH / 2 + offsetY;

  const cropX = (0 - imgLeft) / displayScale;
  const cropY = (0 - imgTop) / displayScale;
  const cropSize = containerSize / displayScale;

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create canvas context');
  }

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropSize,
    cropSize,
    0,
    0,
    outputSize,
    outputSize,
  );

  return canvas;
}

export function canvasToFile(
  canvas: HTMLCanvasElement,
  fileName: string,
  mimeType = 'image/jpeg',
  quality = 0.92,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Could not export image'));
          return;
        }

        resolve(new File([blob], fileName, { type: mimeType }));
      },
      mimeType,
      quality,
    );
  });
}

export async function cropFileToSquare(
  file: File,
  transform: CropTransform,
): Promise<File> {
  const image = await loadImageFromFile(file);
  const canvas = cropImageToSquare(image, transform);
  const extension = file.type === 'image/png' ? 'png' : 'jpg';
  const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

  return canvasToFile(canvas, `cropped.${extension}`, mimeType);
}
