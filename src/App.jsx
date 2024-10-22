import React, { useState, useCallback, useEffect } from 'react';
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
  const [messages, setMessages] = useState({});

  useEffect(() => {
    const messages_history = {
      '1': { id: '1', content: 'Root Node', parentId: null, childrenIds: ['2', '3'] },
      '2': { id: '2', content: 'Child Node 1', parentId: '1', childrenIds: ['4'] },
      '3': { id: '3', content: 'level 2 after node 1', parentId: '1', childrenIds: [] },
      '4': { id: '4', content: 'level 3 after node 2', parentId: '2', childrenIds: [] },
    }
    const initialNodes = mapMessagesToNodes(messages_history);
    const newEdges = deriveEdges(messages_history);
    setNodes(initialNodes);
    setEdges(newEdges);
  }, [messages]);
  
  const mapMessagesToNodes = (messages) => {
    return Object.values(messages).map(message => ({
      id: message.id,
      type: 'MessageNode',
      position: { x: Math.random() * 100, y: message.id * 100 },
      data: { content: message.content }
    }));
  };

  const deriveEdges = (messages) => {
    const edges = [];
    Object.values(messages).forEach(node => {
      if (node.parentId) {
        edges.push({
          id: `${node.parentId}-${node.id}`,
          source: node.parentId,
          target: node.id,
        });
      }
    });
    return edges;
  };

  const addNode = useCallback((content, newNodeId) => { 
    setNodes((nds) => [
      ...nds,
      {
        id: newNodeId,
        type: 'MessageNode',
        position: { x: 250, y: nds.length * 100 },
        data: { content },
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