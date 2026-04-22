import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { X, Check, Upload } from "lucide-react-native";

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupName?: string;
}

export function CheckInModal({
  isOpen,
  onClose,
  groupName,
}: CheckInModalProps) {
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSubject("");
      setNote("");
      onClose();
    }, 2000);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
          {!showSuccess ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>Study Check-In</Text>
                  {groupName && (
                    <Text style={styles.groupName}>{groupName}</Text>
                  )}
                </View>
                <Pressable onPress={onClose}>
                  <X size={24} color="#9ca3af" />
                </Pressable>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Subject / Topic <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="e.g., Calculus I - Chapter 5"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Photo <Text style={styles.required}>*</Text>
                  </Text>
                  <Pressable style={styles.uploadButton}>
                    <Upload
                      size={20}
                      color="#6b7280"
                    />
                    <Text style={styles.uploadText}>
                      Upload study session photo
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Note (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={note}
                    onChangeText={setNote}
                    placeholder="How did it go? Any insights?"
                    placeholderTextColor="#9ca3af"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>

                <Pressable style={styles.submitButton} onPress={handleSubmit}>
                  <LinearGradient
                    colors={["#0ea5e9", "#0284c7"]}
                    style={styles.submitGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.submitText}>Confirm Check-In</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </ScrollView>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Check size={48} color="#fff" />
              </View>
              <Text style={styles.successTitle}>Check-In Recorded!</Text>
              <Text style={styles.successMessage}>
                Keep the grind going! 🔥
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
  uploadText: {
    fontSize: 14,
    color: "#6b7280",
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
  submitGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
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
