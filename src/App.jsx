import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import ChatInput from './components/ChatInput';
import MessageNode from './components/MessageNode';
import NodeOperations from './utils/NodeHelpers';
import PlaceholderNode from './components/PlaceholderNode';
import ResponseNode from './components/ResponseNode';

const nodeTypes = {
  MessageNode: MessageNode,
  PlaceholderNode: PlaceholderNode,
  ResponseNode: ResponseNode,
};

export default function App() {
  const {
    nodes,
    onNodesChange,
    edges,
    onEdgesChange,
    addNode,
    AddNodeOnEdgeDrop,
    updateNodeContent,
    onConnect,
    onNodeClick,
    onNodeDelete,
    selectedUserNodeId,
    setSelectedUserNodeId,
    selectedNodeId,
    setSelectedNodeId,
    rootNodeId,
    setRootNodeId,
    onNodeDrag,
    onNodeDragStop,
    setHoveredEdgeId,
    styledEdges,
  } = NodeOperations();

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
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onNodesDelete={onNodeDelete}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onEdgesChange={onEdgesChange}
        onEdgeMouseEnter={(_, edge) => setHoveredEdgeId(edge.id)}
        onEdgeMouseLeave={() => setHoveredEdgeId(null)}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
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
      />
    </div>
  );
}