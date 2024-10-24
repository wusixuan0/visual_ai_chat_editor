import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import ChatInput from './components/ChatInput';
import MessageNode from './components/MessageNode';
import NodeOperations from './utils/NodeHelpers';
import PlaceholderNode from './components/PlaceholderNode';
import ResponseNode from './components/ResponseNode';
import { createNodeId } from './utils/Util';

const nodeTypes = {
  MessageNode: MessageNode,
  PlaceholderNode: PlaceholderNode,
  ResponseNode: ResponseNode,
};

export default function App() {
  const initialNode = {
    id: createNodeId(),
    type: "PlaceholderNode",
    position: { x: 100, y: 100 },
    data: {
      content: "Start a new conversation by typing below.",
      hideUpperHandle: true,
      selected: true,
    },
  };

  const [nodes, setNodes, onNodesChange] = useNodesState([initialNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState(initialNode.id);
  const [selectedUserNodeId, setSelectedUserNodeId] = useState(initialNode.id);
  const [rootNodeId, setRootNodeId] = useState(initialNode.id);

  // Pass the setState functions directly to the hook
  const { addNode, AddNodeOnEdgeDrop, updateNodeContent, connectNodesWithEdge, onConnect, onNodeClick } = NodeOperations(
    setNodes,
    setEdges,
    screenToFlowPosition,
    setSelectedNodeId,
    setSelectedUserNodeId,
  );

  const recordCreatedNodeId = useCallback((nodeId) => {
    // setSelectedNodeId(nodeId);
    console.log("AddNodeOnEdgeDrop id", nodeId)
  }, []);

  const onConnectEnd = AddNodeOnEdgeDrop(
    recordCreatedNodeId,
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onNodeClick={onNodeClick}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <ChatInput
        nodes={nodes}
        edges={edges}
        rootNodeId={rootNodeId}
        selectedUserNodeId={selectedUserNodeId}
        setSelectedUserNodeId={setSelectedUserNodeId}
        addNode={addNode}
        updateNodeContent={updateNodeContent}
        connectNodesWithEdge={connectNodesWithEdge}
      />
    </div>
  );
}