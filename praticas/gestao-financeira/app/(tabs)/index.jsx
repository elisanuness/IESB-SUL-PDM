// ─────────────────────────────────────────────────────────────────────────────
// Autora: Elisa Nunes de Freitas
// Arquivo: app/(tabs)/index.jsx
// Descrição: Tela Resumo — exibe KPIs financeiros, gráficos de pizza e linha,
//            transações recentes e modais de avatar, nome, filtros e categorias.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useContext, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, Platform, StatusBar,
  TouchableOpacity, Dimensions, Modal, TextInput,
  Image, ActivityIndicator,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { PieChart, LineChart } from "react-native-chart-kit";
import { MaterialIcons } from "@expo/vector-icons";
import { MoneyContext } from "../../contexts/GlobalState";
import { colors } from "../../constants/colors";
import { useAppModal } from "../../components/AppModal";

const screenWidth = Dimensions.get("window").width;

// Ícones disponíveis para seleção na criação e edição de categorias personalizadas.
const MATERIAL_ICONS_PACK = [
  "payments", "fastfood", "directions-car", "home", "sports-esports",
  "flight", "local-hospital", "shopping-cart", "restaurant", "local-cafe",
  "fitness-center", "movie", "school", "work", "savings", "pets",
  "child-care", "wifi", "sports-soccer", "camera-alt",
];

const PROFESSIONAL_AVATARS = [
  // Femininos (lorelei)
  { seed: "01", bg: "b6e3f4" }, { seed: "02", bg: "c0aede" },
  { seed: "03", bg: "ffdfbf" }, { seed: "04", bg: "d1d4f9" },
  { seed: "05", bg: "f8d7da" }, { seed: "06", bg: "d4edda" },
  { seed: "07", bg: "e2e3e5" }, { seed: "08", bg: "fff3cd" },
  { seed: "09", bg: "ffc8dd" }, { seed: "10", bg: "bde0fe" },
  { seed: "11", bg: "caffbf" }, { seed: "12", bg: "fdffb6" },
  { seed: "13", bg: "e8d5b7" }, { seed: "14", bg: "c9b1ff" },
  { seed: "15", bg: "a8dadc" }, { seed: "16", bg: "ffd6a5" },
  // Masculinos (lorelei com barba)
  { seed: "m01", bg: "b6e3f4" }, { seed: "m02", bg: "c0aede" },
  { seed: "m03", bg: "ffdfbf" }, { seed: "m04", bg: "d1d4f9" },
  { seed: "m05", bg: "caffbf" }, { seed: "m06", bg: "e8d5b7" },
  { seed: "m07", bg: "a8dadc" }, { seed: "m08", bg: "ffd6a5" },
];

// Parâmetros extras aplicados aos avatares masculinos: sem barba, sem brinco,
// sem acessórios e com variantes de cabelo curto da coleção lorelei.
const MALE_AVATAR_PARAMS = "beardProbability=0&earringsProbability=0&hairAccessoriesProbability=0&hair=variant07,variant09,variant34,variant39,variant44";

// Monta a URL do avatar via DiceBear. Seeds iniciados com "m" recebem os
// parâmetros masculinos; os demais usam os padrões femininos da coleção lorelei.
function getAvatarUrl(seed, bg) {
  if (!seed || !bg) return null;
  const extra = seed.startsWith("m") ? `&${MALE_AVATAR_PARAMS}` : "";
  return `https://api.dicebear.com/8.x/lorelei/png?seed=${seed}&backgroundColor=${bg}${extra}`;
}

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function formatMoney(val) {
  return `R$ ${Math.abs(val).toFixed(2).replace(".", ",")}`;
}

