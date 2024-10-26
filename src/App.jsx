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
  const [hoveredEdge, setHoveredEdge] = useState(null);

  // Pass the setState functions directly to the hook
  const {
    addNode,
    AddNodeOnEdgeDrop,
    updateNodeContent,
    connectNodesWithEdge,
    onConnect,
    onNodeClick,
    onNodesDelete,
  } = NodeOperations(
    nodes,
    edges,
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

  // Helper function to check if point is on line segment
  const isPointNearLine = (x, y, edge) => {
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return false;

    // Get center points of nodes for simple line calculation
    const x1 = sourceNode.position.x + sourceNode.measured.width / 2;
    const y1 = sourceNode.position.y + sourceNode.measured.height / 2;
    const x2 = targetNode.position.x + targetNode.measured.width / 2;
    const y2 = targetNode.position.y + targetNode.measured.height / 2;

    // Calculate distance from point to line
    const threshold = 20; // Detection radius in pixels
    
    const numerator = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1);
    const denominator = Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
    const distance = numerator / denominator;

    console.log("isPointNearLine", distance < threshold);
    return distance < threshold;
  };

  const onNodeDrag = useCallback((event, node) => {
    if (node.type === 'PlaceholderNode') return;
    debugger
    // Get node center position
    const nodeX = node.position.x + node.measured.width / 2;
    const nodeY = node.position.y + node.measured.height / 2;

    // Check intersection with each edge
    const intersectingEdge = edges.find(edge => 
      edge.source !== node.id && 
      edge.target !== node.id && 
      isPointNearLine(nodeX, nodeY, edge)
    );

    if (intersectingEdge) {
      // Add visual feedback
      setHoveredEdge(intersectingEdge.id);
    } else {
      setHoveredEdge(null);
    }
  }, [edges, nodes]);

  const onNodeDragStop = useCallback((event, node) => {
    if (hoveredEdge) {
      const edge = edges.find(e => e.id === hoveredEdge);
      if (edge) {
        // restructuring the edges when a node is dropped on an edge
        const newEdges = [
          {
            id: `${edge.source}-${node.id}`,
            source: edge.source,
            target: node.id,
            type: edge.type,
          },
          {
            id: `${node.id}-${edge.target}`,
            source: node.id,
            target: edge.target,
            type: edge.type,
          },
          // TODO: connect node's parent and child
        ];

        // TODO: remove 2 edge of node
        setEdges(eds => 
          eds
            .filter(e => e.id !== edge.id) // remove the original hover edge
            .concat(newEdges) // add new edges
        );
      }
      setHoveredEdge(null);
    }
  }, [hoveredEdge, edges, setEdges]);

  // Custom edge style when hovered
  const getEdgeStyle = (edge, hoveredEdge) => ({
    stroke: edge.id === hoveredEdge ? '#ff0072' : '#b1b1b7',
    strokeWidth: edge.id === hoveredEdge ? 3 : 1,
    transition: 'stroke 0.2s, stroke-width 0.2s'
  });

  const styledEdges = edges.map(edge => ({
    ...edge,
    style: getEdgeStyle(edge, hoveredEdge)
  }));

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        // edges={edges}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onNodeClick={onNodeClick}
        onNodesDelete={onNodesDelete}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onEdgesChange={onEdgesChange}
        onEdgeMouseEnter={(_, edge) => setHoveredEdge(edge.id)}
        onEdgeMouseLeave={() => setHoveredEdge(null)}
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
        connectNodesWithEdge={connectNodesWithEdge}
      />
    </div>
  );
}