export const handledError = (error: any) => {
  if (error) {
    throw error;
  }
};
export const connect = (Board: any, port: any) => {
  const PORT = port.path
  return new Board(PORT);
};
