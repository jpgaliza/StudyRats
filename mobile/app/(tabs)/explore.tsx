import { Image } from "expo-image";
import { Platform, StyleSheet } from "react-native";

import { Collapsible } from "@/components/ui/collapsible";
import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";

export default function TabTwoScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
          Explorar
        </ThemedText>
      </ThemedView>
      <ThemedText>
        Este aplicativo inclui código de exemplo para ajudá-lo a começar.
      </ThemedText>
      <Collapsible title="Roteamento baseado em arquivo">
        <ThemedText>
          Este aplicativo tem duas telas:{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> e{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          O arquivo de layout em{" "}
          <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{" "}
          configura o navegador de guias.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Saber mais</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Suporte para Android, iOS e web">
        <ThemedText>
          Você pode abrir este projeto no Android, iOS e na web. Para abrir a
          versão web, pressione{" "}
          <ThemedText type="defaultSemiBold">w</ThemedText> no terminal que
          executa este projeto.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Imagens">
        <ThemedText>
          Para imagens estáticas, você pode usar os sufixos{" "}
          <ThemedText type="defaultSemiBold">@2x</ThemedText> e{" "}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> para fornecer
          arquivos para diferentes densidades de tela
        </ThemedText>
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={{ width: 100, height: 100, alignSelf: "center" }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Saber mais</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Componentes de modo claro e escuro">
        <ThemedText>
          Este modelo tem suporte para modo claro e escuro. O{" "}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook
          permite que você inspecione qual é o esquema de cores atual do usuário
          e, assim, você pode ajustar as cores da interface do usuário de
          acordo.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Saber mais</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animações">
        <ThemedText>
          Este modelo inclui um exemplo de um componente animado. O{" "}
          <ThemedText type="defaultSemiBold">
            components/HelloWave.tsx
          </ThemedText>{" "}
          componente usa a poderosa{" "}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{" "}
          biblioteca para criar uma animação de mão acenando.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              O componente{" "}
              <ThemedText type="defaultSemiBold">
                components/ParallaxScrollView.tsx
              </ThemedText>{" "}
              fornece um efeito de paralaxe para a imagem do cabeçalho.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
