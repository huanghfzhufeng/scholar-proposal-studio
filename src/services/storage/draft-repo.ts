export type StoredDraft = {
  id: string;
  projectId: string;
  content: string;
};

export class DraftRepository {
  private readonly drafts: StoredDraft[] = [];

  save(draft: StoredDraft) {
    this.drafts.push(draft);
    return draft;
  }
}
