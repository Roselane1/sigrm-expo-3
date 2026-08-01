import React from "react";
import { View, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { COLORS } from "../theme/colors";

// options: [{ value, label }]
export default function Select({ value, onValueChange, options, style }) {
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
