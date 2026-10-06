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

export async function uploadListingImage(uri: string, _userId: string) {
  const response = await fetch(uri);
  if (!response.ok) throw new Error("Unable to read the selected image.");
  const blob = await response.blob();
  const dataUrl = await blobToDataUrl(blob);
  return dataUrl;
}
