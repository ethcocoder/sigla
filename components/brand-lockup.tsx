import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  const colors = useColors("light");

  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="SIGLA ሲግላ">
      <View style={[styles.mark, { backgroundColor: colors.primarySoft }]}>
        <View style={[styles.leaf, styles.leafLeft, { backgroundColor: colors.primary }]} />
        <View style={[styles.leaf, styles.leafRight, { backgroundColor: colors.secondary }]} />
        <View style={[styles.stem, { backgroundColor: colors.primaryDark }]} />
      </View>
      <View>
        <Text style={[styles.wordmark, { color: colors.foreground }]}>SIGLA</Text>
        {!compact && <Text style={[styles.amharic, { color: colors.primaryDark }]}>ሲግላ</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  mark: {
    width: 38,
    height: 38,
    borderRadius: Radii.sm,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  leaf: { position: "absolute", width: 13, height: 23, borderRadius: 14, transform: [{ rotate: "35deg" }] },
  leafLeft: { left: 8, top: 7 },
  leafRight: { right: 8, top: 5, transform: [{ rotate: "-35deg" }] },
  stem: { position: "absolute", width: 3, height: 22, bottom: 3, borderRadius: 3, transform: [{ rotate: "8deg" }] },
  wordmark: { ...Typography.heading, letterSpacing: 1.4 },
  amharic: { ...Typography.caption, marginTop: -1 },
});
