/**
 * ─────────────────────────────────────────────────────────────
 *  Gestão Financeira · Elisa Nunes de Freitas
 *  login.jsx — Tela de autenticação do app.
 *  Contém login, cadastro de conta e redefinição de senha,
 *  com validação inline por campo e modais dedicados.
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useContext } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Platform, KeyboardAvoidingView, SafeAreaView,
  Modal, ActivityIndicator, ScrollView, Image,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { MoneyContext } from "../contexts/GlobalState";
import { colors } from "../constants/colors";
import { useAppModal } from "../components/AppModal";

export default function Login() {
  const router = useRouter();
  const { login, register, resetPassword } = useContext(MoneyContext);
  const { showAlert, ModalComponent } = useAppModal();

  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [loginError, setLoginError]     = useState("");

  // Registro
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regName, setRegName]               = useState("");
  const [regUsername, setRegUsername]       = useState("");
  const [regPassword, setRegPassword]       = useState("");
  const [isRegLoading, setIsRegLoading]     = useState(false);
  const [regErrors, setRegErrors]           = useState({ name: "", username: "", password: "" });

  // Redefinir senha — fluxo em dois passos: 1 = informar usuário, 2 = nova senha
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStep, setResetStep]               = useState(1);
  const [resetUsername, setResetUsername]       = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [isResetLoading, setIsResetLoading]     = useState(false);
  const [resetUsernameError, setResetUsernameError] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState("");

  const handleLogin = async () => {
    setLoginError("");
    if (!username.trim() || !password.trim()) {
      setLoginError("Preencha o usuário e a senha.");
      return;
    }
    setIsLoading(true);
    try {
      await login(username.trim(), password.trim());
      router.replace("/(tabs)");
    } catch (error) {
      setLoginError(error.message || "Não foi possível conectar ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    const errs = { name: "", username: "", password: "" };
    let hasError = false;

    if (!regName.trim()) {
      errs.name = "Informe seu nome."; hasError = true;
    }
    if (!regUsername.trim()) {
      errs.username = "Informe um nome de usuário."; hasError = true;
    } else if (/\s/.test(regUsername)) {
      errs.username = "Não pode conter espaços."; hasError = true;
    }
    if (!regPassword.trim()) {
      errs.password = "Informe uma senha."; hasError = true;
    }

    setRegErrors(errs);
    if (hasError) return;

    setIsRegLoading(true);
    try {
      await register(regName.trim(), regUsername.trim(), regPassword.trim());
      setIsRegModalOpen(false);
      setUsername(regUsername.trim()); // pré-preenche o campo de login para agilizar o acesso
      setPassword("");
      setRegName(""); setRegUsername(""); setRegPassword("");
      setRegErrors({ name: "", username: "", password: "" });
      showAlert("Sucesso!", "Conta criada com sucesso. Faça login.");
    } catch (error) {
      if (error.message?.toLowerCase().includes("já está em uso")) {
        setRegErrors(prev => ({ ...prev, username: "Este nome de usuário já está em uso." }));
      } else {
        showAlert("Erro", error.message || "Não foi possível criar a conta.");
      }
    } finally {
      setIsRegLoading(false);
    }
  };

  const handleResetNext = () => {
    if (!resetUsername.trim()) {
      setResetUsernameError("Informe seu nome de usuário.");
      return;
    }
    setResetUsernameError("");
    setResetStep(2);
  };

  const handleReset = async () => {
    if (!resetNewPassword.trim()) {
      setResetPasswordError("Informe a nova senha.");
      return;
    }
    setResetPasswordError("");
    setIsResetLoading(true);
    try {
      await resetPassword(resetUsername.trim(), resetNewPassword.trim());
      setIsResetModalOpen(false);
      setResetStep(1); setResetUsername(""); setResetNewPassword("");
      showAlert("Sucesso!", "Senha redefinida. Faça login com a nova senha.");
    } catch (error) {
      if (error.message?.toLowerCase().includes("não encontrado")) {
        // Retorna ao passo 1 para que o usuário corrija o nome informado
        setResetStep(1);
        setResetUsernameError("Usuário não encontrado.");
      } else {
        showAlert("Erro", error.message || "Não foi possível redefinir a senha.");
      }
    } finally {
      setIsResetLoading(false);
    }
  };

  const closeRegModal = () => {
    setIsRegModalOpen(false);
    setRegName(""); setRegUsername(""); setRegPassword("");
    setRegErrors({ name: "", username: "", password: "" });
  };

  const closeResetModal = () => {
    setIsResetModalOpen(false);
    setResetStep(1); setResetUsername(""); setResetNewPassword("");
    setResetUsernameError(""); setResetPasswordError("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.container}>

          <Image
            source={require("../assets/images/PROSPER_1.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Usuário</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu usuário..."
                placeholderTextColor={colors.textSecondary}
                value={username}
                onChangeText={(v) => { setUsername(v); setLoginError(""); }}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite sua senha..."
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={(v) => { setPassword(v); setLoginError(""); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={22}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {loginError ? <Text style={styles.fieldError}>{loginError}</Text> : null}
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={() => setIsResetModalOpen(true)}>
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={isLoading}>
              {isLoading
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.loginBtnText}>Entrar</Text>}
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Não tem uma conta?</Text>
              <TouchableOpacity onPress={() => setIsRegModalOpen(true)}>
                <Text style={styles.registerLink}> Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* MODAL CADASTRO */}
      <Modal visible={isRegModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ width: "100%" }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Criar Conta</Text>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nome</Text>
                  <TextInput
                    style={[styles.input, regErrors.name ? styles.inputError : null]}
                    placeholder="Ex: João Silva"
                    placeholderTextColor={colors.textSecondary}
                    value={regName}
                    onChangeText={(v) => { setRegName(v); if (regErrors.name) setRegErrors(p => ({ ...p, name: "" })); }}
                  />
                  {regErrors.name ? <Text style={styles.fieldError}>{regErrors.name}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nome de Usuário</Text>
                  <TextInput
                    style={[styles.input, regErrors.username ? styles.inputError : null]}
                    placeholder="Ex: joao_silva"
                    placeholderTextColor={colors.textSecondary}
                    value={regUsername}
                    onChangeText={(v) => { setRegUsername(v); if (regErrors.username) setRegErrors(p => ({ ...p, username: "" })); }}
                    autoCapitalize="none"
                  />
                  <Text style={styles.hint}>* Sem espaços. Use letras, números ou underline.</Text>
                  {regErrors.username ? <Text style={styles.fieldError}>{regErrors.username}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Senha</Text>
                  <TextInput
                    style={[styles.input, regErrors.password ? styles.inputError : null]}
                    placeholder="Crie uma senha forte"
                    placeholderTextColor={colors.textSecondary}
                    value={regPassword}
                    onChangeText={(v) => { setRegPassword(v); if (regErrors.password) setRegErrors(p => ({ ...p, password: "" })); }}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                  {regErrors.password ? <Text style={styles.fieldError}>{regErrors.password}</Text> : null}
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity style={styles.btnCancel} onPress={closeRegModal}>
                    <Text style={styles.btnCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btnSave} onPress={handleRegister} disabled={isRegLoading}>
                    {isRegLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnSaveText}>Cadastrar</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* MODAL REDEFINIR SENHA */}
      <Modal visible={isResetModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Redefinir Senha</Text>

            {resetStep === 1 ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Qual é o seu nome de usuário?</Text>
                <TextInput
                  style={[styles.input, resetUsernameError ? styles.inputError : null]}
                  placeholder="Ex: joao_silva"
                  placeholderTextColor={colors.textSecondary}
                  value={resetUsername}
                  onChangeText={(v) => { setResetUsername(v); if (resetUsernameError) setResetUsernameError(""); }}
                  autoCapitalize="none"
                  autoFocus
                />
                {resetUsernameError ? <Text style={styles.fieldError}>{resetUsernameError}</Text> : null}
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nova senha</Text>
                <TextInput
                  style={[styles.input, resetPasswordError ? styles.inputError : null]}
                  placeholder="Nova senha..."
                  placeholderTextColor={colors.textSecondary}
                  value={resetNewPassword}
                  onChangeText={(v) => { setResetNewPassword(v); if (resetPasswordError) setResetPasswordError(""); }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoFocus
                />
                {resetPasswordError ? <Text style={styles.fieldError}>{resetPasswordError}</Text> : null}
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.btnCancel} onPress={closeResetModal}>
                <Text style={styles.btnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              {resetStep === 1 ? (
                <TouchableOpacity style={styles.btnSave} onPress={handleResetNext}>
                  <Text style={styles.btnSaveText}>Próximo</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.btnSave} onPress={handleReset} disabled={isResetLoading}>
                  {isResetLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnSaveText}>Confirmar</Text>}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {ModalComponent}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  keyboardAvoid: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center", alignItems: "center" },

  logoImage: { width: 280, height: 120, marginBottom: 32 },

  form: { width: "100%" },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 14, color: colors.text, marginBottom: 6 },

  input: {
    backgroundColor: colors.surface, color: colors.text,
    padding: 14, borderRadius: 8, borderWidth: 1,
    borderColor: colors.border, fontSize: 16,
  },
  inputError: { borderColor: colors.danger },
  fieldError: { fontSize: 12, color: colors.danger, marginTop: 4 },
  hint: { fontSize: 11, color: colors.primary, marginTop: 4 },

  passwordWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  passwordInput: { flex: 1, color: colors.text, padding: 14, fontSize: 16 },
  eyeIcon: { padding: 14 },

  forgotPassword: { alignSelf: "flex-end", marginBottom: 24 },
  forgotPasswordText: { fontSize: 12, color: colors.primary },

  loginBtn: { backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 8, alignItems: "center", marginBottom: 20 },
  loginBtnText: { fontWeight: "700", fontSize: 16, color: "#FFF" },

  registerRow: { flexDirection: "row", justifyContent: "center" },
  registerText: { fontSize: 14, color: colors.textSecondary },
  registerLink: { fontWeight: "700", fontSize: 14, color: colors.primary },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: colors.border },
  modalTitle: { fontWeight: "700", fontSize: 18, color: colors.text, marginBottom: 20, textAlign: "center" },
  modalFooter: { flexDirection: "row", gap: 12, marginTop: 12 },
  btnCancel: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, minHeight: 48 },
  btnCancelText: { fontWeight: "700", color: colors.text },
  btnSave: { flex: 1, padding: 14, borderRadius: 8, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", minHeight: 48 },
  btnSaveText: { fontWeight: "700", color: "#FFF" },
});
