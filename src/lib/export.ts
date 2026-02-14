const sanitizeFileName = (input: string) => {
  return input.replace(/[\\/:*?"<>|]/g, ' ').trim().replace(/\s+/g, ' ');
};

const downloadBlob = (filename: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
};

const parseFileName = (contentDisposition: string | null, fallback: string) => {
  if (!contentDisposition) {
    return fallback;
  }

  const match = contentDisposition.match(/filename\\*=UTF-8''([^;]+)/i);
  if (!match?.[1]) {
    return fallback;
  }

  return decodeURIComponent(match[1]);
};

export const exportAsDocx = async (projectTitle: string, content: string) => {
  const title = sanitizeFileName(projectTitle);

  if (!title) {
    throw new Error('请先填写课题题目后再导出。');
  }

  const response = await fetch('/api/exports/docx', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectTitle: title,
      content
    })
  });

  if (!response.ok) {
    throw new Error('Word 导出失败。');
  }

  const blob = await response.blob();
  const fileName = parseFileName(response.headers.get('content-disposition'), `${title}.docx`);
  downloadBlob(fileName, blob);
};

export const exportAsPdf = async (projectTitle: string, content: string) => {
  const title = sanitizeFileName(projectTitle);

  if (!title) {
    throw new Error('请先填写课题题目后再导出。');
  }

  const response = await fetch('/api/exports/pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      projectTitle: title,
      content
    })
  });

  if (!response.ok) {
    throw new Error('PDF 导出失败。');
  }

  const blob = await response.blob();
  const fileName = parseFileName(response.headers.get('content-disposition'), `${title}.pdf`);
  downloadBlob(fileName, blob);
};
