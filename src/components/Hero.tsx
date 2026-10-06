import { View, Image, Text, StyleSheet } from "react-native";
import { GridBackdrop } from "./GridBackdrop";
import { Fade } from "./Fade";
import { RiseItem } from "./RiseItem";

export function Hero({ wide }: { wide: boolean }) {
  const cardShadow = {
    shadowColor: '#0d2056',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  };

  return (
    <View
      className={
        wide
          ? 'relative flex-[1.15] justify-center overflow-hidden bg-canvas px-14 py-8'
          : 'relative overflow-hidden bg-canvas px-6 pb-2 pt-6'
      }>
      <GridBackdrop />
      <View className="relative z-10">
        <RiseItem index={0}>
          <View className="w-full flex-row items-center justify-center">
            <Image
              source={require('../../assets/brand/logo-fretou.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Fretou Brasil"
            />
          </View>
        </RiseItem>
        <View className={wide ? 'mt-8 max-w-xl gap-5' : 'my-7 max-w-xl gap-3.5'}>
          <RiseItem index={1}>
            <Text className="text-sm font-bold uppercase tracking-widest text-brand">
              Boas-vindas a Fretou!
            </Text>
          </RiseItem>
          <RiseItem index={2}>
            <Text className="text-[34px] font-bold leading-[38px] tracking-tight text-navy">
              Acesse sua operação com <Text className="text-brand">agilidade</Text>
            </Text>
          </RiseItem>
          <RiseItem index={3}>
            <Text className="max-w-md text-base leading-6 text-ink">
              Conte com a expertise da Fretou Brasil para acompanhar cargas, rotas e parceiros em
              todo o território nacional.
            </Text>
          </RiseItem>
          <RiseItem index={4}>
            <View
              className="mt-1 flex-row items-center gap-3.5 self-start rounded-2xl bg-white px-4 py-3.5"
              style={cardShadow}>
              <Image source={require('../../assets/brand/chevron.png')} style={styles.chevron} />
              <Text className="text-[13px] font-bold leading-tight tracking-wide text-navy">
                PRECISOU?{'\n'}FRETOU!
              </Text>
            </View>
          </RiseItem>
        </View>
      </View>
      <Fade />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 218,
    height: 69,
    borderWidth: 5,
    borderColor: 'white',
    borderStyle: 'solid',
    borderRadius: 10,
  },
  chevron: {
    width: 28,
    height: 28,
  },
});