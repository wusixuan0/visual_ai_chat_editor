import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
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
  // const [messages, setMessages] = useState({});
  const { screenToFlowPosition } = useReactFlow();

  // useEffect(() => {
  //   const messages_history = {
  //     '1': { id: '1', content: 'Root Node', parentId: null, childrenIds: ['2', '3'] },
  //     '2': { id: '2', content: 'Child Node 1', parentId: '1', childrenIds: ['4'] },
  //     '3': { id: '3', content: 'level 2 after node 1', parentId: '1', childrenIds: [] },
  //     '4': { id: '4', content: 'level 3 after node 2', parentId: '2', childrenIds: [] },
  //   };
  //   const initialNodes = mapMessagesToNodes(messages_history);
  //   const newEdges = deriveEdges(messages_history);
  //   setNodes(initialNodes);
  //   setEdges(newEdges);
  // }, [messages]);

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

  const addNode = useCallback((content) => {
    const newNodeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    setNodes((nds) => {
      // Guard against empty nodes array
      if (!nds || nds.length === 0) {
        return [{
          id: newNodeId,
          type: 'MessageNode',
          position: { x: 100, y: 100 },
          data: { content },
        }];
      }
  
      try {
        // Safely get the last node
        const parentNode = nds[nds.length - 1];
        
        // Ensure parentNode has valid position
        const lastY = parentNode?.position?.y ?? 0;
        const newY = lastY + 100;
  
        // Return new array with additional node
        return [
          ...nds,
          {
            id: newNodeId,
            type: 'MessageNode',
            position: { x: 100, y: newY },
            data: { content },
          },
        ];
      } catch (error) {
        console.error('Error adding node:', error);
        // Fallback position if there's an error
        return [
          ...nds,
          {
            id: newNodeId,
            type: 'MessageNode',
            position: { x: 100, y: nds.length * 100 },
            data: { content },
          },
        ];
      }
    });
  
    return newNodeId;
  }, []);

  const updateNodeContent = useCallback((nodeId, content) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              content,
            },
          };
        }
        return node;
      })
    );
  }, []);

  const connectNodesWithEdge = useCallback((sourceNodeId, targetNodeId) => {
    const newEdgeId = `e${sourceNodeId}-${targetNodeId}`;
    const newEdge = { id: newEdgeId, source: sourceNodeId, target: targetNodeId };

    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const onConnectEnd = useCallback(
    (event, connectionState) => {
      if (!connectionState.isValid) {
        const newNodeId = String(Date.now());
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;
        const newNode = {
          id: newNodeId,
          type: 'MessageNode',
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { content: "New Message" }, 
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id: `${connectionState.fromNode.id}-${newNodeId}`, source: connectionState.fromNode.id, target: newNodeId }),
        );
      }
    },
    [screenToFlowPosition],
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
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      <ChatInput 
        addNode={addNode}
        updateNodeContent={updateNodeContent}
        connectNodesWithEdge={connectNodesWithEdge}
      />
    </div>
  );
}