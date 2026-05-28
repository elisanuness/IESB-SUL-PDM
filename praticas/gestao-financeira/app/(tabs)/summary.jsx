// ─────────────────────────────────────────────────────────────────────────────
// Autora: Elisa Nunes de Freitas
// Arquivo: app/(tabs)/summary.jsx
// Descrição: Tela Histórico — lista paginada de transações com filtros por
//            período (mês ou ano), tipo (receita/despesa) e categoria.
//            Permite editar e excluir cada transação diretamente da lista.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useContext, useCallback } from "react";
import {
  View, FlatList, StyleSheet, Text, TouchableOpacity,
  Modal, Platform, StatusBar, ScrollView, ActivityIndicator, Image,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { MoneyContext } from "../../contexts/GlobalState";
import TransactionItem from "../../components/TransactionItem";
import { colors } from "../../constants/colors";
import { useAppModal } from "../../components/AppModal";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const currentYear = new Date().getFullYear();
// Lista de anos disponíveis no seletor, do ano atual até 1950 em ordem decrescente.
const ANOS = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i);

export default function Historico() {
  const router  = useRouter();
  const { transactions, categories, loading, refresh, removeTransaction } = useContext(MoneyContext);
  const { showAlert, showConfirm, ModalComponent } = useAppModal();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { refresh(); }, []));

  const [viewMode, setViewMode]                       = useState("month");
  const [showValues, setShowValues]                   = useState(true);
  const [selectedDay, setSelectedDay]                 = useState("Todos");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState("Todos");
  const [selectedType, setSelectedType]               = useState("Todos");
  const [selectedCategory, setSelectedCategory]       = useState("Todas");
  const [currentDate, setCurrentDate]                 = useState(new Date());
  const [activeModal, setActiveModal]                 = useState(null);
  const [tempMonth, setTempMonth]                     = useState(new Date().getMonth());
  const [tempYear, setTempYear]                       = useState(new Date().getFullYear());

  const resetSubFilters = () => { setSelectedDay("Todos"); setSelectedMonthFilter("Todos"); };

  const handlePrevPeriod = () => {
    if (viewMode === "month") setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    else setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
    resetSubFilters();
  };

  const handleNextPeriod = () => {
    if (viewMode === "month") setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    else setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
    resetSubFilters();
  };

  const openMonthPicker = () => { setTempMonth(currentDate.getMonth()); setTempYear(currentDate.getFullYear()); setActiveModal("month"); };
  const confirmMonthPicker = () => { setCurrentDate(new Date(tempYear, tempMonth, 1)); resetSubFilters(); setActiveModal(null); };

  const formattedPeriodLabel = viewMode === "month"
    ? `${MESES[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : `${currentDate.getFullYear()}`;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysArray   = ["Todos", ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const availableCategories = selectedType === "Todos"
    ? categories
    : categories.filter(c => selectedType === "income" ? c.isIncome : !c.isIncome);

  // Strings de data YYYY-MM-DD recebem T12:00:00 para evitar deslocamento de fuso
  // horário no parse; a ordenação final é do mais recente ao mais antigo.
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.category) return false;
      const raw = t.date;
      const d   = typeof raw === "string" ? new Date(raw.length === 10 ? `${raw}T12:00:00` : raw) : new Date(raw);
      const year = d.getFullYear(), month = d.getMonth() + 1, day = d.getDate();

      if (viewMode === "month") {
        if (year !== currentDate.getFullYear() || month !== currentDate.getMonth() + 1) return false;
        if (selectedDay !== "Todos" && day !== parseInt(selectedDay)) return false;
      } else {
        if (year !== currentDate.getFullYear()) return false;
        if (selectedMonthFilter !== "Todos" && month !== parseInt(selectedMonthFilter)) return false;
      }
      if (selectedType === "income"  && !t.category.isIncome) return false;
      if (selectedType === "expense" &&  t.category.isIncome) return false;
      if (selectedCategory !== "Todas" && t.category.id !== selectedCategory) return false;
      return true;
    }).sort((a, b) => {
      const toMs = x => { const r = x.date; return (typeof r === "string" ? new Date(r.length === 10 ? `${r}T12:00:00` : r) : new Date(r)).getTime(); };
      return toMs(b) - toMs(a);
    });
  }, [transactions, viewMode, currentDate, selectedDay, selectedMonthFilter, selectedType, selectedCategory]);

  const totalIncome  = filteredTransactions.filter(t => t.category.isIncome).reduce((s, t) => s + Number(t.value), 0);
  const totalExpense = filteredTransactions.filter(t => !t.category.isIncome).reduce((s, t) => s + Number(t.value), 0);
  const balance      = totalIncome - totalExpense;
  const isProfit     = balance >= 0;

  const fmt = (val) => showValues ? `R$ ${Math.abs(val).toFixed(2).replace(".", ",")}` : "R$ •••••";

  const handleEdit = (transaction) =>
    router.push({ pathname: "/gerenciar-transacao", params: { transactionId: transaction.id } });

  const handleDelete = (transaction) => {
    showConfirm(
      "Atenção",
      `Excluir "${transaction.description}"?`,
      async () => {
        try { await removeTransaction(transaction.id); }
        catch (e) { showAlert("Erro", e.message || "Não foi possível excluir."); }
      },
      "Excluir",
      true,
    );
  };

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>Receita</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>{fmt(totalIncome)}</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryLabel}>Despesa</Text>
            <Text style={[styles.summaryValue, { color: colors.danger }]}>{fmt(totalExpense)}</Text>
          </View>
          <View style={styles.vDivider} />
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryLabel, { fontWeight: "700" }]}>{isProfit ? "Lucro" : "Prejuízo"}</Text>
            <Text style={[styles.summaryValue, { color: isProfit ? colors.success : colors.danger }]}>{fmt(balance)}</Text>
          </View>
          <View style={styles.vDivider} />
          <TouchableOpacity onPress={() => setShowValues(!showValues)} style={{ padding: 4 }}>
            <MaterialIcons name={showValues ? "visibility" : "visibility-off"} size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filtersBar}>
        {viewMode === "month" ? (
          <TouchableOpacity style={styles.filterChip} onPress={() => setActiveModal("day")}>
            <Text style={styles.filterChipText} numberOfLines={1}>Dia: {selectedDay}</Text>
            <MaterialIcons name="expand-more" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.filterChip} onPress={() => setActiveModal("monthFilter")}>
            <Text style={styles.filterChipText} numberOfLines={1}>Mês: {selectedMonthFilter === "Todos" ? "Todos" : MESES[selectedMonthFilter - 1]}</Text>
            <MaterialIcons name="expand-more" size={14} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.filterChip} onPress={() => setActiveModal("type")}>
          <Text style={styles.filterChipText} numberOfLines={1}>Tipo: {selectedType === "Todos" ? "Todos" : selectedType === "income" ? "Receita" : "Despesa"}</Text>
          <MaterialIcons name="expand-more" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setActiveModal("category")}>
          <Text style={styles.filterChipText} numberOfLines={1}>Cat: {selectedCategory === "Todas" ? "Todas" : categories.find(c => c.id === selectedCategory)?.displayName}</Text>
          <MaterialIcons name="expand-more" size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && transactions.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho fixo */}
      <View style={styles.fixedHeader}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.headerTitle}>Histórico</Text>
          <Image
            source={require("../../assets/images/PROSPER_2.png")}
            style={styles.miniLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.modeSelector}>
          {["month","year"].map(mode => (
            <TouchableOpacity key={mode} style={[styles.modeBtn, viewMode === mode && styles.modeBtnActive]} onPress={() => { setViewMode(mode); resetSubFilters(); }}>
              <Text style={[styles.modeBtnText, viewMode === mode && styles.modeBtnTextActive]}>{mode === "month" ? "Mês" : "Ano"}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dateNav}>
          <TouchableOpacity onPress={handlePrevPeriod} style={styles.arrowBtn}>
            <MaterialIcons name="chevron-left" size={28} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => viewMode === "month" ? openMonthPicker() : setActiveModal("yearDirect")}
            style={styles.dateSelector}
            activeOpacity={0.7}
          >
            <Text style={styles.dateText}>{formattedPeriodLabel}</Text>
            <MaterialIcons name="arrow-drop-down" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextPeriod} style={styles.arrowBtn}>
            <MaterialIcons name="chevron-right" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={<ListHeader />}
        renderItem={({ item }) => (
          <TransactionItem
            transaction={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            showValues={showValues}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt-long" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={() => router.push("/gerenciar-transacao")} activeOpacity={0.8}>
        <MaterialIcons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Modais de filtro */}
      <Modal visible={activeModal !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {activeModal === "month" && (
              <>
                <Text style={styles.modalTitle}>Selecionar Período</Text>
                <View style={styles.dualPicker}>
                  <ScrollView style={styles.columnPicker} showsVerticalScrollIndicator={false}>
                    {MESES.map((m, i) => (
                      <TouchableOpacity key={i} style={[styles.optionRowSmall, tempMonth === i && styles.optionSelected]} onPress={() => setTempMonth(i)}>
                        <Text style={[styles.optionTextSmall, tempMonth === i && { color: colors.primary, fontWeight: "700" }]}>{m}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <ScrollView style={styles.columnPicker} showsVerticalScrollIndicator={false}>
                    {ANOS.map((a, i) => (
                      <TouchableOpacity key={i} style={[styles.optionRowSmall, tempYear === a && styles.optionSelected]} onPress={() => setTempYear(a)}>
                        <Text style={[styles.optionTextSmall, tempYear === a && { color: colors.primary, fontWeight: "700" }]}>{a}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={styles.modalBtns}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setActiveModal(null)}><Text style={styles.cancelBtnText}>Cancelar</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={confirmMonthPicker}><Text style={styles.confirmBtnText}>Confirmar</Text></TouchableOpacity>
                </View>
              </>
            )}

            {activeModal === "yearDirect" && (
              <>
                <Text style={styles.modalTitle}>Selecionar Ano</Text>
                <FlatList data={ANOS} keyExtractor={item => item.toString()} style={{ maxHeight: 350 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.optionRow} onPress={() => { setCurrentDate(new Date(item, currentDate.getMonth(), 1)); resetSubFilters(); setActiveModal(null); }}>
                      <Text style={[styles.optionText, currentDate.getFullYear() === item && { color: colors.primary }]}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity style={[styles.cancelBtn, { marginTop: 16 }]} onPress={() => setActiveModal(null)}><Text style={styles.cancelBtnText}>Fechar</Text></TouchableOpacity>
              </>
            )}

            {activeModal === "day" && (
              <>
                <Text style={styles.modalTitle}>Selecionar Dia</Text>
                <FlatList data={daysArray} keyExtractor={item => item.toString()} style={{ maxHeight: 350 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.optionRow} onPress={() => { setSelectedDay(item); setActiveModal(null); }}>
                      <Text style={[styles.optionText, selectedDay === item && { color: colors.primary }]}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity style={[styles.cancelBtn, { marginTop: 16 }]} onPress={() => setActiveModal(null)}><Text style={styles.cancelBtnText}>Fechar</Text></TouchableOpacity>
              </>
            )}

            {activeModal === "monthFilter" && (
              <>
                <Text style={styles.modalTitle}>Selecionar Mês</Text>
                <TouchableOpacity style={styles.optionRow} onPress={() => { setSelectedMonthFilter("Todos"); setActiveModal(null); }}>
                  <Text style={[styles.optionText, selectedMonthFilter === "Todos" && { color: colors.primary }]}>Todos</Text>
                </TouchableOpacity>
                {MESES.map((m, idx) => (
                  <TouchableOpacity key={idx} style={styles.optionRow} onPress={() => { setSelectedMonthFilter(idx + 1); setActiveModal(null); }}>
                    <Text style={[styles.optionText, selectedMonthFilter === (idx + 1) && { color: colors.primary }]}>{m}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={[styles.cancelBtn, { marginTop: 16 }]} onPress={() => setActiveModal(null)}><Text style={styles.cancelBtnText}>Fechar</Text></TouchableOpacity>
              </>
            )}

            {activeModal === "type" && (
              <>
                <Text style={styles.modalTitle}>Filtrar por Tipo</Text>
                {[["Todos","Todos"],["income","Apenas Receita (+)"],["expense","Apenas Despesa (-)"]].map(([val, label]) => (
                  <TouchableOpacity key={val} style={styles.optionRow} onPress={() => { setSelectedType(val); setSelectedCategory("Todas"); setActiveModal(null); }}>
                    <Text style={styles.optionText}>{label}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={[styles.cancelBtn, { marginTop: 16 }]} onPress={() => setActiveModal(null)}><Text style={styles.cancelBtnText}>Fechar</Text></TouchableOpacity>
              </>
            )}

            {activeModal === "category" && (
              <>
                <Text style={styles.modalTitle}>Filtrar Categoria</Text>
                <FlatList
                  data={[{ id: "Todas", displayName: "Todas", icon: "grid-view" }, ...availableCategories]}
                  keyExtractor={item => item.id}
                  style={{ maxHeight: 350 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.optionRow} onPress={() => { setSelectedCategory(item.id); setActiveModal(null); }}>
                      <MaterialIcons name={item.icon} size={20} color={selectedCategory === item.id ? colors.primary : colors.text} style={{ marginRight: 10 }} />
                      <Text style={[styles.optionText, selectedCategory === item.id && { color: colors.primary }]}>{item.displayName}</Text>
                    </TouchableOpacity>
                  )}
                />
                <TouchableOpacity style={[styles.cancelBtn, { marginTop: 16 }]} onPress={() => setActiveModal(null)}><Text style={styles.cancelBtnText}>Fechar</Text></TouchableOpacity>
              </>
            )}

          </View>
        </View>
      </Modal>

      {ModalComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 24, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 24 : 54 },

  fixedHeader: { paddingBottom: 8 },
  headerTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerTitle: { fontWeight: "700", fontSize: 24, color: colors.text },
  miniLogo: { width: 40, height: 40 },

  modeSelector: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: 8, padding: 4, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  modeBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  modeBtnActive: { backgroundColor: colors.primary },
  modeBtnText: { fontSize: 14, color: colors.textSecondary },
  modeBtnTextActive: { fontWeight: "700", color: "#FFF" },

  dateNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.surface, padding: 12, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  dateSelector: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8, backgroundColor: "rgba(130,87,229,0.1)" },
  dateText: { fontWeight: "700", fontSize: 16, color: colors.text },
  arrowBtn: { padding: 4 },

  listHeader: { paddingBottom: 8 },
  summaryCard: { backgroundColor: colors.surface, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryCol: { alignItems: "flex-start" },
  vDivider: { width: 1, backgroundColor: colors.border, height: 30, marginHorizontal: 8 },
  summaryLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  summaryValue: { fontWeight: "700", fontSize: 11 },

  filtersBar: { flexDirection: "row", gap: 8, marginBottom: 16 },
  filterChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  filterChipText: { fontSize: 11, color: colors.textSecondary },

  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 48, gap: 12 },
  emptyText: { fontSize: 16, color: colors.textSecondary },

  fab: { position: "absolute", bottom: 24, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", padding: 24 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border },
  modalTitle: { fontWeight: "700", fontSize: 18, color: colors.text, marginBottom: 16, textAlign: "center" },
  dualPicker: { flexDirection: "row", height: 250, marginBottom: 16 },
  columnPicker: { flex: 1, borderRightWidth: 1, borderRightColor: colors.border },
  optionRowSmall: { paddingVertical: 12, alignItems: "center" },
  optionSelected: { backgroundColor: "rgba(130,87,229,0.1)" },
  optionTextSmall: { fontSize: 14, color: colors.text },
  modalBtns: { flexDirection: "row", justifyContent: "flex-end", gap: 16 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: colors.background, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: "center" },
  cancelBtnText: { fontWeight: "700", color: colors.textSecondary, fontSize: 16 },
  confirmBtn: { backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, alignItems: "center" },
  confirmBtnText: { fontWeight: "700", color: "#FFF", fontSize: 16 },
  optionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionText: { fontSize: 16, color: colors.text },
});
