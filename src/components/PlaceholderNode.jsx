import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Text} from '@chakra-ui/react';

export default memo(({ data }) => {
  return (
    <Box
      bg="grey" 
      border="1px solid" 
      borderColor="gray.200" 
      borderRadius="md" 
      p={3} 
      shadow="md"
      opacity="0.5"
      borderStyle="dashed"
    >
      {!data.hideUpperHandle && (
        <Handle type="target" position={Position.Top} />
      )}
      <Text>{data.content}</Text>
    </Box>
  );
});