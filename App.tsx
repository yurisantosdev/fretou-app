import './global.css';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoginScreen } from './src/components/LoginScreen';
import { Home } from './src/home/page';
import { Trips } from './src/modules/trips/page';
import { Vehicles } from './src/modules/vehicles/page';

type Screen = 'login' | 'home' | 'trips' | 'vehicles';

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');

  function openModule(href: string) {
    if (href === '/modules/trips') setScreen('trips');
    if (href === '/modules/vehicles') setScreen('vehicles');
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {screen === 'home' ? (
        <Home onLogout={() => setScreen('login')} onOpenModule={openModule} />
      ) : screen === 'trips' ? (
        <Trips onLogout={() => setScreen('login')} onBack={() => setScreen('home')} />
      ) : screen === 'vehicles' ? (
        <Vehicles onLogout={() => setScreen('login')} onBack={() => setScreen('home')} />
      ) : (
        <LoginScreen onLoggedIn={() => setScreen('home')} />
      )}
    </SafeAreaProvider>
  );
}
