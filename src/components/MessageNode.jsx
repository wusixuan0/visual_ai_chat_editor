import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Text} from '@chakra-ui/react';

const MessageNode = ({ data }) => {
  return (
    <Box 
      bg="white" 
      border="1px solid" 
      borderColor="gray.200" 
      borderRadius="md" 
      p={3} 
      shadow="md"
    >
      <Handle type="target" position={Position.Top} />
      <Text>{data.text}</Text>
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
};

export default MessageNode;