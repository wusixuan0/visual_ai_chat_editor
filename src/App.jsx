import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import ChatInput from './components/ChatInput';
import MessageNode from './components/MessageNode';
import NodeOperations from './utils/NodeHelpers';
import PlaceholderNode from './components/PlaceholderNode';
import { createNodeId } from './utils/Util';

const nodeTypes = {
  MessageNode: MessageNode,
  PlaceholderNode: PlaceholderNode,
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
  const [nodes, setNodes] = useState(() => [initialNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition } = useReactFlow();
  const [selectedNodeId, setSelectedNodeId] = useState(initialNode.id);

  // Pass the setState functions directly to the hook
  const { addNode, AddNodeOnEdgeDrop, updateNodeContent, connectNodesWithEdge,onConnect } = NodeOperations(
    setNodes,
    setEdges,
    screenToFlowPosition
  );

  const recordCreatedNodeId = useCallback((nodeId) => {
    // setSelectedNodeId(nodeId);
    console.log("AddNodeOnEdgeDrop id", nodeId)
  }, []);

  const onConnectEnd = AddNodeOnEdgeDrop(
    recordCreatedNodeId,
  );

  const onNodeClick = useCallback((_, clickedNode) => {
    
    setNodes((prevNodes) => {
      const isSelected = prevNodes.find(node => 
        node.id === clickedNode.id
      )?.data?.selected;
  
      if (!isSelected) {
        setSelectedNodeId(clickedNode.id);
        console.log("selected node id", clickedNode.id);
      } else {
        setSelectedNodeId(null);
        console.log("unselected node id", clickedNode.id);
      }
  
      return prevNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          selected: node.id === clickedNode.id ? !node.data.selected : false
        }
      }));
    });
  }, [setNodes]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        edges={edges}
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
        selectedNodeId={selectedNodeId}
        setSelectedNodeId={setSelectedNodeId}
        addNode={addNode}
        updateNodeContent={updateNodeContent}
        connectNodesWithEdge={connectNodesWithEdge}
      />
    </div>
  );
}