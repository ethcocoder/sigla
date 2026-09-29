import { supabase } from "@/lib/supabase";

export async function uploadListingImage(uri: string, userId: string) {
  const response = await fetch(uri);
  if (!response.ok) throw new Error("Unable to read the selected image.");
  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("listing-images").upload(path, blob, { contentType: blob.type || "image/jpeg", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
  return data.publicUrl;
}
