import { useState, useCallback, useRef } from 'react';
import { createNodeId, deriveNodesAndEdges } from './Util';
import {
  addEdge,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';

const NodeOperations = () => {
  const newNodeId = createNodeId();

  const initialNode = {
    id: newNodeId,
    type: "PlaceholderNode",
    position: { x: 100, y: 100 },
    data: {
      content: "Start a new conversation by typing below.",
      hideUpperHandle: true,
      selected: true,
    },
  };
  
  const initialNodeMap = {
    [newNodeId]: {
      id: newNodeId,
      parentId: null,
      node: initialNode,
    }
  };

  const [nodes, setNodes, onNodesChange] = useNodesState([initialNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nodeMap, setNodeMap] = useState(initialNodeMap);
  const [selectedUserNodeId, setSelectedUserNodeId] = useState(initialNode.id);
  const [selectedNodeId, setSelectedNodeId] = useState(initialNode.id);
  const [rootNodeId, setRootNodeId] = useState(initialNode.id);
  const { screenToFlowPosition } = useReactFlow();

  const nodeMapRef = useRef(nodeMap);
  nodeMapRef.current = nodeMap;

  const recalculateFlow = useCallback(() => {
    const { nodes, edges } = deriveNodesAndEdges(nodeMap);
    setNodes(nodes);
    setEdges(edges);
  }, [nodeMap]);

  // add a node with custom positioning
   const addNodeWithPosition = useCallback((content, position, parentNodeId = null) => {
    const newNodeId = createNodeId();
    
    const newNodeMapEntry = {
      id: newNodeId,
      parentId: parentNodeId,
      node: {
        id: newNodeId,
        type: 'PlaceholderNode',
        position,
        data: { content },
      },
    };

    setNodeMap(prev => ({
      ...prev,
      [newNodeId]: newNodeMapEntry,
    }));

    setNodes(prev => [...prev, newNodeMapEntry.node]);
    
    if (parentNodeId) {
      const newEdge = {
        id: `${parentNodeId}-${newNodeId}`,
        source: parentNodeId,
        target: newNodeId,
      };

      setEdges(oldEdges => addEdge(newEdge, oldEdges));
    }

    return newNodeId;
  }, []);

  // for vertical stacking
  const addNode = useCallback((data) => {
    const { content, type, parentId, selected } = data;

    const newNodeId = createNodeId();

    const currentNodeMap = nodeMapRef.current;
    const parentNode = currentNodeMap[parentId];
    const lastY = parentNode?.node?.position?.y ?? 0;
    const position = { x: 100, y: lastY + 100 };

    const newNodeMapEntry = {
      id: newNodeId,
      parentId: parentId,
      node: {
        id: newNodeId,
        type,
        position,
        data: { content, selected },
      },
    };

    setNodeMap(prev => ({
      ...prev,
      [newNodeId]: newNodeMapEntry,
    }));

    setNodes(prev => [...prev, newNodeMapEntry.node]);
    
    if (parentId) {
      const newEdge = {
        id: `${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
      };

      setEdges(oldEdges => addEdge(newEdge, oldEdges));
    }

    return newNodeId;
  }, []);

  const updateNodeContent = useCallback((nodeId, content, type, selected) => {
    setNodeMap(prevMap => {
      const updatedNode = {
        ...prevMap[nodeId].node,
        type,
        data: {
          ...prevMap[nodeId].node.data,
          content,
          selected,
        },
      };
      
      // Update nodes in the same batch
      setNodes(prevNodes =>
        prevNodes.map(node =>
          node.id === nodeId ? updatedNode : node
        )
      );

      return {
        ...prevMap,
        [nodeId]: {
          ...prevMap[nodeId],
          node: updatedNode,
        },
      };
    });
}, []);

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

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  // TODO: memoize selection update logic
  const onNodeClick = useCallback((_, clickedNode) => {
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

      setNodeMap(prevMap => {
        const node = prevMap[clickedId].node;
        const updatedNode = {
          ...node,
          data: {
            ...node.data,
            selected:!node.data.selected
          },
        };
        
        return {
          ...prevMap,
          [clickedId]: {
            ...prevMap[clickedId],
            node: updatedNode,
          },
        };
      });

      setNodes((prevNodes) => {
        return prevNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          selected: node.id === clickedId ? !node.data.selected : false
        }
      }));
    });
  }, [setNodes, setNodeMap, setSelectedNodeId, setSelectedUserNodeId]);

  // TODO: nodeMap
  const onNodesDelete = useCallback(
    (deleted) => {
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges);
          const outgoers = getOutgoers(node, nodes, edges);
          const connectedEdges = getConnectedEdges([node], edges);

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge),
          );

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            })),
          );

          return [...remainingEdges, ...createdEdges];
        }, edges),
      );
    },
    [nodes, edges],
  );

  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    addNode,
    AddNodeOnEdgeDrop,
    updateNodeContent,
    onConnect,
    onNodeClick,
    onNodesDelete,
    nodeMap,
    setNodeMap,
    selectedUserNodeId,
    setSelectedUserNodeId,
    selectedNodeId,
    setSelectedNodeId,
    rootNodeId,
    setRootNodeId,
  };
};

export default NodeOperations;