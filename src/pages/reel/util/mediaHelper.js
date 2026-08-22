export async function canvasPreview(
    image,
    crop
) {
    const canvas =
        document.createElement("canvas");

    const scaleX =
        image.naturalWidth /
        image.width;

    const scaleY =
        image.naturalHeight /
        image.height;

    canvas.width = Math.round(
        crop.width * scaleX
    );

    canvas.height = Math.round(
        crop.height * scaleY
    );

    const ctx =
        canvas.getContext("2d");

    if (!ctx) {
        return null;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
        image,

        crop.x * scaleX,
        crop.y * scaleY,

        crop.width * scaleX,
        crop.height * scaleY,

        0,
        0,

        crop.width * scaleX,
        crop.height * scaleY
    );

    return new Promise((resolve) => {

        canvas.toBlob(
            (blob) => resolve(blob),
            "image/jpeg",
            0.95
        );

    });
}