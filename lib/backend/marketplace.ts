import { demoPosts } from "@/data/demo";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { MarketplacePost, PostType } from "@/types/domain";

export type MarketplaceQuery = { limit?: number; cursor?: string; type?: PostType };

type PostRow = {
  id: string;
  type: PostType;
  category_id: string;
  category_label: string;
  product_name: string;
  description: string;
  quantity: number;
  unit: string;
  price: number | null;
  price_type: MarketplacePost["priceType"];
  location_label: string;
  image_urls: string[];
  status: MarketplacePost["status"];
  created_at: string;
  expires_at: string | null;
  profiles: { id: string; name: string; location_label: string | null } | null;
};

export type NewDraftPost = { type: PostType; productName: string; description: string; quantity: number; unit: string; locationLabel: string; imageUrls: string[] };

export async function createDraftPost(input: NewDraftPost) {
  if (!isSupabaseConfigured) throw new Error("Supabase is not configured for this environment");
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("Please sign in before creating a listing.");
  const { data, error } = await supabase.from("posts").insert({ user_id: userData.user.id, type: input.type, category_label: "Other", product_name: input.productName.trim(), description: input.description.trim(), quantity: input.quantity, unit: input.unit.trim(), location_label: input.locationLabel.trim(), image_urls: input.imageUrls, price_type: "CONTACT", status: "DRAFT" }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function listApprovedPosts(query: MarketplaceQuery = {}): Promise<MarketplacePost[]> {
  if (!isSupabaseConfigured) {
    const filtered = query.type ? demoPosts.filter((post) => post.type === query.type) : demoPosts;
    return filtered.slice(0, query.limit ?? 12);
  }

  let request = supabase
    .from("posts")
    .select("id,type,category_id,category_label,product_name,description,quantity,unit,price,price_type,location_label,image_urls,status,created_at,expires_at,profiles!posts_user_id_fkey(id,name,location_label)")
    .eq("status", "APPROVED")
    .order("created_at", { ascending: false })
    .limit(query.limit ?? 12);

  if (query.type) request = request.eq("type", query.type);
  if (query.cursor) request = request.lt("created_at", query.cursor);
  const { data, error } = await request;
  if (error) throw error;

  return (data as unknown as PostRow[]).map((row) => ({
    id: row.id,
    type: row.type,
    categoryId: row.category_id,
    categoryLabel: row.category_label,
    productName: row.product_name,
    description: row.description,
    quantity: row.quantity,
    unit: row.unit,
    price: row.price ?? undefined,
    priceType: row.price_type,
    locationLabel: row.location_label,
    imageUrl: row.image_urls[0] ?? "",
    status: row.status,
    poster: { id: row.profiles?.id ?? "unknown", name: row.profiles?.name ?? "SIGLA member", locationLabel: row.profiles?.location_label ?? row.location_label },
    createdAtLabel: new Date(row.created_at).toLocaleDateString(),
    expiresAt: row.expires_at ?? undefined,
    contactMethods: ["CALL"],
  }));
}
