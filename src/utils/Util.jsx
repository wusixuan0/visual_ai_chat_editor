export const createNodeId = () => {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

export const convertEdgeToParentMap = (edges) => {
  const parentMap = {};
  for (const edge of edges) {
    parentMap[edge.target] = edge.source; 
  }
  return parentMap;
}

export const traverseToRoot = (targetNode, rootNodeId, parentMap) => {
  let currentNode = targetNode;
  const path = [];
  while (currentNode !== rootNodeId) {
    path.push(currentNode);
    currentNode = parentMap[currentNode]; 
  }
  path.push(rootNodeId); 
  return path.reverse();
}

export const extractHistory = (id_list, nodes) => 
  id_list.map(id => {
    const node = nodes.find(node => node.id === id);
    if (!node) return null;

    return {
      role: node.type === 'MessageNode' ? 'user' : 'model',
      parts: [{ text: node.data.content }]
    };
  }).filter(Boolean);

export const deriveNodesAndEdges = (nodeMap) => {
  const nodes = [];
  const edges = [];

  Object.values(nodeMap).forEach(node => {
    nodes.push(node.node);

    if (node.parentId) {
      edges.push({
        id: `${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
      });
    }
  });
  
  return { nodes, edges }
};

// Custom edge style when hovered
export const getEdgeStyle = (edge, hoveredEdge) => ({
  stroke: edge.id === hoveredEdge ? '#ff0072' : '#b1b1b7',
  strokeWidth: edge.id === hoveredEdge ? 3 : 1,
  transition: 'stroke 0.2s, stroke-width 0.2s'
});
