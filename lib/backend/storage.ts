const MAX_IMAGE_DATA_URL_LENGTH = 850_000;

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Unable to encode the selected image."));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Unable to encode the selected image."));
    reader.readAsDataURL(blob);
  });
}

/**
 * Firestore-only image persistence for the Firebase Spark/free tier.
 * Firestore has a 1 MiB document limit, so keep the encoded image below
 * 850 KB to leave room for the rest of the post document.
 */
export async function uploadListingImage(uri: string, _userId: string) {
  const response = await fetch(uri);
  if (!response.ok) throw new Error("Unable to read the selected image.");
  const blob = await response.blob();
  const dataUrl = await blobToDataUrl(blob);
  if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    throw new Error("This image is too large. Please choose a smaller photo.");
  }
  return dataUrl;
}
