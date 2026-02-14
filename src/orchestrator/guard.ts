export const evidenceGuard = {
  hasMinimumCitations(sectionCitations: number) {
    return sectionCitations >= 2;
  },
  canRetry(retryCount: number) {
    return retryCount < 2;
  }
};
