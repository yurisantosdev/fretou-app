import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { fetchProfile, readToken, type Profile } from '../lib/api';
import { CardModule } from '@/components/CardModule';
import { RiseItem } from '@/components/RiseItem';
import { TrafficSignIcon } from '@/components/icons/TrafficSignIcon';
import { TruckIcon } from '@/components/icons/TruckIcon';
import { Main } from '@/components/main';

export function Home({
  onLogout,
  onOpenModule,
}: {
  onLogout: () => void;
  onOpenModule: (href: string) => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const modules = [
    {
      title: "Viagens",
      description: "Gerencie as viagens do sistema",
      icon: <TrafficSignIcon />,
      color: "bg-brand",
      href: "/modules/trips",
      visible: () => true,
    },
    {
      title: "Veículos",
      description: "Gerencie os veículos do sistema",
      icon: <TruckIcon />,
      color: "bg-brand",
      href: "/modules/vehicles",
      visible: (profile: Profile) => !profile.driver || profile.thirdParty === true,
    },
  ];

  useEffect(() => {
    const token = readToken();
    if (!token) return;
    void fetchProfile(token).then(setProfile);
  }, []);

  return (
    <Main onLogout={onLogout}>
      <View className="z-10 max-w-2xl px-6 pt-10">
        <RiseItem index={0}>
          <Text className="text-sm font-bold uppercase tracking-widest text-brand">Boas-vindas</Text>
        </RiseItem>
        <RiseItem index={1}>
          <Text className="mt-2 text-3xl font-bold tracking-tight text-navy">
            Olá{profile?.name ? `, ${profile.name}` : ''}
          </Text>
        </RiseItem>
        <RiseItem index={2}>
          <Text className="mt-3 text-base leading-6 text-ink">
            Escolha um módulo para continuar a operação.
          </Text>
        </RiseItem>
      </View>

      <View className="z-10 max-w-2xl px-6 pt-10">
        <RiseItem index={3}>
          <Text className="text-sm font-bold uppercase tracking-widest text-brand">Boas-vindas</Text>
        </RiseItem>
        <RiseItem index={4}>
          <Text className="mt-2 text-2xl font-bold tracking-tight text-navy">Sua Operação</Text>
        </RiseItem>
        <View className="mt-5 gap-4">
          {(profile ? modules.filter((module) => module.visible(profile)) : modules.slice(0, 1)).map(
            (module, index) => (
              <RiseItem key={module.href} index={5 + index}>
                <CardModule
                  title={module.title}
                  description={module.description}
                  icon={module.icon}
                  color={module.color}
                  href={module.href}
                  onPress={() => onOpenModule(module.href)}
                />
              </RiseItem>
            )
          )}
        </View>
      </View>
    </Main>
  );
}
