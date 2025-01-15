import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

interface RouteParams {
  nodeId: number;
  questionId: number;
  title: string;
  description: string;
  answer_types: {
    text: boolean;
    file: boolean;
  };
}

// DocumentPicker의 asset 타입 정의
interface DocumentPickerAsset {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
}

export const QuestionSolveScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { nodeId, title, description, answer_types } =
    route.params as RouteParams;

  const [textAnswer, setTextAnswer] = useState("");
  const [files, setFiles] = useState<Array<{ name: string; uri: string }>>([]);

  const handleFileSelect = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: "*/*",
      });

      if (!result.canceled) {
        setFiles((prev) => [
          ...prev,
          ...result.assets.map((asset: DocumentPickerAsset) => ({
            name: asset.name,
            uri: asset.uri,
          })),
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveFile = (uri: string) => {
    setFiles((prev) => prev.filter((file) => file.uri !== uri));
  };

  const handleSubmit = async () => {
    // TODO: API 호출
    console.log({ textAnswer, files });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Node 컨텍스트 */}
        <View style={styles.nodeContext}>
          <Text style={styles.nodeTitle}>Node: React 기초</Text>
          <Text style={styles.questionTitle}>{title}</Text>
        </View>

        {/* 문제 설명 */}
        <View style={styles.questionSection}>
          <Text style={styles.sectionTitle}>문제 설명</Text>
          <Text style={styles.description}>
            {description?.replace(/\\n/g, '\n')}
          </Text>
        </View>

        {/* 답변 입력 */}
        {answer_types.text && (
          <View style={styles.answerSection}>
            <Text style={styles.sectionTitle}>답변 작성</Text>
            <TextInput
              style={styles.textInput}
              multiline
              value={textAnswer}
              onChangeText={setTextAnswer}
              placeholder="답변을 입력하세요"
            />
          </View>
        )}

        {/* 파일 업로드 */}
        {answer_types.file && (
          <View style={styles.fileSection}>
            <Text style={styles.sectionTitle}>파일 첨부</Text>
            <Pressable style={styles.fileButton} onPress={handleFileSelect}>
              <Ionicons name="cloud-upload" size={24} color="#2196F3" />
              <Text style={styles.fileButtonText}>파일 선택</Text>
            </Pressable>
            {files.map((file) => (
              <View key={file.uri} style={styles.fileItem}>
                <Ionicons name="document" size={20} color="#666" />
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Pressable onPress={() => handleRemoveFile(file.uri)}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 제출 버튼 */}
      <View style={styles.footer}>
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>답변 제출</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 8,
  },
  headerRight: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  nodeContext: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  nodeTitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  questionSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  answerSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  fileSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  fileButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#2196F3",
    borderRadius: 8,
    gap: 8,
  },
  fileButtonText: {
    color: "#2196F3",
    fontSize: 16,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
