export const exportPdfBuffer = (content: string) => {
  return Buffer.from(content, 'utf-8');
};
