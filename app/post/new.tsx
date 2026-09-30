import { Ionicons } from "@/components/ionicons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ActionButton } from "@/components/action-button";
import { StatusBadge } from "@/components/status-badge";
import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import { useTranslation } from "@/lib/i18n-provider";
import { getPlatformSettings } from "@/lib/backend/settings";
import { createDraftPost } from "@/lib/backend/marketplace";
import { uploadListingImage } from "@/lib/backend/storage";
import { firebaseAuth } from "@/lib/firebase";
import type { PostType } from "@/types/domain";

export default function NewPostScreen() {
  const colors = useColors("light");
  const { t } = useTranslation();
  const { type: rawType } = useLocalSearchParams<{ type?: string }>();
  const [type, setType] = useState<PostType>(rawType === "NEED" ? "NEED" : "HAVE");
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [postFee, setPostFee] = useState<number | null>(null);
  useEffect(() => { void getPlatformSettings().then((settings) => setPostFee(settings.postFee)).catch(() => setPostFee(null)); }, []);
  const canSubmit = useMemo(() => productName.trim().length >= 2 && Number(quantity) > 0 && unit.trim().length >= 1 && location.trim().length >= 2 && description.trim().length >= 10, [description, location, productName, quantity, unit]);

  const pickImage = async () => {
    setImageError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]?.uri) setImageUri(result.assets[0].uri);
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
      const imageUrls = imageUri ? [await uploadListingImage(imageUri, user.uid)] : [];
      await createDraftPost({ type, productName, description, quantity: Number(quantity), unit, locationLabel: location, imageUrls });
      setSubmitted(true);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Unable to save your listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <View style={[styles.successRoot, { backgroundColor: colors.background }]}><View style={[styles.successIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name="checkmark" size={34} color={colors.primaryDark} /></View><Text style={[styles.successTitle, { color: colors.foreground }]}>Draft ready for payment</Text><Text style={[styles.successBody, { color: colors.muted }]}>Your {type === "HAVE" ? "I HAVE" : "I NEED"} listing passed the local checks. The next step is to submit the {postFee == null ? "Loading…" : `${postFee.toLocaleString()} ETB`} posting payment for admin review.</Text><ActionButton label="Back to marketplace" onPress={() => router.replace("/(tabs)")} /></View>;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topbar}><Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.back}><Ionicons name="arrow-back" size={22} color={colors.foreground} /></Pressable><Text style={[styles.topbarTitle, { color: colors.foreground }]}>Create listing</Text><View style={{ width: 42 }} /></View>
        <Text style={[styles.title, { color: colors.foreground }]}>{t("create.title")}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>{t("create.subtitle")}</Text>
        <View style={styles.typeRow}><Pressable onPress={() => setType("HAVE")} style={[styles.typeButton, { borderColor: type === "HAVE" ? colors.primary : colors.border, backgroundColor: type === "HAVE" ? colors.primarySoft : colors.surface }]}><StatusBadge kind="postType" type="HAVE" /></Pressable><Pressable onPress={() => setType("NEED")} style={[styles.typeButton, { borderColor: type === "NEED" ? colors.secondary : colors.border, backgroundColor: type === "NEED" ? colors.secondarySoft : colors.surface }]}><StatusBadge kind="postType" type="NEED" /></Pressable></View>
        <Field label="Product or item" value={productName} onChangeText={setProductName} placeholder="e.g. Urea fertilizer" colors={colors} />
        <View style={styles.row}><View style={styles.half}><Field label="Quantity" value={quantity} onChangeText={setQuantity} placeholder="100" keyboardType="numeric" colors={colors} /></View><View style={styles.half}><Field label="Unit" value={unit} onChangeText={setUnit} placeholder="bags" colors={colors} /></View></View>
        <Field label="Location" value={location} onChangeText={setLocation} placeholder="Addis Ababa" colors={colors} />
        <Field label="Description" value={description} onChangeText={setDescription} placeholder="Tell the community more about this listing" multiline colors={colors} />
        <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>Listing image <Text style={{ color: colors.muted, fontWeight: "400" }}>(optional)</Text></Text>{imageUri ? <View style={styles.imagePreviewWrap}><Image source={{ uri: imageUri }} contentFit="cover" style={styles.imagePreview} /><View style={styles.imageActions}><Pressable onPress={() => void pickImage()} accessibilityRole="button" style={[styles.imageAction, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name="refresh-outline" size={16} color={colors.foreground} /><Text style={[styles.imageActionText, { color: colors.foreground }]}>Replace</Text></Pressable><Pressable onPress={() => setImageUri(null)} accessibilityRole="button" style={[styles.imageAction, { backgroundColor: colors.surface, borderColor: colors.border }]}><Ionicons name="trash-outline" size={16} color={colors.error} /><Text style={[styles.imageActionText, { color: colors.error }]}>Remove</Text></Pressable></View></View> : <Pressable onPress={() => void pickImage()} accessibilityRole="button" accessibilityLabel="Add listing image" style={[styles.uploadBox, { backgroundColor: colors.surface, borderColor: colors.border }]}><View style={[styles.uploadIcon, { backgroundColor: colors.primarySoft }]}><Ionicons name="image-outline" size={24} color={colors.primaryDark} /></View><View style={styles.uploadCopy}><Text style={[styles.uploadTitle, { color: colors.foreground }]}>Add a photo</Text><Text style={[styles.uploadBody, { color: colors.muted }]}>Show the product or item clearly</Text></View><Ionicons name="chevron-forward" size={18} color={colors.muted} /></Pressable>}{imageError ? <Text style={[styles.imageError, { color: colors.error }]}>{imageError}</Text> : null}</View>
        <View style={[styles.feeNote, { backgroundColor: colors.secondarySoft }]}><Ionicons name="information-circle-outline" size={20} color={colors.secondaryDark} /><Text style={[styles.feeText, { color: colors.secondaryDark }]}>Posting fee: {postFee == null ? "Loading…" : `${postFee.toLocaleString()} ETB`} · Your post will be reviewed before publishing.</Text></View>
        {formError ? <Text style={[styles.formError, { color: colors.error }]}>{formError}</Text> : null}
        <ActionButton label={submitting ? "Saving…" : "Review listing"} disabled={!canSubmit || submitting} style={({ pressed }) => [(!canSubmit || submitting) && { opacity: 0.45 }, pressed && { opacity: 0.8 }]} onPress={() => void submit()} />
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, colors }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: "numeric"; colors: ReturnType<typeof useColors> }) {
  return <View style={styles.field}><Text style={[styles.label, { color: colors.foreground }]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} keyboardType={keyboardType} multiline={multiline} style={[styles.input, multiline && styles.multiline, { color: colors.foreground, backgroundColor: colors.surface, borderColor: colors.border }]} /></View>;
}

