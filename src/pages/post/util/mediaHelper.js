
export async function canvasPreview(image, crop) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx || !crop?.width || !crop?.height) return null;

  const naturalWidth = image.naturalWidth;
  const naturalHeight = image.naturalHeight;

  const scaleX = naturalWidth / image.width;
  const scaleY = naturalHeight / image.height;

  const cropX = crop.x * scaleX;
  const cropY = crop.y * scaleY;
  const cropWidth = crop.width * scaleX;
  const cropHeight = crop.height * scaleY;

  canvas.width = Math.floor(cropWidth);
  canvas.height = Math.floor(cropHeight);

  // Clear (no black background)
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.95);
  });
}
