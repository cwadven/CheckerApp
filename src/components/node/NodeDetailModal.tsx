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
  onMoveToNode: (nodeId: number) => void;
  onAnswerSubmit: (response: AnswerSubmitResponse) => void;
  onError: (error: unknown) => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  visible,
  nodeId,
  onClose,
  onMoveToNode,
  onAnswerSubmit,
  onError,
}) => {
  const [node, setNode] = useState<NodeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNodeDetail = async () => {
      if (nodeId === null) return;

      try {
        setIsLoading(true);
        const response = await nodeService.getNodeDetail(nodeId);
        setNode(response.data);
      } catch (error) {
        onError(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (visible && nodeId !== null) {
      fetchNodeDetail();
    } else {
      setNode(null);
    }
  }, [visible, nodeId, onError]);

  const handleMoveToNode = async (targetNodeId: number) => {
    try {
      setIsLoading(true);
      onMoveToNode(targetNodeId);
      const response = await nodeService.getNodeDetail(targetNodeId);
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
      const response = await nodeService.getNodeDetail(targetNodeId);
      setNode(response.data);
    } catch (error) {
      onError(error);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

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
    />
  );
};

export default NodeDetailModal;
