import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackScreenProps } from '../../types/navigation';

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

      <View style={styles.content}>
        <Pressable 
          style={styles.menuItem} 
          onPress={() => navigation.navigate('PlayMembers', { play })}
        >
          <Ionicons name="people-outline" size={24} color="#333" />
          <Text style={styles.menuText}>플레이 회원 보기</Text>
          <Ionicons name="chevron-forward" size={24} color="#666" />
        </Pressable>

        {isAdmin && (
          <>
            <Pressable 
              style={styles.menuItem}
              onPress={() => navigation.navigate('PlayInvites', { play })}
            >
              <Ionicons name="mail-outline" size={24} color="#333" />
              <Text style={styles.menuText}>초대 관리</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </Pressable>

            <Pressable 
              style={styles.menuItem}
              onPress={() => navigation.navigate('PlayTransferOwnership', { play })}
            >
              <Ionicons name="swap-horizontal-outline" size={24} color="#333" />
              <Text style={styles.menuText}>관리자 위임</Text>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </Pressable>
          </>
        )}

        <Pressable style={[styles.menuItem, styles.leaveButton]}>
          <Ionicons name="exit-outline" size={24} color="#dc3545" />
          <Text style={[styles.menuText, styles.leaveText]}>플레이 탈퇴</Text>
        </Pressable>
      </View>
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
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  leaveButton: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  leaveText: {
    color: '#dc3545',
  },
}); 