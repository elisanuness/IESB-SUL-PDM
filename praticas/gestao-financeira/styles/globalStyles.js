import { StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export const globalStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  input: {
    height: 48,
    paddingHorizontal: 16,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  line: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 8,
  },
  primaryText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "600",
  },
  secondaryText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  positiveText: {
    fontSize: 16,
    color: colors.positiveText,
    fontWeight: "700",
  },
  negativeText: {
    fontSize: 16,
    color: colors.negativeText,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
});
