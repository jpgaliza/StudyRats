import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

type BackButtonProps = {
  label?: string;
};

export default function BackButton({ label = "Voltar" }: BackButtonProps) {
  const router = useRouter();

  return (
    <View style={{ marginBottom: 16 }}>
      <Pressable
        onPress={() => router.back()}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 16,
        }}
      >
        <Text style={{ fontSize: 16 }}>
          ← {label}
        </Text>
      </Pressable>
    </View>
  );
}