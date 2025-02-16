import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MapPlayMember } from '../../types/map';
import { formatTimeAgo } from '../../utils/date';

interface PlayListItemProps {
  play: MapPlayMember;
  totalNodeCount: number;
  onPress: () => void;
  onMorePress: () => void;
}

export const PlayListItem: React.FC<PlayListItemProps> = ({ 
  play, 
  totalNodeCount = 0,
  onPress,
  onMorePress
}) => {
  const percentage = Math.min(100, Math.round((play.completed_node_count / (totalNodeCount || 1)) * 100));
  const lastActivatedNode = play.recent_activated_nodes[0];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{play.title}</Text>
        <Text style={styles.role}>
          {play.role === 'admin' ? '관리자' : '참여자'}
        </Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {play.completed_node_count}/{totalNodeCount} 노드 완료 ({percentage}%)
        </Text>
      </View>

      {lastActivatedNode && (
        <Text style={styles.recentActivityText}>
          최근 활성화: {lastActivatedNode.node_name} ({formatTimeAgo(lastActivatedNode.activated_at)})
        </Text>
      )}

      <View style={styles.actions}>
        <Pressable 
          style={({ pressed }) => [
            styles.startButton,
            pressed && styles.startButtonPressed
          ]}
          onPress={onPress}
          android_ripple={{ 
            color: 'rgba(76, 175, 80, 0.1)',
            borderless: false
          }}
        >
          <Text style={styles.startButtonText}>시작</Text>
        </Pressable>
        <Pressable 
          style={styles.moreButton}
          onPress={onMorePress}
          android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  role: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressSection: {
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  recentActivityText: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  startButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  startButtonPressed: {
    backgroundColor: '#f0f9f0',
  },
  startButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  moreButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
}); 