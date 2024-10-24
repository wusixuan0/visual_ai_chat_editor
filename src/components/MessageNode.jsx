import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Text } from '@chakra-ui/react';

export default memo(({ data }) => {
  return (
    <Box
      border="2px solid"
      bg={data?.selected ? "purple.50" : "white"}
      borderColor={data?.selected ? "purple.500" : "gray.200"}
      shadow={data?.selected ? "0 0 0 3px rgba(159,122,234,0.3)" : "md"}
      transform={data?.selected ? "scale(1.02)" : "scale(1)"}
      borderRadius="md"
      p={3}
      transition="all 0.2s"
    >
      {!data.hideUpperHandle && (
        <Handle type="target" position={Position.Top} />
      )}
      <Text>{data.content}</Text>
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
});