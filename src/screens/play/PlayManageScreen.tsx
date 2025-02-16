import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../../types/navigation';

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
            onPress={() => navigation.navigate('PlayMembers', { play })}
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
                onPress={() => navigation.navigate('PlayTransferOwnership', { play })}
              />
            </>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>스타일 바꾸기</Text>
          <MenuItem 
            icon="color-palette-outline" 
            text="테마 설정" 
            onPress={() => navigation.navigate('PlayTheme', { play })}
          />
          <MenuItem 
            icon="text-outline" 
            text="이름 변경" 
            onPress={() => {/* TODO: 이름 변경 모달 */}}
          />
        </View>

        <View style={styles.footer}>
          <MenuItem 
            icon="exit-outline" 
            text="플레이 탈퇴" 
            color="#dc3545"
            style={styles.leaveButton}
            onPress={() => {/* TODO: 탈퇴 처리 */}}
          />
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
}); 