import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { COLORS } from "../theme/colors";

// options: [{ value, label }]
export default function Select({ value, onValueChange, options, style }) {
  if (Platform.OS === "web") {
    // No navegador usamos o <select> nativo do próprio HTML — mais simples
    // e mais confiável do que traduzir o Picker nativo pra web.
    return (
      <View style={[styles.wrap, style]}>
        {React.createElement(
          "select",
          {
            value,
            onChange: (e) => onValueChange(e.target.value),
            style: {
              width: "100%",
              height: 40,
              border: "none",
              background: "transparent",
              fontSize: 13,
              color: COLORS.ink,
              padding: "0 8px",
              outline: "none",
            },
          },
          options.map((opt) =>
            React.createElement("option", { key: opt.value, value: opt.value }, opt.label)
          )
        )}
      </View>
    );
  }

  // Nas plataformas nativas (Android/iOS), usa o seletor nativo de verdade.
  const { Picker } = require("@react-native-picker/picker");
  return (
    <View style={[styles.wrap, style]}>
      <Picker
        selectedValue={value}
        onValueChange={onValueChange}
        style={styles.picker}
        dropdownIconColor={COLORS.ink}
      >
        {options.map((opt) => (
          <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: COLORS.line,
    borderRadius: 7,
    backgroundColor: "#fff",
    overflow: "hidden",
    justifyContent: "center",
  },
  picker: {
    color: COLORS.ink,
    fontSize: 13,
    height: 40,
  },
});
