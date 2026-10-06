import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { Field } from './Field';
import { API_URL, saveToken } from '../lib/api';
import { PasswordVisibilityIcon } from './PasswordVisibilityIcon';
import { RiseItem } from './RiseItem';

export function FormPanel({
  wide,
  showPassword,
  onTogglePassword,
  cpfFocused,
  passwordFocused,
  onCpfFocus,
  onCpfBlur,
  onPasswordFocus,
  onPasswordBlur,
  onLoggedIn,
  enterFrom = 5,
}: {
  wide: boolean;
  showPassword: boolean;
  onTogglePassword: () => void;
  cpfFocused: boolean;
  passwordFocused: boolean;
  onCpfFocus: () => void;
  onCpfBlur: () => void;
  onPasswordFocus: () => void;
  onPasswordBlur: () => void;
  onLoggedIn: () => void;
  enterFrom?: number;
}) {
  const cardShadow = {
    shadowColor: '#0d2056',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  };
  const [cpf, setCpf] = useState('');
  const [erro, setErro] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);

  function formatCpfInput(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function mensagemErro(payload: unknown, status: number) {
    if (
      payload &&
      typeof payload === 'object' &&
      'erro' in payload &&
      typeof payload.erro === 'string'
    ) {
      return payload.erro;
    }
    if (status === 401) return 'CPF ou senha inválidos.';
    if (status === 503) return 'Serviço indisponível no momento. Tente novamente.';
    return 'Não foi possível entrar. Tente novamente.';
  }

  async function login() {
    setErro('');

    const cpfDigitos = cpf.replace(/\D/g, '');
    if (cpfDigitos.length !== 11) {
      setErro('Informe um CPF com 11 dígitos.');
      return;
    }
    if (!password) {
      setErro('Informe a senha.');
      return;
    }

    setSending(true);
    try {
      const resposta = await fetch(`${API_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cpfDigitos, password }),
      });
      const payload: unknown = await resposta.json().catch(() => null);

      if (!resposta.ok) {
        setErro(mensagemErro(payload, resposta.status));
        return;
      }

      const token =
        payload &&
          typeof payload === 'object' &&
          'token' in payload &&
          typeof payload.token === 'string'
          ? payload.token
          : '';

      if (!token) {
        setErro('Resposta de autenticação incompleta.');
        return;
      }

      saveToken(token);
      onLoggedIn();
    } catch {
      setErro('Sem conexão, verifique sua conexão com a internet.');
    } finally {
      setSending(false);
    }
  }

  return (
    <View
      className={
        wide
          ? 'relative flex-[0.85] items-center justify-center overflow-hidden bg-brand px-8 py-10'
          : 'items-center justify-center px-5 pb-8 pt-2'
      }>
      <View
        className="z-10 w-full max-w-[420px] rounded-[20px] bg-white px-8 pb-7 pt-9"
        style={wide ? styles.wideCardShadow : cardShadow}>
        <RiseItem index={enterFrom}>
          <Text className="text-sm font-bold uppercase tracking-widest text-brand">
            Área restrita
          </Text>
        </RiseItem>
        <RiseItem index={enterFrom + 1}>
          <Text className="mt-2 text-[28px] font-bold leading-tight tracking-tight text-navy">
            Entrar no sistema
          </Text>
        </RiseItem>
        <RiseItem index={enterFrom + 2}>
          <Text className="mb-7 mt-2.5 text-[15px] leading-5 text-muted">
            Use o CPF e a senha cadastrados para continuar.
          </Text>
        </RiseItem>
        <View className="gap-4">
          <RiseItem index={enterFrom + 3}>
            <Field label="CPF">
            <TextInput
              className={`h-[52px] rounded-xl border bg-white px-4 text-base text-navy ${cpfFocused ? 'border-brand' : 'border-line'
                }`}
              style={styles.input}
              inputMode="numeric"
              autoComplete="username"
              placeholder="000.000.000-00"
              placeholderTextColor="#93a0bb"
              keyboardType="number-pad"
              maxLength={14}
              value={cpf}
              onChangeText={(value) => setCpf(formatCpfInput(value))}
              onFocus={onCpfFocus}
              onBlur={onCpfBlur}
            />
            </Field>
          </RiseItem>
          <RiseItem index={enterFrom + 4}>
            <Field label="Senha">
            <View>
              <TextInput
                className={`h-[52px] rounded-xl border bg-white px-4 pr-12 text-base text-navy ${passwordFocused ? 'border-brand' : 'border-line'
                  }`}
                style={styles.input}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                placeholderTextColor="#93a0bb"
                value={password}
                onChangeText={setPassword}
                onFocus={onPasswordFocus}
                onBlur={onPasswordBlur}
              />
              <Pressable
                className="absolute bottom-0 right-2 top-0 w-9 items-center justify-center rounded-lg"
                accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onPress={onTogglePassword}>
                <PasswordVisibilityIcon crossed={showPassword} />
              </Pressable>
            </View>
            </Field>
          </RiseItem>
          {erro ? (
            <Text className="rounded-xl bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800">
              {erro}
            </Text>
          ) : null}
          <RiseItem index={enterFrom + 5}>
            <Pressable
              className="mt-1 h-[52px] items-center justify-center rounded-xl bg-brand disabled:opacity-70"
              disabled={sending}
              onPress={() => void login()}>
              <Text className="text-base font-bold text-white">
                {sending ? 'Entrando...' : 'Entrar'}
              </Text>
            </Pressable>
          </RiseItem>
        </View>
        <RiseItem index={enterFrom + 6}>
          <Text className="mt-4 text-center text-[13px] text-faint">
            Suas informações estão seguras
          </Text>
        </RiseItem>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    paddingVertical: 0,
  },
  wideCardShadow: {
    shadowColor: '#081238',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.22,
    shadowRadius: 30,
    elevation: 12,
  },
});