const styles = StyleSheet.create({ root: { flex: 1 }, content: { paddingHorizontal: Spacing.page, paddingBottom: 36, maxWidth: 720, width: "100%", alignSelf: "center" }, topbar: { height: 76, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, back: { width: 42, height: 42, borderRadius: 21, justifyContent: "center" }, topbarTitle: { ...Typography.heading }, title: { ...Typography.title, marginTop: Spacing.xl }, subtitle: { ...Typography.body, marginTop: Spacing.sm, marginBottom: Spacing.xl }, typeRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.lg }, typeButton: { flex: 1, borderWidth: 1, borderRadius: Radii.md, padding: Spacing.md, alignItems: "center" }, field: { marginBottom: Spacing.lg }, row: { flexDirection: "row", gap: Spacing.md }, half: { flex: 1 }, label: { ...Typography.caption, fontWeight: "700", marginBottom: Spacing.sm }, input: { minHeight: 50, borderWidth: 1, borderRadius: Radii.md, paddingHorizontal: Spacing.md, paddingVertical: 12, ...Typography.body }, multiline: { minHeight: 116, textAlignVertical: "top" }, uploadBox: { minHeight: 82, borderWidth: 1, borderRadius: Radii.md, borderStyle: "dashed", padding: Spacing.md, flexDirection: "row", alignItems: "center", gap: Spacing.md }, uploadIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" }, uploadCopy: { flex: 1 }, uploadTitle: { ...Typography.body, fontWeight: "700" }, uploadBody: { ...Typography.caption, marginTop: 2 }, imagePreviewWrap: { borderRadius: Radii.md, overflow: "hidden", backgroundColor: "#E2E8F0" }, imagePreview: { width: "100%", height: 190 }, imageActions: { flexDirection: "row", gap: Spacing.sm, padding: Spacing.sm }, imageAction: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 38, paddingHorizontal: Spacing.md, borderRadius: Radii.pill, borderWidth: 1, flex: 1 }, imageActionText: { ...Typography.caption, fontWeight: "700" }, imageError: { ...Typography.caption, marginTop: Spacing.sm }, formError: { ...Typography.caption, lineHeight: 18, marginBottom: Spacing.md }, feeNote: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, padding: Spacing.md, borderRadius: Radii.md, marginBottom: Spacing.xl }, feeText: { ...Typography.caption, flex: 1, lineHeight: 18 }, successRoot: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xxl, gap: Spacing.md }, successIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center" }, successTitle: { ...Typography.title, textAlign: "center" }, successBody: { ...Typography.body, textAlign: "center", lineHeight: 23, marginBottom: Spacing.md },
});
