import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  TextInput,
  Platform,
  Alert,
  Clipboard,
  TouchableOpacity,
  ToastAndroid
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { RootStackScreenProps } from '../../types/navigation';
import { apiClient } from '../../api/client';

interface InviteCode {
  id: number;
  map_play_id: number;
  code: string;
  created_by_id: number;
  max_uses: number | null;
  current_uses: number;
  expired_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface InviteCodeResponse {
  status_code: string;
  data: InviteCode;
}

interface InviteCodesResponse {
  status_code: string;
  invite_codes: InviteCode[];  // data 없이 바로 invite_codes
}

export const PlayInviteManageScreen = ({ 
  route, 
  navigation 
}: RootStackScreenProps<'PlayInvites'>) => {
  const { play } = route.params;
  const [maxUses, setMaxUses] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expireDate, setExpireDate] = useState<Date | null>(null);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  const fetchInviteCodes = async () => {
    try {
      setIsLoadingCodes(true);
      console.log('Fetching invite codes for play:', play.id);
      
      const response = await apiClient.get<InviteCodesResponse>(
        `/v1/play/${play.id}/invite-codes`
      );
      
      console.log('Full response:', response);
      console.log('Response data:', response.data);

      if (response.data.invite_codes) {
        setInviteCodes(response.data.invite_codes);
      } else {
        console.error('Invalid invite codes data:', response.data);
        setInviteCodes([]);
      }
    } catch (error) {
      console.error('초대 코드 목록 조회 실패:', error);
      Alert.alert('오류', '초대 코드 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoadingCodes(false);
    }
  };

  useEffect(() => {
    fetchInviteCodes();
  }, [play.id]);

  const handleCreateInviteCode = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiClient.post<InviteCodeResponse>(
        `/v1/play/${play.id}/invite-codes`,
        {
          max_uses: maxUses ? parseInt(maxUses) : null,
          expired_at: expireDate ? expireDate.toISOString() : null
        }
      );

      await fetchInviteCodes();
      
      setMaxUses('');
      setExpireDate(null);
      Alert.alert('성공', '초대 코드가 생성되었습니다.');
    } catch (error) {
      console.error('초대 코드 생성 실패:', error);
      Alert.alert('오류', '초대 코드 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || expireDate;
    setShowDatePicker(Platform.OS === 'ios');  // iOS는 계속 표시, Android는 닫기
    
    if (currentDate) {
      setExpireDate(currentDate);
    }
  };

  const handleCopyCode = (code: string) => {
    Clipboard.setString(code);
    if (Platform.OS === 'android') {
      ToastAndroid.show('초대 코드가 복사되었습니다', ToastAndroid.SHORT);
    } else {
      Alert.alert('복사 완료', '초대 코드가 클립보드에 복사되었습니다.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.title}>초대 관리</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.createSection}>
          <Text style={styles.sectionTitle}>새 초대 코드 만들기</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>최대 사용 횟수</Text>
            <TextInput
              style={styles.input}
              value={maxUses}
              onChangeText={setMaxUses}
              placeholder="무제한은 비워두세요"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>만료일</Text>
            <Pressable
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {expireDate ? expireDate.toLocaleDateString() : '만료일 선택 (선택사항)'}
              </Text>
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={expireDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          <Pressable
            style={[styles.createButton, isLoading && styles.createButtonDisabled]}
            onPress={handleCreateInviteCode}
            disabled={isLoading}
          >
            <Text style={styles.createButtonText}>
              {isLoading ? '생성 중...' : '초대 코드 만들기'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.codesList}>
          <Text style={styles.sectionTitle}>생성된 초대 코드</Text>
          {isLoadingCodes ? (
            <Text style={styles.loadingText}>초대 코드 목록을 불러오는 중...</Text>
          ) : inviteCodes.length > 0 ? (
            inviteCodes.map((invite) => (
              <View key={invite.id} style={styles.codeItem}>
                <TouchableOpacity 
                  style={styles.codeHeader}
                  onPress={() => handleCopyCode(invite.code)}
                >
                  <Text style={styles.codeText}>{invite.code}</Text>
                  <Ionicons name="copy-outline" size={20} color="#666" />
                </TouchableOpacity>
                <Text style={styles.codeInfo}>
                  사용 횟수: {invite.current_uses}/{invite.max_uses || '∞'}
                </Text>
                <Text style={styles.codeInfo}>
                  만료일: {invite.expired_at ? new Date(invite.expired_at).toLocaleDateString() : '무제한'}
                </Text>
                <Text style={styles.codeInfo}>
                  생성일: {new Date(invite.created_at).toLocaleDateString()}
                </Text>
                <Text style={[styles.codeInfo, !invite.is_active && styles.inactiveText]}>
                  상태: {invite.is_active ? '활성' : '비활성'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>생성된 초대 코드가 없습니다.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  createSection: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    color: '#666',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  codesList: {
    marginBottom: 24,
  },
  codeItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 8,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  codeInfo: {
    color: '#666',
    fontSize: 14,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 16,
  },
  inactiveText: {
    color: '#ccc',
  },
}); 