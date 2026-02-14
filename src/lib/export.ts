const sanitizeFileName = (input: string) => {
  return input.replace(/[\\/:*?"<>|]/g, ' ').trim().replace(/\s+/g, ' ');
};

const downloadBlob = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
};

export const exportAsDocx = (projectTitle: string, content: string) => {
  const title = sanitizeFileName(projectTitle);

  if (!title) {
    throw new Error('请先填写课题题目后再导出。');
  }

  downloadBlob(`${title}.docx`, content, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
};

export const exportAsPdf = (projectTitle: string, content: string) => {
  const title = sanitizeFileName(projectTitle);

  if (!title) {
    throw new Error('请先填写课题题目后再导出。');
  }

  downloadBlob(`${title}.pdf`, content, 'application/pdf');
};
