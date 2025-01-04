import React, { useState } from "react";
import type { NodeDetail } from "../../types/node";
import LockedNodeModal from "./LockedNodeModal";
import NodeContentModal from "./NodeContentModal";
import { nodeService } from "api/services/nodeService";

interface NodeDetailModalProps {
  visible: boolean;
  onClose: () => void;
  node: NodeDetail | null;
  onMoveToNode?: (nodeId: number) => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  visible,
  onClose,
  node: initialNode,
  onMoveToNode,
}) => {
  const [node, setNode] = useState<NodeDetail | null>(initialNode);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    setNode(initialNode);
  }, [initialNode]);

  const handleMoveToNode = async (nodeId: number) => {
    try {
      onMoveToNode?.(nodeId);
      setIsLoading(true);
      const response = await nodeService.getNodeDetail(nodeId);
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
