const toUtf16BeHex = (text: string) => {
  const utf16le = Buffer.from(text, 'utf16le');
  const utf16be = Buffer.alloc(utf16le.length);

  for (let index = 0; index < utf16le.length; index += 2) {
    utf16be[index] = utf16le[index + 1];
    utf16be[index + 1] = utf16le[index];
  }

  return utf16be.toString('hex').toUpperCase();
};

const buildContentStream = (title: string, content: string) => {
  const bodyLines = content
    .replace(/\r\n/g, '\n')
    .split('\n')
    .slice(0, 42)
    .map((line) => line.trimEnd());

  const commands: string[] = [
    'BT',
    '/F1 16 Tf',
    '1 0 0 1 50 790 Tm',
    `<${toUtf16BeHex(title || '未命名课题')}> Tj`,
    '/F1 12 Tf',
    '0 -30 Td',
    '18 TL'
  ];

  for (const line of bodyLines) {
    commands.push('T*');
    commands.push(`<${toUtf16BeHex(line || ' ')}> Tj`);
  }

  commands.push('ET');
  return commands.join('\n');
};

const buildPdfBuffer = (objects: string[]) => {
  const header = Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n', 'binary');
  const chunks: Buffer[] = [header];
  const offsets: number[] = [0];
  let cursor = header.length;

  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(cursor);
    const objectBody = `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
    const objectBuffer = Buffer.from(objectBody, 'utf8');
    chunks.push(objectBuffer);
    cursor += objectBuffer.length;
  }

  const xrefOffset = cursor;
  const xrefLines = [`xref`, `0 ${objects.length + 1}`, `0000000000 65535 f `];

  for (let index = 1; index < offsets.length; index += 1) {
    xrefLines.push(`${offsets[index].toString().padStart(10, '0')} 00000 n `);
  }

  const trailer = [
    'trailer',
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    'startxref',
    `${xrefOffset}`,
    '%%EOF'
  ].join('\n');

  chunks.push(Buffer.from(`${xrefLines.join('\n')}\n${trailer}`, 'utf8'));
  return Buffer.concat(chunks);
};

export const exportPdfBuffer = (title: string, content: string) => {
  const stream = buildContentStream(title, content);
  const streamLength = Buffer.byteLength(stream, 'utf8');

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type0 /BaseFont /STSong-Light /Encoding /UniGB-UCS2-H /DescendantFonts [6 0 R] >>',
    '<< /Type /Font /Subtype /CIDFontType0 /BaseFont /STSong-Light /CIDSystemInfo << /Registry (Adobe) /Ordering (GB1) /Supplement 2 >> /DW 1000 >>'
  ];

  return buildPdfBuffer(objects);
};
