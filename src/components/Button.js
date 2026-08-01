import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/fonts";

const VARIANTS = {
  primary: { bg: COLORS.ink, fg: "#fff", border: "transparent" },
  teal: { bg: COLORS.teal, fg: "#fff", border: "transparent" },
  ghost: { bg: "transparent", fg: COLORS.ink, border: COLORS.line },
  danger: { bg: "#fff", fg: COLORS.rust, border: COLORS.rust + "55" },
};

export default function Button({ children, onPress, variant = "primary", icon: Icon, disabled, style }) {
  const v = VARIANTS[variant];
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {Icon && <Icon size={15} color={v.fg} strokeWidth={2.3} />}
      <Text style={[styles.label, { color: v.fg }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13.5,
  },
});
