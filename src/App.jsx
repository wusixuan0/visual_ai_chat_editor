import React from 'react';
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
    onEdgesChange,
    onConnect,
    onNodeClick,
    onNodeDelete,
    onNodeDrag,
    onNodeDragStop,
    setHoveredEdgeId,
    styledEdges,
    onConnectEnd,
    handleUserInput,
  } = NodeOperations();

  return (
    <>
      <div style={{ width: '100vw', height: '80vh' }}>
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
      </div>

      <ChatInput handleUserInput={handleUserInput} />
    </>
  );
}