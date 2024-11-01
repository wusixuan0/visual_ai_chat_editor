import React, { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Text, Box, Flex, Portal } from '@chakra-ui/react';

import Markdown from 'react-markdown'

export default memo(({ data }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      border="2px solid"
      bg={data?.selected ? "blue.50" : "white"}
      borderColor={data?.selected ? "blue.500" : "gray.200"}
      shadow={data?.selected ? "0 0 0 3px rgba(167,199,231,0.3)" : "md"}
      transform={data?.selected ? "scale(1.02)" : "scale(1)"}
      borderRadius="md"
      pt={[2, 4, 6]}
      px={[2, 4, 6]}
      pb={2}
      transition="all 0.2s"
      style={{
        maxWidth: '600px'
      }}
    >
      {!data.hideUpperHandle && (
        <Handle type="target" position={Position.Top} />
      )}
      <Markdown>{data.content.substring(0, 800).concat('... (click to see full text in side panel)')}</Markdown>

<Flex justify="space-between" align="center" width="100%">
  <Box flexGrow={1} textAlign="center">
    <Text color="blue.600">
      Drag from here to branch chat
    </Text>
  </Box>

  <Box 
    className="relative inline-block" 
    onMouseEnter={() => setIsHovered(true)}
    onMouseLeave={() => setIsHovered(false)}
  >
    <Text className="cursor-help" color="blue.600">
      Tip
    </Text>
    {isHovered && (
      <Portal>
      <Box
          position="absolute"
          top="100%"
          left="0"
          bg="gray"
          color="white"
          p="2"
          mt="1"
          rounded="md"
          shadow="lg"
          minW="200px"
          zIndex="popover"
        >
        To re-order, drag and drop the node on an edge.
      </Box>
    </Portal>
    )}
  </Box>
</Flex>


      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: '12px',
          height: '12px',
          background: data?.selected ? '#3b82f6' : 'grey',
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#ff0072';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = data?.selected ? '#3b82f6' : 'grey';
        }}
      />
    </Box>
  );
});