import { useCallback } from 'react';

const createNodeId = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

const NodeOperations = (setNodes, setEdges, screenToFlowPosition) => {
  // add a node with custom positioning
  const addNodeWithPosition = useCallback((content, position, sourceNodeId = null) => {
    const newNodeId = createNodeId();
    
    setNodes((nds) => {
      const newNode = {
        id: newNodeId,
        type: 'MessageNode',
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
  const addNodeBelow = useCallback((content) => {
    const newNodeId = createNodeId();

    setNodes((nds) => {
      try {
        const parentNode = nds?.[nds.length - 1];
        const lastY = parentNode?.position?.y ?? 0;
        const position = { x: 100, y: lastY + 100 };
        
        return [
          ...nds,
          {
            id: newNodeId,
            type: 'MessageNode',
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
            type: 'MessageNode',
            position: { x: 100, y: nds.length * 100 },
            data: { content },
          },
        ];
      }
    });

    return newNodeId;
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
        "New Message Placeholder",
        position,
        connectionState.fromNode.id
      );
    }
  }, [screenToFlowPosition, addNodeWithPosition]);

  return {
    addNodeBelow,
    addNodeWithPosition,
    onConnectEnd,
  };
};

export default NodeOperations;