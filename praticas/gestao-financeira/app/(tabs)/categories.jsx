// ─────────────────────────────────────────────────────────────────────────────
// Autora: Elisa Nunes de Freitas
// Arquivo: app/(tabs)/categories.jsx
// Descrição: Tela Categorias — listagem, criação, edição e exclusão de categorias
//            personalizadas. A exclusão exige seleção de categoria destino para
//            transferência das transações vinculadas antes de confirmar.
// ─────────────────────────────────────────────────────────────────────────────

import { useContext, useState } from "react";
import {
  ActivityIndicator, FlatList, Image, Platform, StatusBar,
  StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MoneyContext } from "../../contexts/GlobalState";
import { colors } from "../../constants/colors";
import { useAppModal } from "../../components/AppModal";

const PRESET_COLORS = [
  "#C0392B", "#1A7F4B", "#2471A3", "#B7770D", "#7D3C98",
  "#117A65", "#D35400", "#1B4F72", "#6E2F0F", "#4A235A",
];
const MATERIAL_ICONS_PACK = [
  "payments","fastfood","directions-car","home","sports-esports",
  "flight","local-hospital","shopping-cart","restaurant","local-cafe",
  "fitness-center","movie","school","work","savings","pets",
  "child-care","wifi","sports-soccer","camera-alt",
];

