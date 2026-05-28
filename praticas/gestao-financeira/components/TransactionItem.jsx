/**
 * ─────────────────────────────────────────────────────────────
 *  Gestão Financeira · Elisa Nunes de Freitas
 *  TransactionItem.jsx — Componente de item de transação.
 *  Exibe descrição, categoria, data e valor formatado,
 *  com ações opcionais de edição e exclusão.
 * ─────────────────────────────────────────────────────────────
 */

import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

export default function TransactionItem({ transaction, onEdit, onDelete, showValues }) {
  const numericValue = Number(transaction.value);
  const valueColor   = transaction.category?.isIncome ? colors.success : colors.danger;
  // Usa a cor da categoria; recorre a verde/vermelho caso ela não tenha background definido
  const iconBg       = transaction.category?.background || (transaction.category?.isIncome ? colors.success : colors.danger);
  const catNameColor = transaction.category?.isIncome ? colors.success : colors.danger;

  const raw     = transaction.date;
  // Strings com apenas a data (YYYY-MM-DD) recebem horário fixo para evitar
  // deslocamento de fuso ao converter para objeto Date
  const d       = typeof raw === "string" ? new Date(raw.length === 10 ? `${raw}T12:00:00` : raw) : new Date(raw);
  const dateStr = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;

  const formattedValue = `R$ ${numericValue.toFixed(2).replace(".", ",")}`;

  return (
    <View style={styles.container}>
      <View style={styles.leftSide}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <MaterialIcons name={transaction.category?.icon || "attach-money"} size={24} color="#FFF" />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.description}>{transaction.description}</Text>
          <Text style={[styles.categoryName, { color: catNameColor }]}>{transaction.category?.displayName}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
      </View>

      <View style={styles.rightSide}>
        <Text style={[styles.value, { color: valueColor }]}>
          {transaction.category?.isIncome ? "+" : "-"}
          {showValues !== false ? formattedValue : "•••••"}
        </Text>
        <View style={styles.actionsContainer}>
          {onEdit && (
            <TouchableOpacity onPress={() => onEdit(transaction)} style={styles.actionBox} activeOpacity={0.7}>
              <MaterialIcons name="edit" size={16} color="#FFF" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={() => onDelete(transaction)} style={[styles.actionBox, { backgroundColor: colors.danger }]} activeOpacity={0.7}>
              <MaterialIcons name="delete" size={16} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leftSide: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconContainer: { width: 48, height: 48, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 12 },
  infoContainer: { justifyContent: "center", flexShrink: 1 },
  description: { fontWeight: "700", fontSize: 16, color: colors.text, marginBottom: 2 },
  categoryName: { fontSize: 12, marginBottom: 4 },
  date: { fontSize: 12, color: colors.textSecondary },
  rightSide: { alignItems: "flex-end", justifyContent: "center", marginLeft: 12 },
  value: { fontWeight: "700", fontSize: 16, marginBottom: 10 },
  actionsContainer: { flexDirection: "row", gap: 8 },
  actionBox: { width: 32, height: 32, backgroundColor: colors.primary, borderRadius: 8, justifyContent: "center", alignItems: "center" },
});
