export const draftTools = {
  normalizeParagraphs(content: string) {
    return content.replace(/\n{3,}/g, '\n\n').trim();
  },
  checkCitationCount(sectionText: string) {
    const matches = sectionText.match(/\[[0-9]+\]/g);
    return matches ? matches.length : 0;
  }
};
