import { convertEdgeToParentMap, traverseToRoot, extractHistory } from '../utils/Util';
import { getResponse } from '../api/Api';

export const handleUserInputFlow = async ({ userInput, nodes, edges, rootNodeId, selectedUserNodeId, setSelectedUserNodeId, addNode, updateNodeContent }) => {
  updateNodeContent(selectedUserNodeId, userInput, "MessageNode", false);

  const aiNodeId = addNode({
    content: "Waiting for AI response...",
    type: "PlaceholderNode",
    parentId: selectedUserNodeId,
  });

  setSelectedUserNodeId(null);

  const parentMap = convertEdgeToParentMap(edges);
  const pathId = traverseToRoot(selectedUserNodeId, rootNodeId, parentMap);
  const currentHistory = extractHistory(pathId, nodes);
  currentHistory.pop();

  currentHistory.push({ role: "user", parts: [{ text: userInput }] });

  try {
    const aiResponse = await getResponse(currentHistory);
    updateNodeContent(aiNodeId, aiResponse, "ResponseNode");

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
};
