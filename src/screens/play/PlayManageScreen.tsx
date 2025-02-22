import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
  Modal,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../../types/navigation';
import { AlertModal } from "../../components/common/AlertModal";
import { apiClient } from '../../api/client';
import { ApiError } from '../../api/client';

const MenuItem = ({ 
  icon, 
  text, 
  onPress, 
  color = '#333',
  style
}: {
  icon: string;
  text: string;
  onPress: () => void;
  color?: string;
  style?: any;
}) => (
  <Pressable 
    style={({ pressed }) => [
      styles.menuItem,
      style,
      pressed && styles.menuItemPressed
    ]}
    android_ripple={{
      color: 'rgba(0, 0, 0, 0.1)',
      borderless: false
    }}
    onPress={onPress}
  >
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[styles.menuText, { color }]}>{text}</Text>
    <Ionicons name="chevron-forward" size={24} color={color} />
  </Pressable>
);

export const PlayManageScreen = ({ 
  route, 
  navigation 
}: RootStackScreenProps<'PlayManage'>) => {
  const { play } = route.params;
  const isAdmin = play.role === 'admin';
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLeaveModalVisible, setLeaveModalVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleMenuPress = (feature: string) => {
    setAlertMessage(`${feature} 기능은 현재 개발 중입니다.`);
    setAlertVisible(true);
  };

  const handleLeavePlay = async () => {
    try {
      setIsLeaving(true);
      const response = await apiClient.post<{ status_code: string }>(
        `/v1/play/${play.id}/member/self-deactivate`
      );

      if (response.status_code === 'success') {
        navigation.navigate('MapDetail', {
          mapId: play.map_id,
          shouldRemovePlay: true,
          removedPlayId: play.id
        });
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setAlertMessage(error.message || "탈퇴 처리 중 오류가 발생했습니다");
        setAlertVisible(true);
      }
    } finally {
      setIsLeaving(false);
      setLeaveModalVisible(false);
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
        <Text style={styles.title}>{play.title}</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <MenuItem 
            icon="people-outline" 
            text="플레이 회원 보기" 
            onPress={() => handleMenuPress('플레이 회원 보기')}
          />

          {isAdmin && (
            <>
              <MenuItem 
                icon="mail-outline" 
                text="초대 관리" 
                onPress={() => navigation.navigate('PlayInvites', { play })}
              />
              <MenuItem 
                icon="swap-horizontal-outline" 
                text="관리자 위임" 
                onPress={() => handleMenuPress('관리자 위임')}
              />
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>스타일 바꾸기</Text>
          <MenuItem 
            icon="color-palette-outline" 
            text="테마 설정" 
            onPress={() => handleMenuPress('테마 설정')}
          />
          <MenuItem 
            icon="text-outline" 
            text="이름 변경" 
            onPress={() => handleMenuPress('이름 변경')}
          />
        </View>

        <View style={styles.footer}>
          <MenuItem 
            icon="exit-outline" 
            text="플레이 탈퇴" 
            color="#dc3545"
            style={styles.leaveButton}
            onPress={() => setLeaveModalVisible(true)}
          />
        </View>
      </ScrollView>

      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setAlertVisible(false)}
        >
          <View style={styles.modalContent}>
            <AlertModal
              visible={alertVisible}
              title="개발 중"
              message={alertMessage}
              onConfirm={() => setAlertVisible(false)}
              confirmText="확인"
            />
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={isLeaveModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setLeaveModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setLeaveModalVisible(false)}
        >
          <Pressable style={styles.modalContent} onPress={e => e.stopPropagation()}>
            <AlertModal
              visible={isLeaveModalVisible}
              title="플레이 탈퇴"
              message={`정말 탈퇴하시겠습니까?\n\n지금까지 작업했던 모든 기록이 삭제되며 복구할 수 없습니다.`}
              onConfirm={handleLeavePlay}
              onCancel={() => setLeaveModalVisible(false)}
              confirmText={isLeaving ? "탈퇴 중..." : "탈퇴하기"}
              confirmButtonColor="#dc3545"
              cancelText="취소"
              showCancel
            />
          </Pressable>
        </Pressable>
      </Modal>
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
    color: '#333',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 32,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'white',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  footer: {
    marginTop: 'auto',
    backgroundColor: '#fff5f5',
  },
  leaveButton: {
    backgroundColor: 'white',
    borderBottomWidth: 0,
  },
  menuItemPressed: {
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    color: '#666',
    marginLeft: 16,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '80%',
    maxWidth: 320,
  },
}); 