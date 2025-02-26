import React, { useState, useEffect, useCallback } from "react";
import type { NodeDetail } from "../../types/node";
import LockedNodeModal from "./LockedNodeModal";
import NodeContentModal from "./NodeContentModal";
import { nodeService } from "api/services/nodeService";
import type { AnswerSubmitResponse } from '../../types/answer';

interface NodeDetailModalProps {
  visible: boolean;
  nodeId: number | null;
  onClose: () => void;
  onMoveToNode?: (nodeId: number) => void;
  onAnswerSubmit: (response: AnswerSubmitResponse) => void;
  onError: (error: unknown) => void;
  mapPlayMemberId?: number;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  visible,
  nodeId,
  onClose,
  onMoveToNode,
  onAnswerSubmit,
  onError,
  mapPlayMemberId,
}) => {
  const [node, setNode] = useState<NodeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);

  const getNodeDetail = useCallback(async () => {
    if (!nodeId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await nodeService.getNodeDetail(nodeId, mapPlayMemberId);
      setNode(response.data);
    } catch (error) {
      console.error('Failed to fetch node details:', error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [nodeId, mapPlayMemberId, onError]);

  useEffect(() => {
    if (visible && nodeId !== null) {
      getNodeDetail();
    } else {
      setNode(null);
    }
  }, [visible, nodeId, getNodeDetail]);

  const handleMoveToNode = async (targetNodeId: number) => {
    try {
      setIsLoading(true);
      onMoveToNode?.(targetNodeId);
      const response = await nodeService.getNodeDetail(targetNodeId, mapPlayMemberId);
      setNode(response.data);
    } catch (error) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNodeDetail = useCallback(async (targetNodeId: number) => {
    try {
      setIsLoading(true);
      const response = await nodeService.getNodeDetail(targetNodeId, mapPlayMemberId);
      setNode(response.data);
    } catch (error) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  }, [mapPlayMemberId, onError]);

  if (!node) return null;

  if (node.status === "locked") {
    return (
      <LockedNodeModal isVisible={visible} onClose={onClose} node={node} />
    );
  }

  return (
    <NodeContentModal
      isVisible={visible}
      onClose={onClose}
      node={node}
      onMoveToNode={handleMoveToNode}
      variant={node.status}
      isLoading={isLoading}
      onRefreshNode={refreshNodeDetail}
      onAnswerSubmit={onAnswerSubmit}
      mapPlayMemberId={mapPlayMemberId}
    />
  );
};

export default NodeDetailModal;
