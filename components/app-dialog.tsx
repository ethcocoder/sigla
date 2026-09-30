import { useEffect, useState, type ReactNode } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { Radii, Spacing, Typography } from "@/lib/_core/theme";
import {
  registerAppDialogPresenter,
  type AppDialogAction,
  type AppDialogOptions,
} from "@/lib/app-dialog";

export function AppDialogProvider({ children }: { children: ReactNode }) {
  const colors = useColors("light");
  const [dialog, setDialog] = useState<{
    options: AppDialogOptions;
    resolve?: (value: boolean) => void;
  } | null>(null);

  useEffect(
    () =>
      registerAppDialogPresenter((options, resolve) => {
        setDialog({ options, resolve });
      }),
    [],
  );

  const close = (result = false) => {
    const current = dialog;
    setDialog(null);
    current?.resolve?.(result);
  };
  const actions = dialog?.options.actions?.length
    ? dialog.options.actions
    : [{ label: "Close", variant: "primary" as const }];

  return (
    <>
      {children}
      <Modal
        transparent
        visible={Boolean(dialog)}
        animationType="fade"
        onRequestClose={() => close(false)}
      >
        <View style={styles.backdrop}>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[styles.icon, { backgroundColor: colors.primarySoft }]}
            >
              <Text style={[styles.iconText, { color: colors.primaryDark }]}>i</Text>
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {dialog?.options.title}
            </Text>
            <Text style={[styles.message, { color: colors.muted }]}>
              {dialog?.options.message}
            </Text>
            <View style={styles.actions}>
              {actions.map((action) => (
                <DialogButton
                  key={action.label}
                  action={action}
                  colors={colors}
                  onPress={() => {
                    close(action.variant !== "outline");
                    void action.onPress?.();
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function DialogButton({
  action,
  colors,
  onPress,
}: {
  action: AppDialogAction;
  colors: ReturnType<typeof useColors>;
  onPress: () => void;
}) {
  const destructive = action.variant === "destructive";
  const outline = action.variant === "outline";
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: outline ? colors.surface : destructive ? "#FEF2F2" : colors.primary,
          borderColor: outline ? colors.border : destructive ? "#FECACA" : colors.primary,
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonLabel,
          {
            color: outline
              ? colors.foreground
              : destructive
                ? colors.error
                : colors.white,
          },
        ]}
      >
        {action.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
  },
  card: {
    width: "100%",
    maxWidth: 430,
    borderWidth: 1,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  iconText: { fontSize: 24, fontWeight: "800" },
  title: { ...Typography.heading, fontSize: 22 },
  message: { ...Typography.body, lineHeight: 22, marginTop: Spacing.sm },
  actions: { gap: Spacing.sm, marginTop: Spacing.xl },
  button: {
    minHeight: 46,
    borderWidth: 1,
    borderRadius: Radii.pill,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  buttonLabel: { ...Typography.body, fontWeight: "800" },
});
