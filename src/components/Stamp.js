import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Circle } from "lucide-react-native";
import { FONTS } from "../theme/fonts";

export default function Stamp({ meta, size = "md" }) {
  if (!meta) return null;
  const Icon = meta.icon || Circle;
  const small = size === "sm";
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: meta.bg,
          borderColor: meta.color + "55",
          paddingVertical: small ? 3 : 4,
          paddingHorizontal: small ? 8 : 10,
        },
      ]}
    >
      <Icon size={small ? 12 : 13} color={meta.color} strokeWidth={2.4} />
      <Text style={[styles.text, { color: meta.color, fontSize: small ? 10.5 : 11.5 }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 3,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: FONTS.mono,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
