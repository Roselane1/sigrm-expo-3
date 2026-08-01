import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/colors";
import { FONTS } from "../theme/fonts";

export function SectionTitle({ eyebrow, title, right }) {
  return (
    <View style={styles.sectionRow}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

export function EmptyState({ label }) {
  return (
    <View style={{ padding: 34, alignItems: "center" }}>
      <Text style={{ color: COLORS.muted, fontFamily: FONTS.body, fontSize: 13.5, textAlign: "center" }}>{label}</Text>
    </View>
  );
}

export function TextField({ value, onChangeText, placeholder, style, secureTextEntry, keyboardType, editable = true }) {
  const { TextInput } = require("react-native");
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9AA097"
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      editable={editable}
      style={[fieldStyles.input, style]}
    />
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  eyebrow: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: COLORS.muted,
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 21,
    color: COLORS.ink,
  },
  right: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});

const fieldStyles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 7,
    paddingVertical: 9,
    paddingHorizontal: 11,
    fontSize: 13.5,
    fontFamily: FONTS.body,
    color: COLORS.ink,
    backgroundColor: "#fff",
  },
});
