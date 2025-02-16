import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MapPlayMember } from '../../types/map';

interface PlayListItemProps {
  play: MapPlayMember;
  totalNodeCount: number;
  onPress: () => void;
}

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diff = now.getTime() - targetDate.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
};

export const PlayListItem: React.FC<PlayListItemProps> = ({ 
  play, 
  totalNodeCount = 0,
  onPress 
}) => {
  console.log(totalNodeCount);
  const percentage = Math.min(100, Math.round((play.completed_node_count / (totalNodeCount || 1)) * 100));
  const lastActivatedNode = play.recent_activated_nodes[0];

  return (
    <Pressable 
      style={styles.container} 
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{play.title}</Text>
          <Text style={styles.role}>
            {play.role === 'admin' ? '관리자' : '참여자'}
          </Text>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${percentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {play.completed_node_count} / {totalNodeCount} 완료
          </Text>
        </View>

        {lastActivatedNode && (
          <View style={styles.recentActivity}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.recentActivityText}>
              최근 활동: {lastActivatedNode.node_name}{' '}
              <Text style={styles.timeAgo}>
                {formatTimeAgo(lastActivatedNode.activated_at)}
              </Text>
            </Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
    gap: 4,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 2,
    overflow: 'hidden',
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
  recentActivity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recentActivityText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  timeAgo: {
    color: '#999',
  },
}); 