export default function Resumo() {
  const router = useRouter();
  const {
    user, transactions, categories, loading, refresh,
    logout, updateAvatar, updateName,
    addCategory, editCategory, removeCategory,
  } = useContext(MoneyContext);
  const { showAlert, showConfirm, ModalComponent } = useAppModal();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => { refresh(); }, []));

  const avatarUrl = user ? getAvatarUrl(user.avatarSeed, user.avatarBg) : null;

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isNameModalOpen,   setIsNameModalOpen]   = useState(false);
  const [newName,           setNewName]           = useState("");

  const [periodMode, setPeriodMode]           = useState("lastMonth");
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [fStartDay, setFStartDay]             = useState("1");
  const [fStartMonth, setFStartMonth]         = useState("Janeiro");
  const [fStartYear, setFStartYear]           = useState(2026);
  const [fEndDay, setFEndDay]                 = useState("31");
  const [fEndMonth, setFEndMonth]             = useState("Dezembro");
  const [fEndYear, setFEndYear]               = useState(2026);
  const [activePicker, setActivePicker]       = useState(null);

  const [isCatFilterOpen, setIsCatFilterOpen] = useState(false);
  const [selectedCats, setSelectedCats]       = useState([]);
  const [pieFilter, setPieFilter]             = useState("All");
  const [lineFilter, setLineFilter]           = useState("All");
  const [tooltipPos, setTooltipPos]           = useState(null);
  const [showValues, setShowValues]           = useState(true);

  const [catModalOpen, setCatModalOpen]       = useState(false);
  const [catView, setCatView]                 = useState("list");
  const [catFormName, setCatFormName]         = useState("");
  const [catFormType, setCatFormType]         = useState("expense");
  const [catFormIcon, setCatFormIcon]         = useState(MATERIAL_ICONS_PACK[0]);
  const [catToEdit, setCatToEdit]             = useState(null);
  const [catToDelete, setCatToDelete]         = useState(null);
  const [transferCatId, setTransferCatId]     = useState(null);

  const getDaysInMonth = (monthName, year) => {
    if (monthName === "Todos") return 31;
    return new Date(year, MESES.indexOf(monthName) + 1, 0).getDate();
  };
  const getDaysArray = (month, year) => ["Todos", ...Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1)];
  const currentYears = [2024, 2025, 2026, 2027];
  const formatCustomPeriod = () =>
    `${fStartDay}/${(MESES.indexOf(fStartMonth)+1).toString().padStart(2,"0")}/${fStartYear} a ${fEndDay}/${(MESES.indexOf(fEndMonth)+1).toString().padStart(2,"0")}/${fEndYear}`;

  // Aplica os filtros de período e categoria às transações brutas do contexto.
  // Strings de data no formato YYYY-MM-DD recebem T12:00:00 para evitar
  // deslocamento de fuso horário no parse do JavaScript.
  const filteredTransactions = useMemo(() => {
    let effectiveStart, effectiveEnd;
    if (periodMode === "lastMonth") {
      const today = new Date();
      effectiveEnd   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      effectiveStart = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate(), 0, 0, 0);
    } else {
      const sYear  = fStartYear !== "Todos" ? fStartYear : 2000;
      const sMonth = fStartMonth !== "Todos" ? MESES.indexOf(fStartMonth) : 0;
      const sDay   = fStartDay !== "Todos" ? fStartDay : 1;
      const eYear  = fEndYear !== "Todos" ? fEndYear : 2100;
      const eMonth = fEndMonth !== "Todos" ? MESES.indexOf(fEndMonth) : 11;
      const eDay   = fEndDay !== "Todos" ? fEndDay : getDaysInMonth(fEndMonth, eYear);
      effectiveStart = new Date(sYear, sMonth, sDay, 0, 0, 0);
      effectiveEnd   = new Date(eYear, eMonth, eDay, 23, 59, 59);
    }
    return transactions.filter(t => {
      if (!t.category) return false;
      const raw = t.date;
      const tDate = typeof raw === "string" ? new Date(raw.length === 10 ? `${raw}T12:00:00` : raw) : new Date(raw);
      if (tDate < effectiveStart || tDate > effectiveEnd) return false;
      if (selectedCats.length > 0 && !selectedCats.includes(t.category.id)) return false;
      return true;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, periodMode, fStartDay, fStartMonth, fStartYear, fEndDay, fEndMonth, fEndYear, selectedCats]);

  const totalIncome  = filteredTransactions.filter(t => t.category.isIncome).reduce((acc, t) => acc + Number(t.value), 0);
  const totalExpense = filteredTransactions.filter(t => !t.category.isIncome).reduce((acc, t) => acc + Number(t.value), 0);
  const balance      = totalIncome - totalExpense;
  const isProfit     = balance >= 0;

  const formatSummaryMoney = (val) => showValues ? formatMoney(val) : "R$ •••••";

  const pieData = useMemo(() => {
    const dataToUse = filteredTransactions.filter(t => {
      if (pieFilter === "Income")  return t.category.isIncome;
      if (pieFilter === "Expense") return !t.category.isIncome;
      return true;
    });
    const grouped = dataToUse.reduce((acc, t) => {
      if (!acc[t.category.id]) acc[t.category.id] = { ...t.category, total: 0 };
      acc[t.category.id].total += Number(t.value);
      return acc;
    }, {});
    return Object.values(grouped).map(cat => {
      const clr = cat.background || colors.primary;
      return { name: cat.displayName, population: cat.total, color: clr, legendFontColor: colors.textSecondary, legendFontSize: 12, icon: cat.icon };
    });
  }, [filteredTransactions, pieFilter]);

  // Agrupa as transações para o gráfico de linha: por dia (intervalos de 5 dias)
  // quando o período é de até 31 dias; por mês quando o período é maior.
  const lineData = useMemo(() => {
    let effectiveStart, effectiveEnd;
    if (periodMode === "lastMonth") {
      const today = new Date();
      effectiveEnd   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      effectiveStart = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate(), 0, 0, 0);
    } else {
      const sYear  = fStartYear !== "Todos" ? fStartYear : 2000;
      const sMonth = fStartMonth !== "Todos" ? MESES.indexOf(fStartMonth) : 0;
      const sDay   = fStartDay !== "Todos" ? fStartDay : 1;
      const eYear  = fEndYear !== "Todos" ? fEndYear : 2100;
      const eMonth = fEndMonth !== "Todos" ? MESES.indexOf(fEndMonth) : 11;
      const eDay   = fEndDay !== "Todos" ? fEndDay : getDaysInMonth(fEndMonth, eYear);
      effectiveStart = new Date(sYear, sMonth, sDay, 0, 0, 0);
      effectiveEnd   = new Date(eYear, eMonth, eDay, 23, 59, 59);
    }
    const spanDays = (effectiveEnd.getTime() - effectiveStart.getTime()) / 86400000;
    const grouped  = {};

    if (spanDays <= 31) {
      for (let i = 0; i <= spanDays; i += 5) {
        const bs  = new Date(effectiveStart); bs.setDate(bs.getDate() + i);
        const key = `${bs.getDate().toString().padStart(2,"0")}/${(bs.getMonth()+1).toString().padStart(2,"0")}`;
        grouped[key] = { inc: 0, exp: 0, rawDate: bs.getTime() };
      }
      filteredTransactions.forEach(t => {
        const raw  = t.date;
        const tDate = typeof raw === "string" ? new Date(raw.length === 10 ? `${raw}T12:00:00` : raw) : new Date(raw);
        const startNoon = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth(), effectiveStart.getDate(), 12);
        let diff = Math.floor((tDate - startNoon) / 86400000);
        if (diff < 0) diff = 0;
        const idx = Math.floor(diff / 5) * 5;
        const bs2 = new Date(startNoon); bs2.setDate(bs2.getDate() + idx);
        const key = `${bs2.getDate().toString().padStart(2,"0")}/${(bs2.getMonth()+1).toString().padStart(2,"0")}`;
        if (grouped[key]) {
          if (t.category.isIncome) grouped[key].inc += Number(t.value);
          else grouped[key].exp += Number(t.value);
        }
      });
    } else {
      let cur = new Date(effectiveStart.getFullYear(), effectiveStart.getMonth(), 1);
      const endM = new Date(effectiveEnd.getFullYear(), effectiveEnd.getMonth(), 1);
      while (cur <= endM) {
        const key = `${MESES[cur.getMonth()].substring(0,3)}/${cur.getFullYear().toString().slice(2)}`;
        grouped[key] = { inc: 0, exp: 0, rawDate: cur.getTime() };
        cur.setMonth(cur.getMonth() + 1);
      }
      filteredTransactions.forEach(t => {
        const raw = t.date;
        const d   = typeof raw === "string" ? new Date(raw.length === 10 ? `${raw}T12:00:00` : raw) : new Date(raw);
        const key = `${MESES[d.getMonth()].substring(0,3)}/${d.getFullYear().toString().slice(2)}`;
        if (grouped[key]) {
          if (t.category.isIncome) grouped[key].inc += Number(t.value);
          else grouped[key].exp += Number(t.value);
        }
      });
    }

    const sortedKeys = Object.keys(grouped).sort((a, b) => grouped[a].rawDate - grouped[b].rawDate);
    const labels = [], incData = [], expData = [];
    sortedKeys.forEach(k => { labels.push(k); incData.push(grouped[k].inc); expData.push(grouped[k].exp); });

    if (labels.length === 0) return { labels: ["Vazio"], datasets: [{ data: [0] }] };
    if (labels.length === 1) { labels.push(labels[0]); incData.push(incData[0]); expData.push(expData[0]); }

    const datasets = [];
    if (lineFilter === "All" || lineFilter === "Income")  datasets.push({ data: incData, color: () => colors.success,  strokeWidth: 3 });
    if (lineFilter === "All" || lineFilter === "Expense") datasets.push({ data: expData, color: () => colors.danger, strokeWidth: 3 });
    return { labels, datasets };
  }, [filteredTransactions, lineFilter, periodMode, fStartDay, fStartMonth, fStartYear, fEndDay, fEndMonth, fEndYear]);

  const handleSaveCategory = async () => {
    if (!catFormName.trim()) { showAlert("Atenção", "Digite o nome da categoria."); return; }
    const payload = {
      name:        catFormName.toLowerCase().replace(/\s+/g, "_"),
      displayName: catFormName,
      icon:        catFormIcon,
      background:  catFormType === "income" ? "#1A7F4B" : "#C0392B",
      isIncome:    catFormType === "income",
    };
    try {
      if (catToEdit) await editCategory(catToEdit.id, payload);
      else           await addCategory(payload);
      setCatView("list");
    } catch (e) {
      showAlert("Erro", e.message || "Não foi possível salvar a categoria.");
    }
  };

  const handleDeleteCategory = async () => {
    if (!transferCatId) { showAlert("Atenção", "Selecione uma categoria para transferir."); return; }
    try {
      await removeCategory(catToDelete.id, transferCatId);
      setCatView("list"); setCatToDelete(null); setTransferCatId(null);
    } catch (e) {
      showAlert("Erro", e.message || "Não foi possível excluir a categoria.");
    }
  };

  const handleNameSave = async () => {
    if (!newName.trim()) return;
    try {
      await updateName(newName.trim());
      setIsNameModalOpen(false);
    } catch (e) {
      showAlert("Erro", e.message || "Não foi possível atualizar o nome.");
    }
  };

  const handleAvatarChange = async (seed, bg) => {
    try {
      await updateAvatar(seed, bg);
      setIsAvatarModalOpen(false);
    } catch (_e) {
      showAlert("Erro", "Não foi possível salvar o avatar.");
    }
  };

  const renderDropdownSelector = (type, value) => (
    <TouchableOpacity style={styles.dateBox} onPress={() => setActivePicker(type)} activeOpacity={0.7}>
      <Text style={styles.dateBoxText} numberOfLines={1}>{value}</Text>
      <MaterialIcons name="arrow-drop-down" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  if (loading && transactions.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {ModalComponent}
      </View>
    );
  }

  // Icons already in use by other categories (or all when creating new)
  const usedIcons = categories
    .filter(c => catToEdit ? c.id !== catToEdit.id : true)
    .map(c => c.icon);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setIsAvatarModalOpen(true)} style={styles.avatarWrapper} activeOpacity={0.8}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: colors.surface, justifyContent: "center", alignItems: "center" }]}>
                  <MaterialIcons name="person" size={30} color={colors.primary} />
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                <MaterialIcons name="edit" size={10} color="#FFF" />
              </View>
            </TouchableOpacity>

            <View>
              <View style={styles.greetingRow}>
                <Text style={styles.greeting}>Bem-vindo, {user?.name || "Visitante"}!</Text>
                <TouchableOpacity
                  onPress={() => { setNewName(user?.name || ""); setIsNameModalOpen(true); }}
                  hitSlop={8}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="edit" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.usernameText}>@{user?.username || "usuario"}</Text>
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => showConfirm("Sair", "Deseja sair?", () => { logout(); router.replace("/login"); }, "Sair", true)}
              >
                <MaterialIcons name="logout" size={14} color={colors.danger} />
                <Text style={styles.logoutBtnText}>Sair</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Image
            source={require("../../assets/images/PROSPER_2.png")}
            style={styles.miniLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerBtnsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push("/gerenciar-transacao")}>
            <MaterialIcons name="add" size={16} color="#FFF" />
            <Text style={styles.actionBtnText}>Nova transação</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* PAINEL DE FILTROS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Visualização por:</Text>
          <View style={styles.periodToggleRow}>
            {["lastMonth", "custom"].map(mode => (
              <TouchableOpacity
                key={mode}
                style={[styles.periodBtn, periodMode === mode && styles.periodBtnActive]}
                onPress={() => { setPeriodMode(mode); if (mode === "custom") setIsPeriodModalOpen(true); }}
              >
                <Text style={[styles.periodBtnText, periodMode === mode && styles.periodBtnTextActive]}>
                  {mode === "lastMonth" ? "Último mês" : "Período"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {periodMode === "custom" && (
            <View style={styles.customPeriodDisplay}>
              <Text style={styles.customPeriodText}>{formatCustomPeriod()}</Text>
              <TouchableOpacity onPress={() => setIsPeriodModalOpen(true)}>
                <MaterialIcons name="edit" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity style={styles.catFilterBtn} onPress={() => setIsCatFilterOpen(true)}>
            <Text style={styles.catFilterBtnText}>
              {selectedCats.length === 0 ? "Todas as Categorias" : `${selectedCats.length} Categoria(s) Filtrada(s)`}
            </Text>
            <MaterialIcons name="expand-more" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* KPIs */}
        <View style={styles.card}>
          <View style={styles.kpiHeaderRow}>
            <Text style={styles.cardTitle}>Resumo Financeiro</Text>
            <TouchableOpacity onPress={() => setShowValues(!showValues)} style={{ padding: 4 }}>
              <MaterialIcons name={showValues ? "visibility" : "visibility-off"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.kpiTopRow}>
            <View style={styles.kpiMini}>
              <Text style={styles.kpiMiniLabel}>Receita Total:</Text>
              <Text style={[styles.kpiMiniValue, { color: colors.success }]}>+{formatSummaryMoney(totalIncome)}</Text>
            </View>
            <View style={styles.kpiMini}>
              <Text style={styles.kpiMiniLabel}>Despesa Total:</Text>
              <Text style={[styles.kpiMiniValue, { color: colors.danger }]}>-{formatSummaryMoney(totalExpense)}</Text>
            </View>
          </View>
          <View style={styles.kpiDivider} />
          <View style={styles.kpiBottomRow}>
            <View>
              <Text style={styles.kpiMainLabel}>Saldo Total:</Text>
              <Text style={styles.kpiMainValue}>{formatSummaryMoney(balance)}</Text>
            </View>
            <View style={[styles.kpiTag, { backgroundColor: isProfit ? "rgba(4,211,97,0.2)" : "rgba(247,90,104,0.2)" }]}>
              <Text style={[styles.kpiTagText, { color: isProfit ? colors.success : colors.danger }]}>
                {isProfit ? "Lucro" : "Prejuízo"}
              </Text>
            </View>
          </View>
        </View>

        {/* TRANSAÇÕES RECENTES */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transações Recentes</Text>
          {filteredTransactions.length > 0
            ? filteredTransactions.slice(0, 5).map(item => {
                const raw = item.date;
                const d   = typeof raw === "string" ? new Date(raw.length === 10 ? `${raw}T12:00:00` : raw) : new Date(raw);
                const dateStr = `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
                return (
                  <View key={item.id} style={styles.recentItem}>
                    <View style={styles.recentLeft}>
                      <View style={[styles.recentIcon, { backgroundColor: item.category.background || (item.category.isIncome ? colors.success : colors.danger) }]}>
                        <MaterialIcons name={item.category.icon} size={18} color="#FFF" />
                      </View>
                      <View style={{ flexShrink: 1 }}>
                        <Text style={styles.recentDesc} numberOfLines={1}>{item.description}</Text>
                        <Text style={styles.recentMeta}>{item.category.displayName} • {dateStr}</Text>
                      </View>
                    </View>
                    <Text style={[styles.recentValue, { color: item.category.isIncome ? colors.success : colors.danger }]}>
                      {item.category.isIncome ? "+" : "-"}{showValues ? formatMoney(Number(item.value)) : "•••"}
                    </Text>
                  </View>
                );
              })
            : <Text style={styles.emptyText}>Sem transações no período.</Text>}
          <TouchableOpacity style={styles.seeMoreBtn} onPress={() => router.push("/(tabs)/summary")}>
            <Text style={styles.seeMoreText}>Ver histórico completo ({filteredTransactions.length})</Text>
          </TouchableOpacity>
        </View>

        {/* GRÁFICO PIZZA */}
        <View style={styles.card}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.cardTitle}>Distribuição</Text>
            <View style={styles.filterToggles}>
              {[["All","Todos"],["Income","Rec"],["Expense","Desp"]].map(([opt, label]) => (
                <TouchableOpacity key={opt} onPress={() => setPieFilter(opt)} style={[styles.miniToggle, pieFilter === opt && styles.miniToggleActive]}>
                  <Text style={[styles.miniToggleText, pieFilter === opt && { color: "#FFF" }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {pieData.length > 0 ? (
            <View style={{ alignItems: "center" }}>
              <PieChart
                data={pieData} width={screenWidth - 80} height={180}
                chartConfig={{ color: () => "#FFF" }}
                accessor="population" backgroundColor="transparent"
                paddingLeft="15" hasLegend={false} center={[screenWidth / 4 - 40, 0]}
              />
              <View style={styles.legendContainer}>
                {pieData.map((item, idx) => (
                  <View key={idx} style={styles.legendRow}>
                    <View style={styles.legendLeft}>
                      <MaterialIcons name={item.icon} size={16} color={item.color} style={{ marginRight: 6 }} />
                      <Text style={styles.legendText}>{item.name}</Text>
                    </View>
                    <Text style={styles.legendText}>{formatMoney(item.population)}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : <Text style={styles.emptyText}>Sem dados.</Text>}
        </View>

        {/* GRÁFICO DE LINHA */}
        <View style={styles.card}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.cardTitle}>Evolução Temporal</Text>
            <View style={styles.filterToggles}>
              {[["All","Todos"],["Income","Rec"],["Expense","Desp"]].map(([opt, label]) => (
                <TouchableOpacity key={opt} onPress={() => { setLineFilter(opt); setTooltipPos(null); }} style={[styles.miniToggle, lineFilter === opt && styles.miniToggleActive]}>
                  <Text style={[styles.miniToggleText, lineFilter === opt && { color: "#FFF" }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ position: "relative", marginTop: 16 }}>
            <LineChart
              data={lineData} width={screenWidth - 48} height={220}
              chartConfig={{
                backgroundColor: colors.surface,
                backgroundGradientFrom: colors.surface,
                backgroundGradientTo: colors.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                labelColor: (opacity = 1) => `rgba(168,168,179,${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: { r: "5", strokeWidth: "2", stroke: colors.background },
              }}
              bezier style={{ marginVertical: 8, borderRadius: 16, marginLeft: -15 }}
              onDataPointClick={(data) => {
                setTooltipPos({ x: data.x, y: data.y, val: data.value });
                setTimeout(() => setTooltipPos(null), 3000);
              }}
            />
            {tooltipPos && (
              <View style={[styles.tooltip, { left: tooltipPos.x - 40, top: tooltipPos.y - 35 }]}>
                <Text style={styles.tooltipText}>R$ {tooltipPos.val}</Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>

      {/* MODAIS */}

      {/* Período */}
      <Modal visible={isPeriodModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Definir Período</Text>
            <View style={{ paddingHorizontal: 4 }}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>De:</Text>
                {renderDropdownSelector("startDay", fStartDay)}
                {renderDropdownSelector("startMonth", fStartMonth)}
                {renderDropdownSelector("startYear", fStartYear)}
              </View>
              <View style={[styles.filterRow, { marginTop: 10 }]}>
                <Text style={styles.filterLabel}>A: </Text>
                {renderDropdownSelector("endDay", fEndDay)}
                {renderDropdownSelector("endMonth", fEndMonth)}
                {renderDropdownSelector("endYear", fEndYear)}
              </View>
            </View>
            <TouchableOpacity style={styles.confirmBtnFull} onPress={() => setIsPeriodModalOpen(false)}>
              <Text style={styles.confirmBtnText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Picker de dia/mês/ano */}
      <Modal visible={activePicker !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView style={{ maxHeight: 300 }}>
              {activePicker?.includes("Day") &&
                getDaysArray(activePicker === "startDay" ? fStartMonth : fEndMonth, activePicker === "startDay" ? fStartYear : fEndYear)
                  .map(d => (
                    <TouchableOpacity key={d} style={styles.dropOption} onPress={() => { if (activePicker === "startDay") setFStartDay(d); else setFEndDay(d); setActivePicker(null); }}>
                      <Text style={styles.dropOptionText}>{d}</Text>
                    </TouchableOpacity>
                  ))}
              {activePicker?.includes("Month") &&
                ["Todos", ...MESES].map(m => (
                  <TouchableOpacity key={m} style={styles.dropOption} onPress={() => { if (activePicker === "startMonth") setFStartMonth(m); else setFEndMonth(m); setActivePicker(null); }}>
                    <Text style={styles.dropOptionText}>{m}</Text>
                  </TouchableOpacity>
                ))}
              {activePicker?.includes("Year") &&
                ["Todos", ...currentYears].map(y => (
                  <TouchableOpacity key={y} style={styles.dropOption} onPress={() => { if (activePicker === "startYear") setFStartYear(y); else setFEndYear(y); setActivePicker(null); }}>
                    <Text style={styles.dropOptionText}>{y}</Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setActivePicker(null)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filtro de categorias */}
      <Modal visible={isCatFilterOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: "70%" }]}>
            <Text style={styles.modalTitle}>Filtrar Categorias</Text>
            <Text style={styles.modalSubtitle}>Selecione quais categorias ver (vazio = todas)</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {categories.map(cat => (
                <TouchableOpacity key={cat.id} style={styles.multiSelectRow} onPress={() =>
                  setSelectedCats(prev => prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id])
                }>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <MaterialIcons name={cat.icon} size={20} color={cat.isIncome ? colors.success : colors.danger} />
                    <Text style={styles.dropOptionText}>{cat.displayName}</Text>
                  </View>
                  <MaterialIcons
                    name={selectedCats.includes(cat.id) ? "check-box" : "check-box-outline-blank"}
                    size={24}
                    color={selectedCats.includes(cat.id) ? colors.primary : colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.confirmBtnFull} onPress={() => setIsCatFilterOpen(false)}>
              <Text style={styles.confirmBtnText}>Aplicar Filtro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Avatar */}
      <Modal visible={isAvatarModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { paddingBottom: 30 }]}>
            <Text style={styles.modalTitle}>Escolha seu Avatar</Text>
            <View style={styles.avatarGrid}>
              {PROFESSIONAL_AVATARS.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.avatarOption, user?.avatarSeed === item.seed && styles.avatarOptionSelected]}
                  onPress={() => handleAvatarChange(item.seed, item.bg)}
                >
                  <Image source={{ uri: getAvatarUrl(item.seed, item.bg) }} style={styles.avatarOptionImg} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.cancelBtn, { marginTop: 20 }]} onPress={() => setIsAvatarModalOpen(false)}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Gerenciar categorias */}
      <Modal visible={catModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: "80%" }]}>
            {catView === "list" ? (
              <>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>Categorias</Text>
                  <TouchableOpacity onPress={() => { setCatToEdit(null); setCatFormName(""); setCatFormType("expense"); setCatFormIcon(MATERIAL_ICONS_PACK[0]); setCatView("form"); }}>
                    <MaterialIcons name="add-circle" size={28} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {categories.map(cat => (
                    <View key={cat.id} style={styles.multiSelectRow}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <MaterialIcons name={cat.icon} size={20} color={cat.isIncome ? colors.success : colors.danger} />
                        <Text style={styles.dropOptionText}>{cat.displayName}</Text>
                      </View>
                      {!cat.isDefault ? (
                        <View style={{ flexDirection: "row", gap: 12 }}>
                          <TouchableOpacity onPress={() => { setCatToEdit(cat); setCatFormName(cat.displayName); setCatFormType(cat.isIncome ? "income" : "expense"); setCatFormIcon(cat.icon); setCatView("form"); }}>
                            <MaterialIcons name="edit" size={20} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => { setCatToDelete(cat); setCatView("transfer"); }}>
                            <MaterialIcons name="delete" size={20} color={colors.danger} />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <Text style={{ fontSize: 10, color: colors.textSecondary }}>Padrão</Text>
                      )}
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.confirmBtnFull} onPress={() => setCatModalOpen(false)}>
                  <Text style={styles.confirmBtnText}>Fechar</Text>
                </TouchableOpacity>
              </>
            ) : catView === "form" ? (
              <>
                <Text style={styles.modalTitle}>{catToEdit ? "Editar Categoria" : "Nova Categoria"}</Text>
                <View style={styles.periodToggleRow}>
                  <TouchableOpacity style={[styles.periodBtn, catFormType === "income" && { backgroundColor: colors.success }]} onPress={() => setCatFormType("income")}>
                    <Text style={[styles.periodBtnText, catFormType === "income" && { color: "#FFF", fontWeight: "700" }]}>Receita</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.periodBtn, catFormType === "expense" && { backgroundColor: colors.danger }]} onPress={() => setCatFormType("expense")}>
                    <Text style={[styles.periodBtnText, catFormType === "expense" && { color: "#FFF", fontWeight: "700" }]}>Despesa</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={[styles.textInput, { marginBottom: 12 }]}
                  placeholder="Nome da categoria"
                  placeholderTextColor={colors.textSecondary}
                  value={catFormName}
                  onChangeText={setCatFormName}
                />
                <Text style={styles.inputLabel}>Escolha um ícone:</Text>
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 160, marginBottom: 16 }}>
                  <View style={styles.iconsGrid}>
                    {MATERIAL_ICONS_PACK.map(icon => {
                      const isUsed = usedIcons.includes(icon);
                      return (
                        <TouchableOpacity
                          key={icon}
                          style={[styles.iconBox, catFormIcon === icon && styles.iconBoxActive, isUsed && styles.iconBoxDisabled]}
                          onPress={() => !isUsed && setCatFormIcon(icon)}
                          disabled={isUsed}
                          activeOpacity={0.7}
                        >
                          <MaterialIcons name={icon} size={24} color={catFormIcon === icon ? colors.primary : colors.textSecondary} />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setCatView("list")}>
                    <Text style={styles.cancelBtnText}>Voltar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={handleSaveCategory}>
                    <Text style={styles.confirmBtnText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Excluir Categoria</Text>
                <Text style={styles.modalSubtitle}>Transferir transações de {catToDelete?.displayName} para:</Text>
                <ScrollView style={{ flex: 1, marginVertical: 16 }}>
                  {categories.filter(c => c.id !== catToDelete?.id && c.isIncome === catToDelete?.isIncome).map(cat => (
                    <TouchableOpacity key={cat.id} style={[styles.dropOption, transferCatId === cat.id && styles.optionSelected]} onPress={() => setTransferCatId(cat.id)}>
                      <Text style={[styles.dropOptionText, transferCatId === cat.id && { color: colors.primary }]}>{cat.displayName}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => { setCatToDelete(null); setTransferCatId(null); setCatView("list"); }}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.danger }]} onPress={handleDeleteCategory}>
                    <Text style={styles.confirmBtnText}>Transferir e Excluir</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal editar nome */}
      <Modal visible={isNameModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Como quer ser chamado?</Text>
            <TextInput
              style={[styles.textInput, { marginBottom: 20 }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Seu nome de exibição"
              placeholderTextColor={colors.textSecondary}
              autoFocus
              maxLength={40}
            />
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsNameModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleNameSave}>
                <Text style={styles.confirmBtnText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {ModalComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 48 : 64, paddingHorizontal: 20 },
  header: { marginBottom: 24 },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  miniLogo: { width: 40, height: 40 },
  avatarWrapper: { width: 56, height: 56, position: "relative" },
  avatarImage: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface },
  avatarEditBadge: { position: "absolute", bottom: -2, right: -2, backgroundColor: colors.primary, width: 20, height: 20, borderRadius: 10, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: colors.background },
  greetingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  greeting: { fontSize: 20, fontWeight: "700", color: colors.text },
  usernameText: { fontSize: 13, color: colors.primary, marginBottom: 4 },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4, paddingHorizontal: 10, backgroundColor: "rgba(247,90,104,0.1)", borderRadius: 20, alignSelf: "flex-start" },
  logoutBtnText: { fontWeight: "700", fontSize: 12, color: colors.danger },
  headerBtnsRow: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 8 },
  actionBtnText: { fontWeight: "700", fontSize: 12, color: "#FFF" },

  card: { backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  cardTitle: { fontWeight: "700", fontSize: 16, color: colors.text, marginBottom: 12 },

  periodToggleRow: { flexDirection: "row", backgroundColor: colors.background, borderRadius: 8, padding: 4, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  periodBtn: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 6 },
  periodBtnActive: { backgroundColor: colors.primary },
  periodBtnText: { fontSize: 12, color: colors.textSecondary },
  periodBtnTextActive: { fontWeight: "700", color: "#FFF" },
  customPeriodDisplay: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(130,87,229,0.1)", padding: 10, borderRadius: 8, marginBottom: 12 },
  customPeriodText: { fontSize: 12, color: colors.text },
  catFilterBtn: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.background, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  catFilterBtnText: { fontSize: 12, color: colors.textSecondary },

  kpiHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  kpiTopRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  kpiMini: { flex: 1 },
  kpiMiniLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 2 },
  kpiMiniValue: { fontWeight: "700", fontSize: 16 },
  kpiDivider: { height: 1, backgroundColor: colors.border, marginBottom: 12 },
  kpiBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  kpiMainLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
  kpiMainValue: { fontWeight: "700", fontSize: 24, color: colors.text },
  kpiTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  kpiTagText: { fontWeight: "700", fontSize: 12 },

  recentItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  recentLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  recentIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  recentDesc: { fontWeight: "700", fontSize: 12, color: colors.text },
  recentMeta: { fontSize: 10, color: colors.textSecondary },
  recentValue: { fontWeight: "700", fontSize: 14 },
  seeMoreBtn: { marginTop: 12, paddingVertical: 10, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: colors.primary },
  seeMoreText: { fontWeight: "700", fontSize: 12, color: colors.primary },
  emptyText: { color: colors.textSecondary, textAlign: "center", marginVertical: 10 },

  chartHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  filterToggles: { flexDirection: "row", gap: 4, backgroundColor: colors.background, padding: 4, borderRadius: 4 },
  miniToggle: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  miniToggleActive: { backgroundColor: colors.primary },
  miniToggleText: { fontSize: 10, color: colors.textSecondary },
  legendContainer: { width: "100%", marginTop: 16, gap: 8 },
  legendRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  legendLeft: { flexDirection: "row", alignItems: "center" },
  legendText: { fontSize: 12, color: colors.textSecondary },
  tooltip: { position: "absolute", backgroundColor: colors.primary, padding: 6, borderRadius: 4, zIndex: 10 },
  tooltipText: { fontWeight: "700", fontSize: 12, color: "#FFF" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 20 },
  modalBox: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border },
  modalTitle: { fontWeight: "700", fontSize: 16, color: colors.text, marginBottom: 16, textAlign: "center" },
  modalSubtitle: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: 16 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalFooter: { flexDirection: "row", gap: 12, marginTop: 16 },

  filterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  filterLabel: { fontWeight: "700", fontSize: 12, color: colors.textSecondary, width: 25 },
  dateBox: { flex: 1, height: 32, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, borderRadius: 6, justifyContent: "center", alignItems: "center", marginHorizontal: 2, flexDirection: "row" },
  dateBoxText: { fontSize: 12, color: colors.text },

  dropOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: "center" },
  optionSelected: { backgroundColor: "rgba(130,87,229,0.1)" },
  dropOptionText: { fontSize: 16, color: colors.text },
  multiSelectRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },

  confirmBtn: { flex: 1, minHeight: 48, padding: 12, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  confirmBtnFull: { marginTop: 16, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  confirmBtnText: { fontWeight: "700", fontSize: 15, color: "#FFF" },
  cancelBtn: { flex: 1, minHeight: 48, padding: 12, borderRadius: 8, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border },
  cancelBtnText: { fontWeight: "700", fontSize: 15, color: colors.text },

  textInput: { backgroundColor: colors.background, color: colors.text, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  inputLabel: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  iconsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center", paddingTop: 8 },
  iconBox: { width: 50, height: 50, backgroundColor: colors.background, borderRadius: 8, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.border },
  iconBoxActive: { borderColor: colors.primary, backgroundColor: "rgba(130,87,229,0.2)" },
  iconBoxDisabled: { opacity: 0.3 },

  avatarGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 16, marginTop: 12 },
  avatarOption: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: "transparent" },
  avatarOptionSelected: { borderColor: colors.primary },
  avatarOptionImg: { width: 60, height: 60, borderRadius: 30 },
});
