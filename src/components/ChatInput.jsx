import React, { useState } from 'react';
import { Box, Textarea, Button, VStack, HStack } from '@chakra-ui/react';
import axios from 'axios';

const ChatInput = ({ addNode, connectNodesWithEdge, updateNodeContent }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parentNodeid, setParentNodeid] = useState(null);
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);

    const userNodeId = addNode(userInput);

    if (parentNodeid) {
      connectNodesWithEdge(parentNodeid, userNodeId);
    }

    const aiNodeId = addNode("Waiting for AI response...");
    connectNodesWithEdge(userNodeId, aiNodeId);

    setHistory(prevHistory => [...prevHistory, {
      role: "user",
      parts: [{ text: userInput }]
    }]);

    try {
      const currentHistory = [...history, {
        role: "user",
        parts: [{ text: userInput }]
      }];
      const response = await axios.post('http://localhost:3000/api/ai/generate', { history: currentHistory }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      updateNodeContent(aiNodeId, response.data?.response);
      setParentNodeid(aiNodeId);

      setHistory(prevHistory => [...prevHistory, {
        role: "model",
        parts: [{ text: response.data?.response }]
      }]);

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
            placeholder="Type your message here..."
            size="sm"
            resize="vertical"
            minH="100px"
            maxH="300px"
            disabled={isLoading}
          />
          <HStack justifyContent="flex-end" width="100%">
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={isLoading}
              isDisabled={isLoading || !userInput.trim()}
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