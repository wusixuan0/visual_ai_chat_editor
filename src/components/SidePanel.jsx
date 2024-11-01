import React from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
} from '@chakra-ui/react'
import Markdown from 'react-markdown'

export function SidePanel({ isOpen, onClose, nodeContent }) {
  return (
    <Drawer size="lg" isOpen={isOpen} onClose={onClose} placement="right">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody p={8}>
          <Markdown>{nodeContent}</Markdown>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}