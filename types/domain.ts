export type UserRole = "USER" | "ADMIN";
export type UserStatus =
  | "REGISTERED"
  | "PAYMENT_PENDING"
  | "UNDER_REVIEW"
  | "ACTIVE"
  | "SUSPENDED"
  | "REJECTED";
export type PostType = "HAVE" | "NEED";
export type PostStatus =
  | "DRAFT"
  | "PAYMENT_PENDING"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "SUSPENDED";
export type PaymentType = "REGISTRATION" | "POST";
export type PaymentStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type PriceType = "FIXED" | "NEGOTIABLE" | "CONTACT";
export type ContactMethod = "CALL" | "TELEGRAM" | "WHATSAPP";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  locationLabel?: string;
  avatarUrl?: string;
}

export interface MarketplacePost {
  id: string;
  type: PostType;
  categoryId: string;
  categoryLabel: string;
  productName: string;
  description: string;
  quantity: number;
  unit: string;
  price?: number;
  priceType: PriceType;
  locationLabel: string;
  imageUrl: string;
  status: PostStatus;
  poster: Pick<UserProfile, "id" | "name" | "locationLabel">;
  createdAtLabel: string;
  expiresAt?: string;
  contactMethods: ContactMethod[];
}

export interface PaymentRecord {
  id: string;
  type: PaymentType;
  amount: number;
  transactionReference: string;
  senderPhone: string;
  status: PaymentStatus;
  submittedAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  kind: "PAYMENT" | "POST" | "ANNOUNCEMENT" | "SYSTEM";
  createdAtLabel: string;
  read: boolean;
}

export interface MarketplaceSettings {
  appNameEn: string;
  appNameAm: string;
  registrationFee: number;
  postFee: number;
  telebirrNumber: string;
  maxPostsPerDay: number;
  maxImagesPerPost: number;
  postExpirationDays: number;
  allowNewRegistrations: boolean;
  requirePostApproval: boolean;
  requireUserApproval: boolean;
  supportPhone?: string;
  supportTelegram?: string;
}

export interface FilterState {
  query: string;
  type: PostType | "ALL";
  categoryId: string | "ALL";
  location: string | "ALL";
}
