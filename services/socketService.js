let io;

const initializeSocket = (socketIOInstance) => {
  io = socketIOInstance;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialzed');
  }

  return io;
}

module.exports = {
  initializeSocket,
  getIO
}