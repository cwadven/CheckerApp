import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
type DocumentPickerAsset = DocumentPicker.DocumentPickerAsset;

interface AnswerSubmitModalProps {
  visible: boolean;
  onClose: () => void;
  question: {
    id: number;
    title: string;
    description: string;
    answer_submit_with_text: boolean;
    answer_submit_with_file: boolean;
  };
  onSubmit: (answer: string, files: DocumentPickerAsset[]) => void;
}

export const AnswerSubmitModal: React.FC<AnswerSubmitModalProps> = ({
  visible,
  onClose,
  question,
  onSubmit,
}) => {
  const [answer, setAnswer] = useState('');
  const [files, setFiles] = useState<DocumentPickerAsset[]>([]);

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true
      });
      if (!result.canceled && result.assets) {
        setFiles([...files, ...result.assets]);
      }
    } catch (err) {
      console.error('파일 선택 중 오류 발생:', err);
    }
  };

  const handleSubmit = () => {
    onSubmit(answer, files);
    setAnswer('');
    setFiles([]);
    onClose();
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{question.title}</Text>
          <Text style={styles.description}>{question.description}</Text>

          <ScrollView style={styles.contentContainer}>
            {question.answer_submit_with_text && (
              <View style={styles.answerSection}>
                <Text style={styles.sectionTitle}>답변 작성</Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  value={answer}
                  onChangeText={setAnswer}
                  placeholder="답변을 입력해주세요"
                />
              </View>
            )}

            {question.answer_submit_with_file && (
              <View style={styles.fileSection}>
                <Text style={styles.sectionTitle}>파일 첨부</Text>
                <TouchableOpacity 
                  style={styles.fileButton}
                  onPress={handleFilePick}
                >
                  <Text style={styles.buttonText}>파일 선택</Text>
                </TouchableOpacity>

                {files.map((file, index) => (
                  <View key={index} style={styles.fileItem}>
                    <Text numberOfLines={1}>{file.name}</Text>
                    <TouchableOpacity onPress={() => removeFile(index)}>
                      <Text style={styles.removeText}>삭제</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={onClose}
            >
              <Text style={styles.buttonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>제출</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  contentContainer: {
    maxHeight: '70%',
  },
  answerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  fileSection: {
    marginBottom: 20,
  },
  fileButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    marginBottom: 5,
  },
  removeText: {
    color: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AnswerSubmitModal; 