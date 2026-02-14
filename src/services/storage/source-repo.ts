export type StoredSource = {
  id: string;
  projectId: string;
  title: string;
  selected: boolean;
};

export class SourceRepository {
  private readonly sources: StoredSource[] = [];

  upsert(source: StoredSource) {
    const idx = this.sources.findIndex((item) => item.id === source.id);

    if (idx >= 0) {
      this.sources[idx] = source;
      return source;
    }

    this.sources.push(source);
    return source;
  }
}
