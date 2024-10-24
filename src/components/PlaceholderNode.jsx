import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Text } from '@chakra-ui/react';

export default memo(({ data }) => {
  return (
    <Box
      bg={data?.selected ? "purple.50" : "gray.50"}
      border="2px dashed"
      borderColor={data?.selected ? "purple.500" : "gray.300"}
      shadow={data?.selected ? "0 0 0 3px rgba(159,122,234,0.3)" : "sm"}
      transform={data?.selected ? "scale(1.02)" : "scale(1)"}
      borderRadius="md"
      p={3}
      transition="all 0.2s"
      _hover={{
        borderColor: "gray.400",
        bg: "gray.100"
      }}
    >
      {!data.hideUpperHandle && (
        <Handle type="target" position={Position.Top} />
      )}
      <Text color={data?.selected ? "purple.700" : "gray.500"}>
        {data.content}
      </Text>
    </Box>
  );
});