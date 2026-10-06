import { Ionicons } from "@/components/ionicons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ActionButton } from "@/components/action-button";
import { StatusBadge } from "@/components/status-badge";
import { useColors } from "@/hooks/use-colors";
import { useFirebaseAuth } from "@/hooks/use-firebase-auth";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { useTranslation } from "@/lib/i18n-provider";
import { DEFAULT_CATEGORIES, categoryLabel } from "@/lib/categories";
import { getPlatformSettings } from "@/lib/backend/settings";
import {
  createDraftPost,
  getPostById,
  markPostPaymentPending,
  publishAdminPost,
  updateDraftPost,
} from "@/lib/backend/marketplace";
import { submitPostPayment } from "@/lib/backend/payments";
import { getCurrentProfile } from "@/lib/backend/profile";
import { uploadListingImage } from "@/lib/backend/storage";
import { firebaseAuth } from "@/lib/firebase";
import type { MarketplaceSettings, PostType } from "@/types/domain";

export default function NewPostScreen() {
  const colors = useColors("light");
  const { language, t } = useTranslation();
  const { isAdmin, profile } = useFirebaseAuth();
  const { type: rawType, id } = useLocalSearchParams<{
    type?: string;
    id?: string;
  }>();
  const editing = Boolean(id);
  const [type, setType] = useState<PostType>(
    rawType === "NEED" ? "NEED" : "HAVE",
  );
  const [categoryId, setCategoryId] = useState("other");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [telegram, setTelegram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [transactionReference, setTransactionReference] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [settings, setSettings] = useState<MarketplaceSettings | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(editing);
  const categories = (settings?.categories ?? DEFAULT_CATEGORIES).filter((item) => item.active || item.id === categoryId);
  const selectedCategory = categories.find((item) => item.id === categoryId) ?? categories[0] ?? DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
  useEffect(() => {
    void getPlatformSettings()
      .then(setSettings)
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    if (!id) return;
    void getPostById(id)
      .then((post) => {
        if (!post || post.poster.id !== firebaseAuth.currentUser?.uid)
          throw new Error("This listing does not belong to your account.");
        setType(post.type);
        setCategoryId(post.categoryId || "other");
        setProductName(post.productName);
        setQuantity(String(post.quantity));
        setUnit(post.unit);
        setLocation(post.locationLabel);
        setDescription(post.description);
        setContactPhone(post.contactInfo.phone);
        setWhatsapp(post.contactInfo.whatsapp ?? "");
        setTelegram(post.contactInfo.telegram ?? "");
        setFacebook(post.contactInfo.facebook ?? "");
        setInstagram(post.contactInfo.instagram ?? "");
        setImageUrl(/^https?:\/\//i.test(post.imageUrl) ? post.imageUrl : "");
        setImageUri(post.imageUrl || null);
      })
      .catch((cause) =>
        setFormError(
          cause instanceof Error
            ? cause.message
            : "Unable to load this listing.",
        ),
      )
      .finally(() => setLoadingEdit(false));
  }, [id]);
  const canSubmit = useMemo(
    () =>
      productName.trim().length >= 2 &&
      Number(quantity) > 0 &&
      unit.trim().length >= 1 &&
      location.trim().length >= 2 &&
      description.trim().length >= 10 &&
      contactPhone.trim().length >= 7 &&
      (isAdmin || transactionReference.trim().length >= 4),
    [
      contactPhone,
      description,
      isAdmin,
      location,
      productName,
      quantity,
      transactionReference,
      unit,
    ],
  );
  const pickImage = async () => {
    setImageError(null);
    setImageUrl("");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.6,
      });
      if (!result.canceled && result.assets[0]?.uri)
        setImageUri(result.assets[0].uri);
    } catch {
      setImageError("We could not open your photo library. Please try again.");
    }
  };
  const submit = async () => {
    setSubmitting(true);
    setFormError(null);
    try {
      const user = firebaseAuth.currentUser;
      if (!user) throw new Error("Please sign in before creating a listing.");
      const profile = await getCurrentProfile(user.uid);
      const typedImageUrl = imageUrl.trim();
      if (typedImageUrl && !/^https?:\/\//i.test(typedImageUrl)) {
        throw new Error("Enter a valid image URL starting with http:// or https://.");
      }
      const imageSource = typedImageUrl || imageUri;
      const imageUrls =
        imageSource && !/^https?:\/\//i.test(imageSource)
          ? [await uploadListingImage(imageSource, user.uid)]
          : imageSource
            ? [imageSource]
            : [];
      const input = {
        type,
        categoryId: selectedCategory.id,
        categoryLabel: categoryLabel(selectedCategory, language),
        productName,
        description,
        contactInfo: {
          phone: contactPhone.trim(),
          whatsapp: whatsapp.trim() || undefined,
          telegram: telegram.trim() || undefined,
          facebook: facebook.trim() || undefined,
          instagram: instagram.trim() || undefined,
        },
        quantity: Number(quantity),
        unit,
        locationLabel: location,
        imageUrls,
      };
      const postId = id || (await createDraftPost(input));
      if (id) await updateDraftPost(id, input);
      if (isAdmin) {
        await publishAdminPost(postId, user.uid);
      } else {
        await submitPostPayment({
          postId,
          amount: settings?.postFee ?? 0,
          senderPhone: profile?.phone || user.phoneNumber || "",
          transactionReference,
          accountHolderName:
            settings?.telebirrAccountName || "SIGLA administrator",
        });
        await markPostPaymentPending(postId);
      }
      setSubmitted(true);
    } catch (cause) {
      setFormError(
        cause instanceof Error
          ? cause.message
          : "Unable to submit your listing. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };
  if (loadingEdit)
    return (
      <View
        style={[styles.successRoot, { backgroundColor: colors.background }]}
      >
        <Text style={{ color: colors.muted }}>Loading listing…</Text>
      </View>
    );
  if (submitted)
    return (
      <View
        style={[styles.successRoot, { backgroundColor: colors.background }]}
      >
        <View
          style={[styles.successIcon, { backgroundColor: colors.primarySoft }]}
        >
          <Ionicons name="checkmark" size={34} color={colors.primaryDark} />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>
          {isAdmin ? "Listing published" : "Payment submitted"}
        </Text>
        <Text style={[styles.successBody, { color: colors.muted }]}>
          {isAdmin
            ? "Your administrator listing is now live in the marketplace."
            : "Your listing and Telebirr transaction number were sent for administrator verification. After payment verification, it will move to listing review."}
        </Text>
        <ActionButton
          label="Open my posts"
          onPress={() => router.replace("/(tabs)/my-posts" as never)}
        />
      </View>
    );
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topbar}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.topbarTitle, { color: colors.foreground }]}>
            {editing ? "Edit listing" : "Create listing"}
          </Text>
          <View style={{ width: 42 }} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {t("create.title")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {editing
            ? "Update your listing and submit a new payment for review."
            : t("create.subtitle")}
        </Text>
        <View style={styles.typeRow}>
          <Pressable
            onPress={() => setType("HAVE")}
            style={[
              styles.typeButton,
              {
                borderColor: type === "HAVE" ? colors.primary : colors.border,
                backgroundColor:
                  type === "HAVE" ? colors.primarySoft : colors.surface,
              },
            ]}
          >
            <StatusBadge kind="postType" type="HAVE" />
          </Pressable>
          <Pressable
            onPress={() => setType("NEED")}
            style={[
              styles.typeButton,
              {
                borderColor: type === "NEED" ? colors.secondary : colors.border,
                backgroundColor:
                  type === "NEED" ? colors.secondarySoft : colors.surface,
              },
            ]}
          >
            <StatusBadge kind="postType" type="NEED" />
          </Pressable>
        </View>
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>{t("common.category")}</Text>
          <Text style={[styles.helper, { color: colors.muted }]}>{t("category.helper")}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("category.choose")}
            onPress={() => setCategoryOpen(true)}
            style={[styles.categoryPicker, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.categoryPickerIcon, { backgroundColor: selectedCategory.color }]}>
              <Ionicons name={selectedCategory.icon as keyof typeof Ionicons.glyphMap} size={20} color="#FFFFFF" />
            </View>
            <View style={styles.categoryPickerCopy}>
              <Text style={[styles.categoryPickerTitle, { color: colors.foreground }]}>{categoryLabel(selectedCategory, language)}</Text>
              <Text style={[styles.categoryPickerMeta, { color: colors.muted }]}>{selectedCategory.labelEn} · {selectedCategory.labelAm}</Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.muted} />
          </Pressable>
        </View>
        <Modal visible={categoryOpen} transparent animationType="slide" onRequestClose={() => setCategoryOpen(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setCategoryOpen(false)}>
            <Pressable style={[styles.categorySheet, { backgroundColor: colors.surface }]} onPress={(event) => event.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <Text style={[styles.sheetTitle, { color: colors.foreground }]}>{t("category.choose")}</Text>
              <Text style={[styles.sheetHelper, { color: colors.muted }]}>{t("category.helper")}</Text>
              {categories.map((category) => (
                <Pressable key={category.id} onPress={() => { setCategoryId(category.id); setCategoryOpen(false); }} style={[styles.categoryOption, { borderColor: colors.border }]}>
                  <View style={[styles.categoryPickerIcon, { backgroundColor: category.color }]}>
                    <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={19} color="#FFFFFF" />
                  </View>
                  <View style={styles.categoryPickerCopy}>
                    <Text style={[styles.categoryPickerTitle, { color: colors.foreground }]}>{categoryLabel(category, language)}</Text>
                    <Text style={[styles.categoryPickerMeta, { color: colors.muted }]}>{category.labelEn} · {category.labelAm}</Text>
                  </View>
                  {category.id === categoryId ? <Ionicons name="checkmark-circle" size={22} color={colors.primary} /> : null}
                </Pressable>
              ))}
              <ActionButton label={t("common.cancel")} variant="outline" onPress={() => setCategoryOpen(false)} />
            </Pressable>
          </Pressable>
        </Modal>
        <Field
          label="Product or item"
          value={productName}
          onChangeText={setProductName}
          placeholder="e.g. Urea fertilizer"
          colors={colors}
        />
        <View style={styles.row}>
          <View style={styles.half}>
            <Field
              label="Quantity"
              value={quantity}
              onChangeText={setQuantity}
              placeholder="100"
              keyboardType="numeric"
              colors={colors}
            />
          </View>
          <View style={styles.half}>
            <Field
              label="Unit"
              value={unit}
              onChangeText={setUnit}
              placeholder="bags"
              colors={colors}
            />
          </View>
        </View>
        <Field
          label="Location"
          value={location}
          onChangeText={setLocation}
          placeholder="Addis Ababa"
          colors={colors}
        />
        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Tell the community more about this listing"
          multiline
          colors={colors}
        />
        <Text style={[styles.helper, { color: colors.muted }]}>
          Description must be at least 10 characters.
        </Text>
        <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
          Contact details
        </Text>
        <Text style={[styles.helper, { color: colors.muted }]}>
          Mobile phone is required. Social media contacts are optional and shown
          when buyers tap Contact.
        </Text>
        <Field
          label="Mobile phone (required)"
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="e.g. 0912345678"
          keyboardType="phone-pad"
          colors={colors}
        />
        <Field
          label="WhatsApp (optional)"
          value={whatsapp}
          onChangeText={setWhatsapp}
          placeholder="Phone or WhatsApp number"
          keyboardType="phone-pad"
          colors={colors}
        />
        <Field
          label="Telegram (optional)"
          value={telegram}
          onChangeText={setTelegram}
          placeholder="@username or Telegram link"
          colors={colors}
        />
        <Field
          label="Facebook (optional)"
          value={facebook}
          onChangeText={setFacebook}
          placeholder="Profile link"
          colors={colors}
        />
        <Field
          label="Instagram (optional)"
          value={instagram}
          onChangeText={setInstagram}
          placeholder="@username or profile link"
          colors={colors}
        />
        <Field
          label="Image URL (optional)"
          value={imageUrl}
          onChangeText={(value) => {
            setImageUrl(value);
            if (/^https?:\/\//i.test(value.trim())) {
              setImageUri(value.trim());
              setImageError(null);
            }
          }}
          placeholder="https://example.com/image.jpg"
          colors={colors}
        />
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            Listing image{" "}
            <Text style={{ color: colors.muted, fontWeight: "400" }}>
              (optional)
            </Text>
          </Text>
          {imageUri ? (
            <View style={styles.imagePreviewWrap}>
              <Image
                source={{ uri: imageUri }}
                contentFit="cover"
                style={styles.imagePreview}
              />
              <View style={styles.imageActions}>
                <Pressable
                  onPress={() => void pickImage()}
                  style={[
                    styles.imageAction,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.imageActionText,
                      { color: colors.foreground },
                    ]}
                  >
                    Replace
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setImageUri(null);
                    setImageUrl("");
                  }}
                  style={[
                    styles.imageAction,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[styles.imageActionText, { color: colors.error }]}
                  >
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              onPress={() => void pickImage()}
              style={[
                styles.uploadBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="image-outline"
                size={24}
                color={colors.primaryDark}
              />
              <Text style={[styles.uploadTitle, { color: colors.foreground }]}>
                Add a photo
              </Text>
            </Pressable>
          )}
          {imageError ? (
            <Text style={[styles.imageError, { color: colors.error }]}>
              {imageError}
            </Text>
          ) : null}
        </View>
        {!isAdmin ? (
          <View
            style={[
              styles.paymentBox,
              { backgroundColor: colors.secondarySoft },
            ]}
          >
            <Ionicons
              name="card-outline"
              size={22}
              color={colors.secondaryDark}
            />
            <View style={styles.paymentCopy}>
              <Text
                style={[styles.paymentTitle, { color: colors.secondaryDark }]}
              >
                Telebirr payment
              </Text>
              <Text
                style={[styles.paymentBody, { color: colors.secondaryDark }]}
              >
                Send {settings?.postFee?.toLocaleString() ?? "…"} ETB to the
                administrator before submitting.
              </Text>
              <Text
                style={[styles.paymentValue, { color: colors.secondaryDark }]}
              >
                Mobile: {settings?.telebirrNumber || "Not configured yet"}
              </Text>
              <Text
                style={[styles.paymentValue, { color: colors.secondaryDark }]}
              >
                Account holder:{" "}
                {settings?.telebirrAccountName || "Not configured yet"}
              </Text>
            </View>
          </View>
        ) : null}
        {!isAdmin ? (
          <Field
            label="Telebirr transaction number"
            value={transactionReference}
            onChangeText={setTransactionReference}
            placeholder="e.g. FT123456789"
            autoCapitalize="characters"
            colors={colors}
          />
        ) : null}
        {formError ? (
          <Text style={[styles.formError, { color: colors.error }]}>
            {formError}
          </Text>
        ) : null}
        <ActionButton
          label={
            submitting
              ? "Submitting…"
              : isAdmin
                ? "Publish listing"
                : editing
                  ? "Save & submit for approval"
                  : "Submit listing for approval"
          }
          disabled={!canSubmit || submitting}
          style={({ pressed }) => [
            (!canSubmit || submitting) && { opacity: 0.45 },
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => void submit()}
        />
      </ScrollView>
    </View>
  );
}
function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize,
  colors,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: "numeric" | "phone-pad";
  autoCapitalize?: "characters";
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.multiline,
          {
            color: colors.foreground,
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.page,
    paddingBottom: 36,
    maxWidth: 720,
    width: "100%",
    alignSelf: "center",
  },
  topbar: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { width: 42, height: 42, borderRadius: 21, justifyContent: "center" },
  topbarTitle: { ...Typography.heading },
  title: { ...Typography.title, marginTop: Spacing.xl },
  subtitle: {
    ...Typography.body,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  typeRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.lg },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radii.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  categoryPicker: { minHeight: 64, borderWidth: 1, borderRadius: Radii.md, padding: Spacing.sm, flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  categoryPickerIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  categoryPickerCopy: { flex: 1 },
  categoryPickerTitle: { ...Typography.body, fontWeight: "800" },
  categoryPickerMeta: { ...Typography.caption, marginTop: 2 },
  modalBackdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(15, 23, 42, 0.48)" },
  categorySheet: { borderTopLeftRadius: Radii.lg, borderTopRightRadius: Radii.lg, padding: Spacing.xl, paddingBottom: 30, gap: Spacing.sm },
  sheetHandle: { alignSelf: "center", width: 42, height: 5, borderRadius: 5, backgroundColor: "#CBD5E1", marginBottom: Spacing.sm },
  sheetTitle: { ...Typography.heading, fontSize: 22 },
  sheetHelper: { ...Typography.caption, lineHeight: 18, marginBottom: Spacing.sm },
  categoryOption: { minHeight: 58, borderWidth: 1, borderRadius: Radii.md, padding: Spacing.sm, flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  field: { marginBottom: Spacing.lg },
  row: { flexDirection: "row", gap: Spacing.md },
  half: { flex: 1 },
  label: { ...Typography.caption, fontWeight: "700", marginBottom: Spacing.sm },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    ...Typography.body,
  },
  multiline: { minHeight: 116, textAlignVertical: "top" },
  uploadBox: {
    minHeight: 82,
    borderWidth: 1,
    borderRadius: Radii.md,
    borderStyle: "dashed",
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  uploadTitle: { ...Typography.body, fontWeight: "700" },
  imagePreviewWrap: {
    borderRadius: Radii.md,
    overflow: "hidden",
    backgroundColor: "#E2E8F0",
  },
  imagePreview: { width: "100%", height: 190 },
  imageActions: { flexDirection: "row", gap: Spacing.sm, padding: Spacing.sm },
  imageAction: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 38,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  imageActionText: { ...Typography.caption, fontWeight: "700" },
  imageError: { ...Typography.caption, marginTop: Spacing.sm },
  paymentBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  paymentCopy: { flex: 1 },
  paymentTitle: { ...Typography.heading, fontSize: 16 },
  paymentBody: { ...Typography.caption, lineHeight: 18, marginTop: 5 },
  paymentValue: { ...Typography.body, fontWeight: "700", marginTop: 8 },
  helper: {
    ...Typography.caption,
    lineHeight: 18,
    marginTop: -Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    ...Typography.heading,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  formError: {
    ...Typography.caption,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  successRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: { ...Typography.title, textAlign: "center" },
  successBody: {
    ...Typography.body,
    textAlign: "center",
    lineHeight: 23,
    marginBottom: Spacing.md,
  },
});
