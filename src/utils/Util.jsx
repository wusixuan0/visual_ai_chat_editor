export const createNodeId = () => {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`;
};