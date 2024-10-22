import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ChakraProvider } from '@chakra-ui/react'
import { ReactFlowProvider } from '@xyflow/react'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ReactFlowProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </ReactFlowProvider>
  </StrictMode>,
)
