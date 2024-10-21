import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from '@xyflow/react';
 
import '@xyflow/react/dist/style.css';
import ChatInput from './components/ChatInput';
import MessageNode from './components/MessageNode';

const nodeTypes = {
  MessageNode: MessageNode,
};
 
export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const addNode = useCallback((text, newNodeId) => { 
    setNodes((nds) => [
      ...nds,
      {
        id: newNodeId,
        type: 'MessageNode',
        position: { x: 250, y: nds.length * 100 },
        data: { text },
      },
    ]);
  }, [setNodes]);

  const connectNodesWithEdge = useCallback((sourceNodeId, targetNodeId) => {
    const newEdgeId = `e${sourceNodeId}-${targetNodeId}`;
    const newEdge = { id: newEdgeId, source: sourceNodeId, target: targetNodeId };
  
    setEdges((eds) => addEdge(newEdge, eds)); 
  }, [setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
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
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <ChatInput addNode={addNode} connectNodesWithEdge={connectNodesWithEdge} />
    </div>
  );
}