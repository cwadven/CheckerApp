import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { answerSubmitService } from '../../api/services/answerSubmitService';
import { AlertModal } from '../common/AlertModal';
import type { AnswerSubmitResponse } from '../../types/answer';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';
type DocumentPickerAsset = DocumentPicker.DocumentPickerAsset;

type EnhancedDocumentPickerAsset = DocumentPickerAsset & {
  isExisting?: boolean;
};

interface Question {
  id: number;
  title: string;
  description: string;
  answer_submit_with_text: boolean;
  answer_submit_with_file: boolean;
  question_files?: Array<{
    id: number;
    file: string;
  }>;
  my_answers?: {
    id: number;
    answer: string;
    files: {
      id: number;
      name: string;
      url: string;
    }[];
  }[];
}

interface AnswerSubmitModalProps {
  visible: boolean;
  onClose: () => void;
  question: Question;
  onSubmit: (response: AnswerSubmitResponse) => void;
  mapPlayMemberId?: number;
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
  mapPlayMemberId,
}) => {
  const [answer, setAnswer] = useState('');
  const [files, setFiles] = useState<EnhancedDocumentPickerAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    style: {
      titleColor: string;
      icon: string;
    };
  }>({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
    style: {
      titleColor: '#666',
      icon: '!',
    },
  });
  const [errors, setErrors] = useState({
    answer: false,
    files: false,
  });

  // 초기 상태를 저장할 state 추가
  const [initialAnswer, setInitialAnswer] = useState('');
  const [initialFiles, setInitialFiles] = useState<EnhancedDocumentPickerAsset[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 데이터가 로드되었을 때 초기 상태 저장
  useEffect(() => {
    if (visible && question?.my_answers) {
      const latestAnswer = question.my_answers[0];
      const currentAnswer = latestAnswer?.answer || '';
      const currentFiles = latestAnswer?.files 
        ? latestAnswer.files.map(file => ({
            uri: file.url,
            name: file.name,
            mimeType: 'application/octet-stream',
            size: 0,
            isExisting: true,
          }))
        : [];
      setAnswer(currentAnswer);
      setFiles(currentFiles);
      setInitialAnswer(currentAnswer);
      setInitialFiles(currentFiles);
      setIsLoaded(true);
    } else if (!visible) {
      setIsLoaded(false);
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
    if (!question || !isLoaded) return;

    // 변경사항 체크
    const hasChanges = 
      answer !== initialAnswer || 
      files.length !== initialFiles.length;

    if (!hasChanges) {
      setAlertConfig({
        visible: true,
        title: '알림',
        message: '변경된 내용이 없습니다.',
        style: {
          titleColor: '#666',
          icon: '⚠️',
        },
        onConfirm: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
        },
      });
      return;
    }

    let response: AnswerSubmitResponse | undefined;
    try {
      setIsSubmitting(true);
      
      setErrors({ answer: false, files: false });

      const newErrors = {
        answer: question.answer_submit_with_text && !answer.trim(),
        files: question.answer_submit_with_file && files.length === 0,
      };

      if (newErrors.answer || newErrors.files) {
        setErrors(newErrors);
        return;
      }

      response = await answerSubmitService.submitAnswer(
        question.id,
        mapPlayMemberId,
        question.answer_submit_with_text ? answer : null,
        question.answer_submit_with_file ? files : null
      );

      const alertStyles = {
        success: { color: '#4CAF50', icon: '✓' },
        failed: { color: '#dc3545', icon: '✕' },
        pending: { color: '#2196F3', icon: '⟳' },
        default: { color: '#666', icon: '!' },
      };

      const alertTitles = {
        success: '정답입니다!',
        failed: '틀렸습니다',
        pending: '검토 중',
        default: '알림',
      };

      const status = response.data.status as keyof typeof alertStyles;
      const alertStyle = alertStyles[status] || alertStyles.default;
      const alertTitle = alertTitles[status] || alertTitles.default;

      const defaultMessages = {
        success: '축하합니다! 다음 단계로 진행하세요.',
        failed: '다시 한 번 시도해보세요.',
        pending: '답변이 제출되었습니다. 검토 후 결과를 알려드리겠습니다.',
        default: '답변이 제출되었습니다.',
      };

      setAlertConfig({
        visible: true,
        title: alertTitle,
        message: response.data.feedback || defaultMessages[status] || defaultMessages.default,
        onConfirm: async () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          if (response) {
            await onSubmit(response);
            if (status === 'pending' || status === 'success') {
              onClose();
            }
          }
        },
        style: {
          titleColor: alertStyle.color,
          icon: alertStyle.icon,
        },
      });
    } catch (error) {
      const apiError = error as ApiError;
      setAlertConfig({
        visible: true,
        title: '오류',
        message: formatErrorMessage(apiError),
        onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false })),
        style: {
          titleColor: '#dc3545',
          icon: '✕',
        },
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
        <Modal 
          visible={visible} 
          animationType="fade" 
          transparent
          statusBarTranslucent
          onRequestClose={onClose}
        >
          <View style={[
            StyleSheet.absoluteFill,
            styles.overlay,
          ]}>
            <View style={styles.modalContainer}>
              <Text style={styles.title}>{question.title}</Text>
              <Text style={styles.description}>
                {question.description?.replace(/\\n/g, '\n')}
              </Text>

              {question.question_files && question.question_files.length > 0 && (
                <View style={styles.referenceSection}>
                  <Text style={styles.sectionTitle}>참고 자료</Text>
                  {question.question_files.map((file) => (
                    <Pressable
                      key={file.id}
                      style={styles.referenceItem}
                      onPress={() => Linking.openURL(file.file)}
                    >
                      <Ionicons name="document-outline" size={20} color="#2E5AAC" />
                      <Text style={styles.referenceText} numberOfLines={1}>
                        {file.file}
                      </Text>
                      <Ionicons name="open-outline" size={20} color="#666" />
                    </Pressable>
                  ))}
                </View>
              )}

              <ScrollView style={styles.contentContainer}>
                {question.answer_submit_with_text && (
                  <View style={styles.answerSection}>
                    <Text style={styles.sectionTitle}>
                      답변 작성
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        errors.answer && styles.errorInput
                      ]}
                      multiline
                      value={answer}
                      onChangeText={(text) => {
                        setAnswer(text);
                        setErrors(prev => ({ ...prev, answer: false }));
                      }}
                      placeholder="답변을 입력해주세요"
                    />
                    {errors.answer && (
                      <Text style={styles.errorText}>답변을 입력해주세요</Text>
                    )}
                  </View>
                )}

                {question.answer_submit_with_file && (
                  <View style={styles.fileSection}>
                    <Text style={styles.sectionTitle}>
                      파일 첨부
                      <Text style={styles.required}> *</Text>
                    </Text>
                    <TouchableOpacity 
                      style={[
                        styles.fileButton,
                        errors.files && styles.errorButton
                      ]}
                      onPress={handleFilePick}
                    >
                      <Text style={styles.buttonText}>파일 선택</Text>
                    </TouchableOpacity>
                    {errors.files && (
                      <Text style={styles.errorText}>파일을 첨부해주세요</Text>
                    )}

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

      <Modal 
        visible={alertConfig.visible} 
        transparent 
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      >
        <View style={styles.alertOverlay}>
          <View style={styles.alertContainer}>
            <AlertModal
              visible={alertConfig.visible}
              title={alertConfig.title}
              message={alertConfig.message}
              onConfirm={alertConfig.onConfirm}
              style={{
                titleColor: alertConfig.style.titleColor,
                icon: alertConfig.style.icon,
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1001,
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
  required: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  errorInput: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },
  errorButton: {
    backgroundColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
  },
  referenceSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  referenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  referenceText: {
    flex: 1,
    fontSize: 14,
    color: '#2E5AAC',
    marginLeft: 8,
    marginRight: 8,
  },
  alertOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  alertContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'transparent',
    position: 'relative',
    zIndex: 3000,
    elevation: 8,
    pointerEvents: 'box-none',
  },
});

export default AnswerSubmitModal; 