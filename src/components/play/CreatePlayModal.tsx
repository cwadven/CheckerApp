import React, { useState } from 'react';
import {
  View, Text, Modal, TextInput, Pressable, StyleSheet, Alert
} from 'react-native';
import { apiClient } from '../../api/client';

interface CreatePlayModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mapId: number;
}

export const CreatePlayModal = ({ visible, onClose, onSuccess, mapId }: CreatePlayModalProps) => {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [playName, setPlayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setErrorMessage(null);
      setIsLoading(true);

      if (mode === 'create') {
        if (!playName.trim()) {
          setErrorMessage('플레이 이름을 입력해주세요.');
          return;
        }
        await apiClient.post(`/v1/play/map/${mapId}`, {
          title: playName
        });
      } else {
        if (!inviteCode.trim()) {
          setErrorMessage('초대 코드를 입력해주세요.');
          return;
        }
        await apiClient.post(`/v1/play/join/${inviteCode}`);
      }

      onSuccess();
      onClose();
      setPlayName('');
      setInviteCode('');
      setMode('create');
      setErrorMessage(null);
    } catch (error: any) {
      console.log(error);
      if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          mode === 'create' 
            ? '플레이 생성에 실패했습니다.'
            : '초대 코드가 올바르지 않거나 만료되었습니다.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>새로운 플레이</Text>

          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, mode === 'create' && styles.activeTab]}
              onPress={() => setMode('create')}
            >
              <Text style={[styles.tabText, mode === 'create' && styles.activeTabText]}>
                새로 만들기
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, mode === 'join' && styles.activeTab]}
              onPress={() => setMode('join')}
            >
              <Text style={[styles.tabText, mode === 'join' && styles.activeTabText]}>
                초대 코드로 참여
              </Text>
            </Pressable>
          </View>

          {mode === 'create' ? (
            <TextInput
              style={[
                styles.input,
                errorMessage ? styles.inputError : null
              ]}
              placeholder="플레이 이름"
              value={playName}
              onChangeText={(text) => {
                setPlayName(text);
                setErrorMessage(null);
              }}
            />
          ) : (
            <TextInput
              style={[
                styles.input,
                errorMessage ? styles.inputError : null
              ]}
              placeholder="초대 코드 입력"
              value={inviteCode}
              onChangeText={(text) => {
                setInviteCode(text);
                setErrorMessage(null);
              }}
              autoCapitalize="characters"
            />
          )}

          {errorMessage && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}

          <View style={styles.buttonContainer}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
            <Pressable 
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? '처리 중...' : mode === 'create' ? '만들기' : '참여하기'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ddd',
    alignItems: 'center',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
}); 