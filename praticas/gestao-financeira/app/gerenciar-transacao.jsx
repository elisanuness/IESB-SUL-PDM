// ─────────────────────────────────────────────────────────────────────────────
// Autora: Elisa Nunes de Freitas
// Arquivo: app/gerenciar-transacao.jsx
// Descrição: Formulário de criação e edição de transação. Recebe `transactionId`
//            via parâmetro de rota para ativar o modo de edição; sem parâmetro,
//            opera como criação. Usa DateTimePicker nativo para seleção de data.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo, useRef, useContext } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Platform, KeyboardAvoidingView, ScrollView, ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { MoneyContext } from "../contexts/GlobalState";
import { colors } from "../constants/colors";
import { useAppModal } from "../components/AppModal";

export default function GerenciarTransacao() {
  const router  = useRouter();
  const { transactionId } = useLocalSearchParams();
  const { transactions, categories, addTransaction, editTransaction } = useContext(MoneyContext);
  const { showAlert, ModalComponent } = useAppModal();

  const transaction = transactionId ? transactions.find(t => t.id === transactionId) : null;
  const isEditing   = !!transaction;

  const [description,     setDescription]     = useState(isEditing ? transaction.description : "");
  const [value,           setValue]            = useState(isEditing ? String(Number(transaction.value)).replace(".", ",") : "");
  const [transactionType, setTransactionType]  = useState(isEditing ? (transaction.category.isIncome ? "income" : "expense") : "expense");
  const [categoryId,      setCategoryId]       = useState(isEditing ? transaction.category.id : null);
  // Strings YYYY-MM-DD recebem T12:00:00 para evitar deslocamento de fuso horário.
  const [date,            setDate]             = useState(() => {
    if (isEditing) {
      const raw = transaction.date;
      return typeof raw === "string" ? new Date(raw.length === 10 ? `${raw}T12:00:00` : raw) : new Date(raw);
    }
    return new Date();
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving,       setIsSaving]       = useState(false);
  const scrollRef = useRef(null);

  const filteredCategories = useMemo(
    () => categories.filter(c => transactionType === "income" ? c.isIncome : !c.isIncome),
    [categories, transactionType]
  );

  // Pré-seleciona a primeira categoria disponível ao trocar o tipo de transação.
  useEffect(() => {
    if (!isEditing && filteredCategories.length > 0 && !categoryId) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories]);

  const handleTypeChange = (type) => {
    setTransactionType(type);
    const newFiltered = categories.filter(c => type === "income" ? c.isIncome : !c.isIncome);
    setCategoryId(newFiltered.length > 0 ? newFiltered[0].id : null);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  };

  const handleSave = async () => {
    if (!description.trim() || !value.trim()) {
      showAlert("Atenção", "Preencha a descrição e o valor!");
      return;
    }
    if (!categoryId) {
      showAlert("Atenção", "Selecione uma categoria!");
      return;
    }
    const numericValue = parseFloat(value.replace(",", "."));
    if (isNaN(numericValue) || numericValue <= 0) {
      showAlert("Atenção", "Introduza um valor numérico positivo válido!");
      return;
    }

    const ano      = date.getFullYear();
    const mes      = String(date.getMonth() + 1).padStart(2, "0");
    const dia      = String(date.getDate()).padStart(2, "0");
    const dateLocal = `${ano}-${mes}-${dia}`;

    const payload = { description: description.trim(), value: numericValue, date: dateLocal, categoryId };

    setIsSaving(true);
    try {
      if (isEditing) await editTransaction(transaction.id, payload);
      else           await addTransaction(payload);
      router.back();
    } catch (e) {
      showAlert("Erro", e.message || "Não foi possível salvar a transação.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Text style={styles.headerTitle}>{isEditing ? "Editar Transação" : "Nova Transação"}</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>

        <View style={styles.typeSelector}>
          <TouchableOpacity style={[styles.typeBtn, transactionType === "income" && styles.typeBtnIncome]} onPress={() => handleTypeChange("income")} activeOpacity={0.7}>
            <MaterialIcons name="add-circle-outline" size={22} color={transactionType === "income" ? "#FFF" : colors.textSecondary} />
            <Text style={[styles.typeBtnText, transactionType === "income" && { color: "#FFF" }]}>Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, transactionType === "expense" && styles.typeBtnExpense]} onPress={() => handleTypeChange("expense")} activeOpacity={0.7}>
            <MaterialIcons name="remove-circle-outline" size={22} color={transactionType === "expense" ? "#FFF" : colors.textSecondary} />
            <Text style={[styles.typeBtnText, transactionType === "expense" && { color: "#FFF" }]}>Despesa</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput style={styles.input} placeholder="Ex: Conta da Luz" placeholderTextColor={colors.textSecondary} value={description} onChangeText={setDescription} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput style={styles.input} placeholder="0,00" placeholderTextColor={colors.textSecondary} keyboardType="decimal-pad" value={value} onChangeText={setValue} />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.catHeaderRow}>
            <Text style={styles.label}>Categoria</Text>
            {filteredCategories.length > 4 && <Text style={styles.scrollHint}>Deslize ➔</Text>}
          </View>
          {filteredCategories.length === 0 ? (
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontStyle: "italic", marginTop: 8 }}>
              Nenhuma categoria disponível para este tipo.
            </Text>
          ) : (
            <ScrollView ref={scrollRef} horizontal showsHorizontalScrollIndicator contentContainerStyle={styles.catsList}>
              {filteredCategories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.catBox, categoryId === cat.id && styles.catBoxSelected]}
                  onPress={() => setCategoryId(cat.id)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name={cat.icon} size={24} color={categoryId === cat.id ? colors.primary : colors.textSecondary} />
                  <Text style={[styles.catLabel, categoryId === cat.id && styles.catLabelSelected]}>{cat.displayName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data</Text>
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
            <Text style={styles.dateButtonText}>{date.toLocaleDateString("pt-BR")}</Text>
            <MaterialIcons name="calendar-today" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(e, d) => { setShowDatePicker(Platform.OS === "ios"); if (d) setDate(d); }}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={isSaving}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar</Text>}
        </TouchableOpacity>
      </View>

      {ModalComponent}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24 },
  headerTitle: { fontWeight: "700", fontSize: 24, color: colors.text, marginBottom: 24 },
  form: { gap: 20, paddingBottom: 24 },

  typeSelector: { flexDirection: "row", gap: 12 },
  typeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  typeBtnIncome: { backgroundColor: colors.success, borderColor: colors.success },
  typeBtnExpense: { backgroundColor: colors.danger, borderColor: colors.danger },
  typeBtnText: { fontWeight: "700", fontSize: 16, color: colors.textSecondary },

  inputGroup: { gap: 8 },
  label: { fontSize: 14, color: colors.textSecondary },
  input: { backgroundColor: colors.surface, color: colors.text, fontSize: 16, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border },

  catHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  scrollHint: { fontSize: 12, color: colors.textSecondary, fontStyle: "italic" },
  catsList: { gap: 12, paddingBottom: 8 },
  catBox: { width: 80, height: 80, backgroundColor: colors.surface, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, gap: 8 },
  catBoxSelected: { borderColor: colors.primary, backgroundColor: "rgba(130,87,229,0.1)" },
  catLabel: { fontSize: 10, color: colors.textSecondary, textAlign: "center" },
  catLabelSelected: { fontWeight: "700", color: colors.primary },

  dateButton: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  dateButtonText: { fontSize: 16, color: colors.text },

  footer: { flexDirection: "row", gap: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border },
  cancelButton: { flex: 1, padding: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface },
  cancelButtonText: { fontWeight: "700", color: colors.textSecondary, fontSize: 16 },
  saveButton: { flex: 1, padding: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  saveButtonText: { fontWeight: "700", color: "#FFF", fontSize: 16 },
});