export default function CategoriesScreen() {
  const { categories, loading, addCategory, editCategory, removeCategory } = useContext(MoneyContext);
  const { showAlert, ModalComponent } = useAppModal();

  const [view, setView]               = useState("list");
  const [catToEdit, setCatToEdit]     = useState(null);
  const [catToDelete, setCatToDelete] = useState(null);
  const [transferCatId, setTransferCatId] = useState(null);
  const [submitting, setSubmitting]   = useState(false);

  const [formName, setFormName]         = useState("");
  const [formDisplay, setFormDisplay]   = useState("");
  const [formIcon, setFormIcon]         = useState(MATERIAL_ICONS_PACK[0]);
  const [formBg, setFormBg]             = useState(PRESET_COLORS[0]);
  const [formIsIncome, setFormIsIncome] = useState(false);
  const [nameError, setNameError]       = useState("");
  const [displayError, setDisplayError] = useState("");

  const resetForm = () => {
    setFormName(""); setFormDisplay(""); setFormIcon(MATERIAL_ICONS_PACK[0]);
    setFormBg(PRESET_COLORS[0]); setFormIsIncome(false); setCatToEdit(null);
    setNameError(""); setDisplayError("");
  };

  const openCreate = () => {
    resetForm();
    // Seleciona o primeiro ícone não usado por nenhuma categoria existente
    const allUsedIcons = categories.map(c => c.icon);
    const firstAvailable = MATERIAL_ICONS_PACK.find(icon => !allUsedIcons.includes(icon));
    setFormIcon(firstAvailable ?? MATERIAL_ICONS_PACK[0]);
    setView("form");
  };
  const openEdit   = (cat) => {
    setCatToEdit(cat);
    setFormName(cat.name);
    setFormDisplay(cat.displayName);
    setFormIcon(cat.icon);
    setFormBg(cat.background);
    setFormIsIncome(cat.isIncome);
    setView("form");
  };
  const openDelete = (cat) => { setCatToDelete(cat); setTransferCatId(null); setView("transfer"); };

  // Icons already in use by other categories
  const usedIcons = categories
    .filter(c => catToEdit ? c.id !== catToEdit.id : true)
    .map(c => c.icon);

  const handleSave = async () => {
    let hasError = false;
    setNameError(""); setDisplayError("");

    if (!catToEdit) {
      if (!formName.trim()) {
        setNameError("Informe o identificador.");
        hasError = true;
      } else if (/\s/.test(formName)) {
        setNameError("Não pode conter espaços. Use underline: ex_emplo");
        hasError = true;
      }
    }
    if (!formDisplay.trim() || formDisplay.trim().length < 2) {
      setDisplayError("Nome de exibição deve ter pelo menos 2 letras.");
      hasError = true;
    }
    if (hasError) return;

    const payload = {
      name:        catToEdit ? catToEdit.name : formName.trim().toLowerCase(),
      displayName: formDisplay.trim(),
      icon:        formIcon,
      background:  formBg,
      isIncome:    formIsIncome,
    };
    setSubmitting(true);
    try {
      if (catToEdit) await editCategory(catToEdit.id, payload);
      else           await addCategory(payload);
      setView("list");
      resetForm();
    } catch (e) {
      showAlert("Erro", e.message || "Não foi possível salvar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!transferCatId) {
      showAlert("Atenção", "Selecione uma categoria para transferir as transações.");
      return;
    }
    setSubmitting(true);
    try {
      await removeCategory(catToDelete.id, transferCatId);
      setView("list");
      setCatToDelete(null);
    } catch (e) {
      showAlert("Erro", e.message || "Não foi possível excluir.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <View style={[styles.screen, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {ModalComponent}
      </View>
    );
  }

  if (view === "form") {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, gap: 16 }}>
        <Text style={styles.title}>{catToEdit ? "Editar Categoria" : "Nova Categoria"}</Text>

        <Text style={styles.label}>Tipo</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity style={[styles.typeBtn, !formIsIncome && styles.typeBtnExpense]} onPress={() => setFormIsIncome(false)}>
            <Text style={[styles.typeBtnText, !formIsIncome && { color: "#FFF", fontWeight: "700" }]}>Despesa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.typeBtn, formIsIncome && styles.typeBtnIncome]} onPress={() => setFormIsIncome(true)}>
            <Text style={[styles.typeBtnText, formIsIncome && { color: "#FFF", fontWeight: "700" }]}>Receita</Text>
          </TouchableOpacity>
        </View>

        {!catToEdit && (
          <View>
            <Text style={styles.label}>Identificador (sem espaços)</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              value={formName}
              onChangeText={(v) => { setFormName(v); if (nameError) setNameError(""); }}
              placeholder="ex.: saude"
              autoCapitalize="none"
              placeholderTextColor={colors.textSecondary}
            />
            {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}
          </View>
        )}

        <View>
          <Text style={styles.label}>Nome de Exibição</Text>
          <TextInput
            style={[styles.input, displayError ? styles.inputError : null]}
            value={formDisplay}
            onChangeText={(v) => { setFormDisplay(v); if (displayError) setDisplayError(""); }}
            placeholder="ex.: Saúde"
            placeholderTextColor={colors.textSecondary}
          />
          {displayError ? <Text style={styles.fieldError}>{displayError}</Text> : null}
        </View>

        <View>
          <Text style={styles.label}>Ícone</Text>
          <View style={styles.iconsGrid}>
            {MATERIAL_ICONS_PACK.map(icon => {
              const isUsed = usedIcons.includes(icon);
              return (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconBox, formIcon === icon && styles.iconBoxActive, isUsed && styles.iconBoxDisabled]}
                  onPress={() => !isUsed && setFormIcon(icon)}
                  disabled={isUsed}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name={icon} size={24} color={formIcon === icon ? colors.primary : colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View>
          <Text style={styles.label}>Cor</Text>
          <View style={styles.colorRow}>
            {PRESET_COLORS.map(c => (
              <TouchableOpacity key={c} onPress={() => setFormBg(c)} style={[styles.colorDot, { backgroundColor: c }, formBg === c && styles.colorDotSelected]} />
            ))}
          </View>
        </View>

        <View style={styles.footerBtns}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { setView("list"); resetForm(); }}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={submitting}>
            {submitting
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.saveBtnText}>{catToEdit ? "Salvar" : "Adicionar"}</Text>}
          </TouchableOpacity>
        </View>

        {ModalComponent}
      </ScrollView>
    );
  }

  if (view === "transfer") {
    const compatible = categories.filter(c => c.id !== catToDelete?.id && c.isIncome === catToDelete?.isIncome);
    return (
      <View style={styles.screen}>
        <View style={{ padding: 20 }}>
          <Text style={styles.title}>Excluir Categoria</Text>
          <Text style={styles.subtitle}>Transferir transações de {catToDelete?.displayName} para:</Text>
          <FlatList
            data={compatible}
            keyExtractor={item => item.id}
            style={{ maxHeight: 300 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.optionRow, transferCatId === item.id && styles.optionSelected]} onPress={() => setTransferCatId(item.id)}>
                <MaterialIcons name={item.icon} size={20} color={transferCatId === item.id ? colors.primary : colors.text} style={{ marginRight: 10 }} />
                <Text style={[styles.optionText, transferCatId === item.id && { color: colors.primary }]}>{item.displayName}</Text>
              </TouchableOpacity>
            )}
          />
          <View style={[styles.footerBtns, { marginTop: 24 }]}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { setView("list"); setCatToDelete(null); }}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.danger }]} onPress={handleDelete} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Transferir e Excluir</Text>}
            </TouchableOpacity>
          </View>
        </View>
        {ModalComponent}
      </View>
    );
  }

  // Lista
  return (
    <View style={styles.screen}>
      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.title}>Categorias</Text>
              <Image
                source={require("../../assets/images/PROSPER_2.png")}
                style={styles.miniLogo}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
              <MaterialIcons name="add-circle" size={22} color="#FFF" />
              <Text style={styles.addBtnText}>Nova Categoria</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.catRow}>
            <View style={[styles.catIcon, { backgroundColor: item.background }]}>
              <MaterialIcons name={item.icon} size={22} color="#FFF" />
            </View>
            <View style={styles.catInfo}>
              <Text style={styles.catName}>{item.displayName}</Text>
              <Text style={styles.catMeta}>{item.isDefault ? "Padrão" : "Personalizada"}{item.isIncome ? " · Receita" : " · Despesa"}</Text>
            </View>
            {!item.isDefault && (
              <View style={styles.catActions}>
                <TouchableOpacity onPress={() => openEdit(item)} hitSlop={8}>
                  <MaterialIcons name="edit" size={22} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openDelete(item)} hitSlop={8}>
                  <MaterialIcons name="delete-outline" size={22} color={colors.danger} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />
      {ModalComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  title: { fontWeight: "700", fontSize: 22, color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  label: { fontSize: 14, color: colors.textSecondary, marginBottom: 6 },
  input: { backgroundColor: colors.surface, color: colors.text, padding: 14, borderRadius: 8, borderWidth: 1, borderColor: colors.border, fontSize: 16 },

  typeSelector: { flexDirection: "row", gap: 12 },
  typeBtn: { flex: 1, paddingVertical: 12, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  typeBtnIncome: { backgroundColor: colors.success, borderColor: colors.success },
  typeBtnExpense: { backgroundColor: colors.danger, borderColor: colors.danger },
  typeBtnText: { fontWeight: "700", color: colors.textSecondary },

  iconsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  iconBox: { width: 48, height: 48, backgroundColor: colors.surface, borderRadius: 8, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border },
  iconBoxActive: { borderColor: colors.primary, backgroundColor: "rgba(130,87,229,0.2)" },
  iconBoxDisabled: { opacity: 0.3 },
  inputError: { borderColor: colors.danger },
  fieldError: { fontSize: 12, color: colors.danger, marginTop: 4 },

  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  colorDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: "transparent" },
  colorDotSelected: { borderColor: colors.text },

  footerBtns: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: colors.background, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  cancelBtnText: { fontWeight: "700", color: colors.textSecondary },
  saveBtn: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center" },
  saveBtnText: { fontWeight: "700", color: "#FFF" },

  listHeader: { marginBottom: 8, gap: 12 },
  listHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  miniLogo: { width: 40, height: 40 },

  addBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primary, padding: 14, borderRadius: 8, justifyContent: "center" },
  addBtnText: { fontWeight: "700", color: "#FFF", fontSize: 16 },

  catRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  catIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  catInfo: { flex: 1 },
  catName: { fontWeight: "700", fontSize: 16, color: colors.text },
  catMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  catActions: { flexDirection: "row", gap: 12 },

  optionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionSelected: { backgroundColor: "rgba(130,87,229,0.1)", borderRadius: 8 },
  optionText: { fontSize: 16, color: colors.text },
});
