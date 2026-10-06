import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormPanel } from './FormPanel';
import { Hero } from './Hero';

export function LoginScreen({ onLoggedIn }: { onLoggedIn: () => void }) {
  const { width } = useWindowDimensions();
  const wide = width >= 1024;
  const [showPassword, setShowPassword] = useState(false);
  const [cpfFocused, setCpfFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-canvas" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          className="flex-1"
          contentContainerStyle={wide ? styles.wideContent : styles.stackedContent}
          keyboardShouldPersistTaps="handled">
          <Hero wide={wide} />
          <FormPanel
            wide={wide}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((current) => !current)}
            cpfFocused={cpfFocused}
            passwordFocused={passwordFocused}
            onCpfFocus={() => setCpfFocused(true)}
            onCpfBlur={() => setCpfFocused(false)}
            onPasswordFocus={() => setPasswordFocused(true)}
            onPasswordBlur={() => setPasswordFocused(false)}
            onLoggedIn={onLoggedIn}
            enterFrom={wide ? 0 : 5}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stackedContent: {
    flexGrow: 1,
  },
  wideContent: {
    flexGrow: 1,
    flexDirection: 'row',
  },
});
