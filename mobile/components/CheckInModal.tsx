import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Camera, Check, ImagePlus, Upload, X } from "lucide-react-native";
import {
  ApiRequestError,
  createCheckIn,
  getFeedCheckIns,
  getSessionUser,
} from "@/lib/api";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
  groupName?: string;
  onSubmitted?: () => void;
}

let lastCheckInAtByUserGroup: Record<string, string> = {};

function checkInKey(userId?: number, groupId?: string) {
  return userId && groupId ? `${userId}:${groupId}` : null;
}

function isWithinLastHour(iso: string) {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return false;
  return Date.now() - date.getTime() < 60 * 60 * 1000;
}

export function CheckInModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  onSubmitted,
}: CheckInModalProps) {
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [filename, setFilename] = useState<string | undefined>();
  const [showSuccess, setShowSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hasCheckedInThisHour, setHasCheckedInThisHour] = useState(false);

  const currentUser = getSessionUser();
  const localCheckInKey = useMemo(
    () => checkInKey(currentUser?.id, groupId),
    [currentUser?.id, groupId],
  );

  const reset = () => {
    setSubject("");
    setNote("");
    setImageUri(null);
    setMimeType("image/jpeg");
    setFilename(undefined);
    setShowSuccess(false);
  };

  useEffect(() => {
    if (!isOpen || !currentUser?.id || !groupId) return;

    const localLastCheckInAt = localCheckInKey
      ? lastCheckInAtByUserGroup[localCheckInKey]
      : null;

    if (localLastCheckInAt && isWithinLastHour(localLastCheckInAt)) {
      setHasCheckedInThisHour(true);
    } else {
      setHasCheckedInThisHour(false);
    }

    let cancelled = false;
    getFeedCheckIns(100)
      .then((items) => {
        if (cancelled) return;
        const lastCheckIn = items.find(
          (item) =>
            item.user.id === currentUser.id &&
            String(item.group?.id) === String(groupId) &&
            isWithinLastHour(item.created_at),
        );
        setHasCheckedInThisHour(Boolean(lastCheckIn));
        if (lastCheckIn && localCheckInKey) {
          lastCheckInAtByUserGroup[localCheckInKey] = lastCheckIn.created_at;
        }
      })
      .catch(() => {
        if (!cancelled && localCheckInKey) {
          const lastCheckInAt = lastCheckInAtByUserGroup[localCheckInKey];
          setHasCheckedInThisHour(Boolean(lastCheckInAt && isWithinLastHour(lastCheckInAt)));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser?.id, groupId, isOpen, localCheckInKey]);

  const setPickedAsset = (asset: ImagePicker.ImagePickerAsset) => {
    setImageUri(asset.uri);
    setMimeType(asset.mimeType || "image/jpeg");
    setFilename(asset.fileName || asset.uri.split("/").pop()?.split("?")[0]);
  };

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permissao", "Precisamos acessar suas fotos para o check-in.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPickedAsset(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permissao", "Precisamos usar a camera para comprovar o estudo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.85,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPickedAsset(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!groupId) {
      Alert.alert("Grupo", "Selecione um grupo primeiro.");
      return;
    }

    if (hasCheckedInThisHour) {
      Alert.alert(
        "Check-in ja registrado",
        "Voce ja fez check-in nesta hora neste grupo. Em outro grupo, voce ainda pode registrar.",
      );
      return;
    }

    if (!subject.trim()) {
      Alert.alert("Dados", "Informe a materia / topico.");
      return;
    }

    if (!imageUri) {
      Alert.alert("Foto obrigatoria", "Anexe a imagem comprobativa do estudo.");
      return;
    }

    try {
      setBusy(true);
      await createCheckIn(groupId, {
        topic: subject.trim(),
        note: note.trim() || undefined,
        imageUri,
        mimeType,
        filename,
      });
      if (localCheckInKey) {
        lastCheckInAtByUserGroup[localCheckInKey] = new Date().toISOString();
      }
      setHasCheckedInThisHour(true);
      setShowSuccess(true);
      onSubmitted?.();
      setTimeout(() => {
        setShowSuccess(false);
        reset();
        onClose();
      }, 1600);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Nao foi possivel registrar.";
      Alert.alert("Check-in", message);
    } finally {
      setBusy(false);
    }
  };

  const handleClose = () => {
    if (!busy) {
      reset();
      onClose();
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          {!showSuccess ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Check-in de estudo</Text>
                  {groupName && (
                    <Text style={styles.groupName}>{groupName}</Text>
                  )}
                </View>
                <Pressable onPress={handleClose}>
                  <X size={24} color="#9ca3af" />
                </Pressable>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Materia / Topico <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="ex.: Calculo I - Capitulo 5"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Foto <Text style={styles.required}>*</Text>
                  </Text>
                  {imageUri ? (
                    <View style={styles.previewBox}>
                      <Image source={{ uri: imageUri }} style={styles.previewImage} />
                      <View style={styles.previewFooter}>
                        <Check size={18} color="#22c55e" />
                        <Text style={styles.previewText} numberOfLines={1}>
                          Comprovante anexado
                        </Text>
                      </View>
                    </View>
                  ) : null}
                  <View style={styles.photoActions}>
                    <Pressable style={styles.uploadButton} onPress={takePhoto}>
                      <Camera size={20} color="#6b7280" />
                      <Text style={styles.uploadText}>Camera</Text>
                    </Pressable>
                    <Pressable style={styles.uploadButton} onPress={pickImage}>
                      <ImagePlus size={20} color="#6b7280" />
                      <Text style={styles.uploadText}>Galeria</Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Observacao (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={note}
                    onChangeText={setNote}
                    placeholder="Como foi? Algum insight?"
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <Pressable
                  style={[
                    styles.submitButton,
                    (busy || hasCheckedInThisHour) && styles.submitDisabled,
                  ]}
                  onPress={() => void handleSubmit()}
                  disabled={busy || hasCheckedInThisHour}
                >
                  <LinearGradient
                    colors={
                      hasCheckedInThisHour ? ["#94a3b8", "#64748b"] : ["#0ea5e9", "#0284c7"]
                    }
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {busy ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <View style={styles.submitContent}>
                        <Upload size={18} color="#fff" />
                        <Text style={styles.submitText}>
                          {hasCheckedInThisHour
                            ? "Check-in desta hora ja feito"
                            : "Confirmar check-in"}
                        </Text>
                      </View>
                    )}
                  </LinearGradient>
                </Pressable>
                {hasCheckedInThisHour ? (
                  <Text style={styles.cooldownHint}>
                    Limite de 1 check-in por hora apenas neste grupo.
                  </Text>
                ) : null}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Check size={48} color="#fff" />
              </View>
              <Text style={styles.successTitle}>Check-in registrado!</Text>
              <Text style={styles.successMessage}>
                Continue nesse ritmo!
              </Text>
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  groupName: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  required: {
    color: "#0ea5e9",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  photoActions: {
    flexDirection: "row",
    gap: 10,
  },
  uploadText: {
    fontSize: 14,
    color: "#6b7280",
    flexShrink: 1,
  },
  previewBox: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
  },
  previewImage: {
    width: "100%",
    height: 160,
  },
  previewFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitDisabled: {
    opacity: 0.85,
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cooldownHint: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  successIcon: {
    width: 96,
    height: 96,
    backgroundColor: "#0ea5e9",
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: "#6b7280",
  },
});
