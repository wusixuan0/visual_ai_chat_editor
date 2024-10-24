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