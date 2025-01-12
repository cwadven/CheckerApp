import React, { useState, useEffect } from 'react';
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
import { answerSubmitService } from '../../api/services/answerSubmitService';
import { AlertModal } from '../common/AlertModal';
type DocumentPickerAsset = DocumentPicker.DocumentPickerAsset;

type EnhancedDocumentPickerAsset = DocumentPickerAsset & {
  isExisting?: boolean;
};

interface AnswerSubmitResponse {
  status_code: string;
  data: {
    member_answer_id: number;
    answer: string;
    submitted_at: string;
    validation_type: string;
    status: string;
    feedback: string;
    going_to_in_progress_node_ids: number[];
    completed_node_ids: number[];
  };
}

interface AnswerSubmitModalProps {
  visible: boolean;
  onClose: () => void;
  question: {
    id: number;
    title: string;
    description: string;
    answer_submit_with_text: boolean;
    answer_submit_with_file: boolean;
    my_answers?: {
      id: number;
      answer: string;
      files: {
        id: number;
        name: string;
        url: string;
      }[];
    }[];
  };
  onSubmit: (response: AnswerSubmitResponse) => void;
}

interface ApiError {
  message: string;
  status_code: string;
  errors?: {
    answer?: string[];
    files?: string[];
  };
}

const formatErrorMessage = (apiError: ApiError): string => {
  const errorDetails: string[] = [];
  
  if (apiError.errors?.answer) {
    errorDetails.push('답변 오류:');
    errorDetails.push(...apiError.errors.answer.map(err => `• ${err}`));
  }
  
  if (apiError.errors?.files) {
    errorDetails.push('파일 오류:');
    errorDetails.push(...apiError.errors.files.map(err => `• ${err}`));
  }
  
  return [
    apiError.message,
    ...errorDetails
  ].join('\n');
};

export const AnswerSubmitModal: React.FC<AnswerSubmitModalProps> = ({
  visible,
  onClose,
  question,
  onSubmit,
}) => {
  const [answer, setAnswer] = useState('');
  const [files, setFiles] = useState<EnhancedDocumentPickerAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    if (!visible) {
      setAnswer('');
      setFiles([]);
    } else if (question?.my_answers && question.my_answers.length > 0) {
      const latestAnswer = question.my_answers[question.my_answers.length - 1];
      setAnswer(latestAnswer.answer || '');
      
      if (latestAnswer.files) {
        const existingFiles: EnhancedDocumentPickerAsset[] = latestAnswer.files.map(file => ({
          uri: file.url,
          name: file.name,
          mimeType: 'application/octet-stream',
          size: 0,
          isExisting: true,
        }));
        setFiles(existingFiles);
      }
    }
  }, [visible, question?.my_answers]);

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

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (
        (question.answer_submit_with_text && !answer.trim()) ||
        (question.answer_submit_with_file && files.length === 0)
      ) {
        setAlertConfig({
          visible: true,
          title: '입력 오류',
          message: '필요한 모든 항목을 입력해주세요.',
          onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
        });
        return;
      }

      const response = await answerSubmitService.submitAnswer(
        question.id,
        question.answer_submit_with_text ? answer : null,
        question.answer_submit_with_file ? files : null
      );

      onSubmit(response);

      setAlertConfig({
        visible: true,
        title: '',
        message: response.data.feedback || '답변이 성공적으로 제출되었습니다.',
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          setAnswer('');
          setFiles([]);
          onClose();
        },
      });
    } catch (error) {
      const apiError = error as ApiError;
      setAlertConfig({
        visible: true,
        title: '오류',
        message: formatErrorMessage(apiError),
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <>
      {question && (
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
                    <Text style={styles.sectionTitle}>파일 첨부(필수)</Text>
                    <TouchableOpacity 
                      style={styles.fileButton}
                      onPress={handleFilePick}
                    >
                      <Text style={styles.buttonText}>파일 선택</Text>
                    </TouchableOpacity>

                    {files.map((file, index) => (
                      <View key={index} style={styles.fileItem}>
                        <View style={styles.fileInfo}>
                          <Text numberOfLines={1} style={styles.fileName}>
                            {file.name}
                          </Text>
                          {(file as any).isExisting && (
                            <Text style={styles.existingFileLabel}>기존 파일</Text>
                          )}
                        </View>
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
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.button, 
                    styles.submitButton,
                    isSubmitting && styles.disabledButton
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  <Text style={styles.buttonText}>
                    {isSubmitting ? '제출 중...' : '제출'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <AlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
      />
    </>
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
  disabledButton: {
    opacity: 0.5,
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileName: {
    flex: 1,
  },
  existingFileLabel: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e9ecef',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default AnswerSubmitModal; 