import React, { useState } from 'react';
import { Box, Textarea, Button, VStack, HStack } from '@chakra-ui/react';
import axios from 'axios';

const ChatInput = ({ addNode, connectNodesWithEdge, updateNodeContent }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parentNodeid, setParentNodeid] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    const userNodeId = String(Date.now());
    console.log(String(Date.now()))
    addNode(userInput, userNodeId);
    console.log(String(Date.now()))
    // addNode("Waiting for AI response...", aiNodeId);

    if (parentNodeid) {
      connectNodesWithEdge(parentNodeid, userNodeId);
    }
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate', { user_input: userInput }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const aiNodeId = String(Date.now());
      addNode(response.data?.response, aiNodeId);
      // updateNodeContent(aiNodeId, response.data?.response);
      connectNodesWithEdge(userNodeId, aiNodeId);
      setParentNodeid(aiNodeId);
      console.log(response.data);
    } catch (error) {
      console.error('There was an error!', error);
    } finally {
      setIsLoading(false);
      setUserInput('');
    }
  };

  return (
    <Box position="fixed" bottom="0" left="0" right="0" p={4} bg="white" borderTop="1px" borderColor="gray.200">
      <VStack spacing={2}>
        <Textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message here..."
          size="sm"
          resize="vertical"
          minH="100px"
          maxH="300px"
        />
        <HStack justifyContent="flex-end" width="100%">
          <Button 
            colorScheme="blue" 
            onClick={handleSubmit}
            isLoading={isLoading} // Add isLoading prop
            isDisabled={isLoading} // Add isDisabled prop
          >
            Send
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ChatInput;