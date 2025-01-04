import React, { useState, useEffect } from "react";
import type { NodeDetail } from "../../types/node";
import LockedNodeModal from "./LockedNodeModal";
import NodeContentModal from "./NodeContentModal";
import { nodeService } from "api/services/nodeService";

interface NodeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  nodeId: number | null;
  onMoveToNode?: (nodeId: number) => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  visible,
  onClose,
  nodeId,
  onMoveToNode,
}) => {
  const [node, setNode] = useState<NodeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNodeDetail = async () => {
      if (!nodeId) return;

      try {
        setIsLoading(true);
        const response = await nodeService.getNodeDetail(nodeId);
        setNode(response.data);
      } catch (error) {
        console.error("Failed to fetch node detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (visible && nodeId) {
      fetchNodeDetail();
    } else {
      setNode(null);
    }
  }, [nodeId, visible]);

  const handleMoveToNode = async (targetNodeId: number) => {
    try {
      setIsLoading(true);
      onMoveToNode?.(targetNodeId);
      const response = await nodeService.getNodeDetail(targetNodeId);
      setNode(response.data);
    } catch (error) {
      console.error("Failed to fetch node detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
    />
  );
};

export default NodeDetailModal;
