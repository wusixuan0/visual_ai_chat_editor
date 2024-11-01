import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box, Text } from '@chakra-ui/react';
import Markdown from 'react-markdown'

export default memo(({ data }) => {
  return (
    <Box
      border="2px solid"
      bg={data?.selected ? "blue.50" : "white"}
      borderColor={data?.selected ? "blue.500" : "gray.200"}
      shadow={data?.selected ? "0 0 0 3px rgba(167,199,231,0.3)" : "md"}
      transform={data?.selected ? "scale(1.02)" : "scale(1)"}
      borderRadius="md"
      p={[2, 4, 6]}
      transition="all 0.2s"
    >
      {!data.hideUpperHandle && (
        <Handle type="target" position={Position.Top} />
      )}
      <Markdown>{data.content.substring(0, 800)}</Markdown>
      <Text color="grey">... (click to see complete text in side panel)</Text>
      <Handle type="source" position={Position.Bottom} />
    </Box>
  );
});