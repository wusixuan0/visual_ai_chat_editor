import { useCallback } from 'react';
import { createNodeId } from './Util';
import { addEdge } from '@xyflow/react';

const NodeOperations = (setNodes, setEdges, screenToFlowPosition, setSelectedNodeId, setSelectedUserNodeId) => {
  // add a node with custom positioning
  const addNodeWithPosition = useCallback((content, position, sourceNodeId = null) => {
    const newNodeId = createNodeId();
    
    setNodes((nds) => {
      const newNode = {
        id: newNodeId,
        type: 'PlaceholderNode',
        position,
        data: { 
          content,
          // selected: true,
        },
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
  const addNode = useCallback((content, nodeType, selected) => {
    const newNodeId = createNodeId();

    setNodes((nds) => {
      if (!nds || nds.length === 0) {
        return [{
          id: newNodeId,
          type: nodeType,
          position: { x: 100, y: 100 },
          data: { 
            content,
            selected,
          },
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
            data: { 
              content,
              selected,
            },  
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


  const updateNodeContent = useCallback((nodeId, content, type, selected) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            type,
            data: {
              ...node.data,
              content,
              selected,
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

  const AddNodeOnEdgeDrop = (onNodeCreated) => {
    return useCallback((event, connectionState) => {
      if (!connectionState.isValid) {
        const { clientX, clientY } =
          'changedTouches' in event ? event.changedTouches[0] : event;
        
        const position = screenToFlowPosition({
          x: clientX,
          y: clientY,
        });
  
        const newNodeId = addNodeWithPosition(
          "Type to continue conversation…",
          position,
          connectionState.fromNode.id
        );
        
        // Call the callback with the new node ID
        onNodeCreated(newNodeId);
      }
    }, [screenToFlowPosition, addNodeWithPosition, onNodeCreated]);
  };

  const connectNodesWithEdge = useCallback((sourceNodeId, targetNodeId) => {
    const newEdgeId = `e${sourceNodeId}-${targetNodeId}`;
    const newEdge = { id: newEdgeId, source: sourceNodeId, target: targetNodeId };

    setEdges((eds) => addEdge(newEdge, eds));
  }, [setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );


  const onNodeClick = useCallback((_, clickedNode) => {
    setNodes((prevNodes) => {
      const clickedId = clickedNode.id
      const isSelected = clickedNode?.data?.selected;

      if (!isSelected) {
        setSelectedNodeId(clickedId);

        if (clickedNode.type !== "ResponseNode") {
          setSelectedUserNodeId(clickedId);
        } else {
          setSelectedUserNodeId(null);
        }
        console.log(`selected ${clickedNode.type} node id:`, clickedId);
      } else {
        setSelectedNodeId(null);
        setSelectedUserNodeId(null);

        console.log(`unselected ${clickedNode.type}node id:`, clickedId);
      }
  
      return prevNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          selected: node.id === clickedId ? !node.data.selected : false
        }
      }));
    });
  }, [setNodes, setSelectedNodeId]);

  return {
    addNode,
    addNodeWithPosition,
    updateNodeContent,
    onConnectEnd,
    AddNodeOnEdgeDrop,
    connectNodesWithEdge,
    onConnect,
    onNodeClick,
  };
};

export default NodeOperations;