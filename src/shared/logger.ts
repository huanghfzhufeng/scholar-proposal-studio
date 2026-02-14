export const logger = {
  info(message: string, data?: unknown) {
    console.log(JSON.stringify({ level: 'info', message, data }));
  },
  error(message: string, data?: unknown) {
    console.error(JSON.stringify({ level: 'error', message, data }));
  }
};
