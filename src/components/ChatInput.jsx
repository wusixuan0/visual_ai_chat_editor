import React, { useState } from 'react';
import { Box, Textarea, Button, VStack, HStack } from '@chakra-ui/react';

const ChatInput = ({ handleUserInput, selectedUserNodeId }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInput.trim() || isLoading) return;

    setIsLoading(true);

    await handleUserInput(userInput);

    setIsLoading(false);
    setUserInput('');
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