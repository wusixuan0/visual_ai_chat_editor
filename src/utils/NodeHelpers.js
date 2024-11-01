import { useState, useCallback, useRef } from 'react';
import {
  createNodeId,
  getEdgeStyle,
  convertEdgeToParentMap, traverseToRoot, extractHistory
 } from './Util';

import {
  addEdge,
  getIncomers,
  getOutgoers,
  getConnectedEdges,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from '@xyflow/react';

import Dagre from '@dagrejs/dagre';
import { getResponse } from '../api/Api';

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
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
  const { screenToFlowPosition, getNode, fitView } = useReactFlow();
  const [isProcessing, setIsProcessing] = useState(false);
  const [nodeContent, setNodeContent] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const nodeMapRef = useRef(nodeMap);
  nodeMapRef.current = nodeMap;

  // const recalculateFlow = useCallback(() => {
  //   const { nodes, edges } = deriveNodesAndEdges(nodeMap);
  //   setNodes(nodes);
  //   setEdges(edges);
  // }, [nodeMap]);

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

    let spacing = 100
    if (selected & window.innerWidth > 600) spacing = 400;
    if (selected & window.innerWidth <= 600) spacing = 500;
    const lastY = nodeMapRef.current[parentId]?.node?.position.y;
    console.log(window.innerWidth)
    // const { height = 50, width = 200 } = parentNode?.measured || {}
    // const parentNode = getNode(parentId);
    // const lastY = parentNode?.position?.y ?? 0;
    const position = { x: 100, y: lastY + spacing };

    const newNodeMapEntry = {
      id: newNodeId,
      parentId: parentId,
      node: {
        id: newNodeId,
        type,
        position,
        data: { id: newNodeId, content, selected },
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

  const recordCreatedNodeId = useCallback((nodeId) => {
    setSelectedNodeId(nodeId);
    console.log("AddNodeOnEdgeDrop id", nodeId)
  }, []);

  const onConnectEnd = AddNodeOnEdgeDrop(
    recordCreatedNodeId,
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

          if (clickedNode.type !== "PlaceholderNode") {
            setNodeContent(clickedNode?.data?.content);
            setIsPanelOpen(true);
          }
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

  const onNodesDelete = useCallback((deleted) => {
    const deletedNode = deleted[0];
    if (!deletedNode) return;
  
    const incomer = getIncomers(deletedNode, nodes, edges)[0]; // Parent
    const outgoers = getOutgoers(deletedNode, nodes, edges); // Children
  
    if (incomer && outgoers) {
      setNodeMap((prev) => {
        const newNodeMap = { ...prev };
        outgoers.forEach(outgoer => {          
          if (newNodeMap[outgoer.id].parentId) {
            newNodeMap[outgoer.id].parentId = newNodeMap[incomer.id];
          }
        });

        delete newNodeMap[deletedNode.id];
        return newNodeMap;
      });
    }
  
    setEdges((prevEdges) => {
      const remainingEdges = prevEdges.filter(
        edge => edge.source !== deletedNode.id && edge.target !== deletedNode.id
      );
      
      if (incomer && outgoers) {
        outgoers.forEach(outgoer => {

          remainingEdges.push({
            id: `${incomer.id}->${outgoer.id}`,
            source: incomer.id,
            target: outgoer.id,
          });
        });
      }
      
      return remainingEdges;
    });
  
    setNodes((prevNodes) => 
      prevNodes.filter(node => node.id !== deletedNode.id)
    );
  }, [nodes, edges]);

  const onNodeDelete = useCallback((deleted) => {
    const deletedNode = deleted[0];
    if (!deletedNode) return;
  
    const incomer = getIncomers(deletedNode, nodes, edges)[0]; // Parent
    const outgoers = getOutgoers(deletedNode, nodes, edges); // Children
  
    if (incomer && outgoers) {
      setNodeMap((prev) => {
        const newNodeMap = { ...prev };
        outgoers.forEach(outgoer => {          
          if (newNodeMap[outgoer.id].parentId) {
            newNodeMap[outgoer.id].parentId = newNodeMap[incomer.id];
          }
        });

        delete newNodeMap[deletedNode.id];
        return newNodeMap;
      });
    }
  
    setEdges((prevEdges) => {
      const remainingEdges = prevEdges.filter(
        edge => edge.source !== deletedNode.id && edge.target !== deletedNode.id
      );
      
      if (incomer && outgoers) {
        outgoers.forEach(outgoer => {

          remainingEdges.push({
            id: `${incomer.id}->${outgoer.id}`,
            source: incomer.id,
            target: outgoer.id,
          });
        });
      }
      
      return remainingEdges;
    });
  
    setNodes((prevNodes) => 
      prevNodes.filter(node => node.id !== deletedNode.id)
    );
  }, [nodes, edges]);

  const onNodeDrag = useCallback((event, node) => {
    if (node.type === 'PlaceholderNode') return;

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
      setHoveredEdgeId(intersectingEdge.id);
    } else {
      setHoveredEdgeId(null);
    }
  }, [edges, nodes]);


  // check if point is on line segment
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

  const onNodeDragStop = useCallback((event, node) => {
    if (hoveredEdgeId) {
      const edge = edges.find(e => e.id === hoveredEdgeId);
      const incomer = getIncomers(node, nodes, edges)[0];
      const outgoers = getOutgoers(node, nodes, edges);
    
      if (edge) {
        const newEdges = [
          {
            id: `${edge.source}-${node.id}`,
            source: edge.source,
            target: node.id,
          },
          {
            id: `${node.id}-${edge.target}`,
            source: node.id,
            target: edge.target,
          },
        ];

        // connect node's parent and child
        outgoers.forEach(outgoer => {          
          newEdges.push(
            {
              id: `${incomer.id}-${outgoer.id}`,
              source: incomer.id,
              target: outgoer.id,
            }
          );
        });

        // Get all edges connected to this node
        const connectedEdges = getConnectedEdges([node], edges);
        
        setEdges(prev_edges => 
          prev_edges
          .filter(e => 
            !connectedEdges.some(connectedEdge => connectedEdge.id === e.id) && 
            e.id !== edge.id
          ) // Remove both connected edges and hover edge
          .concat(newEdges)
        );
      }

      setHoveredEdgeId(null);
    }
  }, [hoveredEdgeId, edges, setEdges]);

  const styledEdges = edges.map(edge => ({
    ...edge,
    style: getEdgeStyle(edge, hoveredEdgeId)
  }));

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  const handleUserInput = async (userInput) => {
    // 1. Update user node
    updateNodeContent(selectedUserNodeId, userInput, "MessageNode", false);

    // 2. Create AI node
    const aiNodeId = addNode({
      content: "Waiting for AI response...",
      type: "PlaceholderNode",
      parentId: selectedUserNodeId,
    });
    
    // 3. Get AI response
    const parentMap = convertEdgeToParentMap(edges);
    const pathId = traverseToRoot(selectedUserNodeId, rootNodeId, parentMap);
    const currentHistory = extractHistory(pathId, nodes);
    currentHistory.pop();
  
    currentHistory.push({ role: "user", parts: [{ text: userInput }] });
  
    try {
      const aiResponse = await getResponse(currentHistory);

      // 4. Update AI node
      updateNodeContent(aiNodeId, aiResponse, "ResponseNode");
  
      // 5. Create next user node
      const newNodeId = addNode({
        content: "Type to continue conversation…",
        type: "PlaceholderNode",
        parentId: aiNodeId,
        selected: true,
      });
  
      setSelectedUserNodeId(newNodeId);
    } catch (error) {
      console.error('Error during handleUserInputFlow:', error);
      updateNodeContent(aiNodeId, "Error: Failed to get AI response");
    }
  }

  const getLayoutedElements = (nodes, edges, options) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: options.direction });
  
    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
      g.setNode(node.id, {
        ...node,
        width: node.measured?.width ?? 0,
        height: node.measured?.height ?? 0,
      }),
    );
  
    Dagre.layout(g);
  
    return {
      nodes: nodes.map((node) => {
        const position = g.node(node.id);
        const x = position.x - (node.measured?.width ?? 0) / 2;
        const y = position.y - (node.measured?.height ?? 0) / 2;
  
        return { ...node, position: { x, y } };
      }),
      edges,
    };
  };

  const onLayout = useCallback(
    (direction='TB') => {
      const layouted = getLayoutedElements(nodes, edges, { direction });

      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);

      window.requestAnimationFrame(() => {
        fitView();
      });
    },
    [nodes, edges],
  );  

  return {
    nodes,
    onNodesChange,
    edges,
    onEdgesChange,
    addNode,
    updateNodeContent,
    onConnect,
    onNodeClick,
    onNodeDelete,
    selectedUserNodeId,
    setSelectedUserNodeId,
    rootNodeId,
    onNodeDrag,
    onNodeDragStop,
    setHoveredEdgeId,
    styledEdges,
    onConnectEnd,
    handleUserInput,
    onLayout,
    nodeContent,
    selectedNodeId,
    isPanelOpen,
    setIsPanelOpen,
  };
};

export default NodeOperations;