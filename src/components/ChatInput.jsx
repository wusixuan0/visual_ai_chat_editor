import React, { useState } from 'react';
import { Box, Textarea, Button, VStack, HStack } from '@chakra-ui/react';
import axios from 'axios';
import { convertEdgeToParentMap, traverseToRoot, extractHistory } from '../utils/Util';

const ChatInput = ({ nodes, edges, rootNodeId, selectedUserNodeId, setSelectedUserNodeId, addNode, updateNodeContent }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);

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

    currentHistory.push({
      role: "user",
      parts: [{ text: userInput }]
    });

    console.log("chat path", currentHistory)

    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate', { history: currentHistory }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      updateNodeContent(aiNodeId, response.data?.response, "ResponseNode");

      const newNodeId = addNode({
        content: "Type to continue conversation…",
        type: "PlaceholderNode",
        parentId: aiNodeId,
        selected: true,
      });

      setSelectedUserNodeId(newNodeId);

      console.log(response.data);
    } catch (error) {
      console.error('There was an error!', error);
      updateNodeContent(aiNodeId, "Error: Failed to get AI response");
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  };

  return (
    <Box position="fixed" bottom="0" left="0" right="0" p={4} bg="white" borderTop="1px" borderColor="gray.200">
      <form onSubmit={handleSubmit}>
        <VStack spacing={2}>
          <Textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={selectedUserNodeId ? "Type your message here..." : "Select a new message and type your message here..."}
            size="sm"
            resize="vertical"
            minH="100px"
            maxH="300px"
            disabled={isLoading}
          />
          <HStack justifyContent="flex-end" width="100%">
            <Button
              type="submit"
              colorScheme="purple"
              isLoading={isLoading}
              isDisabled={isLoading || !selectedUserNodeId}
            >
              Send
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default ChatInput;