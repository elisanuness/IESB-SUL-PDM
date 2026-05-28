/**
 * ─────────────────────────────────────────────────────────────
 *  Gestão Financeira · Elisa Nunes de Freitas
 *  AppModal.jsx — Hook de modal reutilizável com tema escuro.
 *  Substitui Alert.alert() por uma UI consistente com o design
 *  do app, suportando alertas simples e confirmações destrutivas.
 * ─────────────────────────────────────────────────────────────
 *
 *  useAppModal() → { showAlert, showConfirm, ModalComponent }
 *
 *  showAlert(title, message)
 *  showConfirm(title, message, onConfirm, confirmText?, destructive?)
 *
 *  Inclua {ModalComponent} no JSX do componente que usar o hook.
 */

import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export function useAppModal() {
  const [config, setConfig] = useState(null);

  const showAlert = (title, message) =>
    setConfig({
      title,
      message,
      buttons: [{ text: "Fechar", variant: "primary", onPress: () => setConfig(null) }],
    });

  const showConfirm = (title, message, onConfirm, confirmText = "Confirmar", destructive = false) =>
    setConfig({
      title,
      message,
      buttons: [
        { text: "Cancelar", variant: "cancel", onPress: () => setConfig(null) },
        {
          text: confirmText,
          variant: destructive ? "destructive" : "primary",
          onPress: () => { setConfig(null); onConfirm(); },
        },
      ],
    });

  // JSX armazenado em variável para ser renderizado inline pelo componente consumidor
  const ModalComponent = config ? (
    <Modal visible transparent animationType="fade" onRequestClose={() => setConfig(null)}>
      <View style={s.overlay}>
        <View style={s.box}>
          {config.title   ? <Text style={s.title}>{config.title}</Text>    : null}
          {config.message ? <Text style={s.message}>{config.message}</Text> : null}
          <View style={s.btns}>
            {config.buttons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  s.btn,
                  btn.variant === "destructive" ? s.btnDanger
                  : btn.variant === "primary"   ? s.btnPrimary
                  : s.btnCancel,
                ]}
                onPress={btn.onPress}
                activeOpacity={0.8}
              >
                <Text style={[
                  s.btnText,
                  (btn.variant === "destructive" || btn.variant === "primary") && { color: "#FFF" },
                ]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  ) : null;

  return { showAlert, showConfirm, ModalComponent };
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    padding: 32,
  },
  box: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontWeight: "700",
    fontSize: 18,
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  btns: { flexDirection: "row", gap: 12, alignItems: "stretch" },
  btn: { flex: 1, minHeight: 48, paddingVertical: 13, paddingHorizontal: 8, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  btnCancel:  { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  btnPrimary: { backgroundColor: colors.primary },
  btnDanger:  { backgroundColor: colors.danger },
  btnText:    { fontWeight: "700", fontSize: 15, color: colors.text },
});
