import React from 'react';
import { Box, Textarea, Button, VStack, HStack } from '@chakra-ui/react';
import axios from 'axios';

const ChatInput = () => {
  const [message, setMessage] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(message);
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await axios.post('http://localhost:3000/api/ai/generate', { message }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error('There was an error!', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Box position="fixed" bottom="0" left="0" right="0" p={4} bg="white" borderTop="1px" borderColor="gray.200">
      <VStack spacing={2}>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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