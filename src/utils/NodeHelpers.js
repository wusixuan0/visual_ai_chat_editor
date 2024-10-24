import { useCallback } from 'react';
import { createNodeId } from './Util';

const NodeOperations = (setNodes, setEdges, screenToFlowPosition) => {
  // add a node with custom positioning
  const addNodeWithPosition = useCallback((content, position, sourceNodeId = null) => {
    const newNodeId = createNodeId();
    
    setNodes((nds) => {
      const newNode = {
        id: newNodeId,
        type: 'PlaceholderNode',
        position,
        data: { content },
      };

      if (!nds || nds.length === 0) {
        return [newNode];
      }

      return [...nds, newNode];
    });

    if (sourceNodeId) {
      setEdges((eds) =>
        eds.concat({
          id: `${sourceNodeId}-${newNodeId}`,
          source: sourceNodeId,
          target: newNodeId,
        })
      );
    }

    return newNodeId;
  }, [setNodes, setEdges]);

  // for vertical stacking
  const addNode = useCallback((content, nodeType) => {
    const newNodeId = createNodeId();

    setNodes((nds) => {
      if (!nds || nds.length === 0) {
        return [{
          id: newNodeId,
          type: nodeType,
          position: { x: 100, y: 100 },
          data: { content },
        }];
      }

      try {
        const parentNode = nds?.[nds.length - 1];
        const lastY = parentNode?.position?.y ?? 0;
        const position = { x: 100, y: lastY + 100 };
        
        return [
          ...nds,
          {
            id: newNodeId,
            type: nodeType,
            position,
            data: { content },
          },
        ];
      } catch (error) {
        console.error('Error adding node:', error);
        return [
          ...nds,
          {
            id: createNodeId(),
            type: nodeType,
            position: { x: 100, y: nds.length * 100 },
            data: { content },
          },
        ];
      }
    });

    return newNodeId;
  }, [setNodes]);


  const updateNodeContent = useCallback((nodeId, content, type) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            type,
            data: {
              ...node.data,
              content,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const onConnectEnd = useCallback((event, connectionState) => {
    if (!connectionState.isValid) {
      const { clientX, clientY } =
        'changedTouches' in event ? event.changedTouches[0] : event;
      
      const position = screenToFlowPosition({
        x: clientX,
        y: clientY,
      });

      addNodeWithPosition(
        "Type to continue conversation…",
        position,
        connectionState.fromNode.id
      );
    }
  }, [screenToFlowPosition, addNodeWithPosition]);

  return {
    addNode,
    addNodeWithPosition,
    updateNodeContent,
    onConnectEnd,
  };
};

export default NodeOperations;