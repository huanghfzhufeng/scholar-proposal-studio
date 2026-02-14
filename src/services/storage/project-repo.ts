export type StoredProject = {
  id: string;
  title: string;
  deletedAt: string | null;
};

export class ProjectRepository {
  private readonly projects: StoredProject[] = [];

  create(project: StoredProject) {
    this.projects.push(project);
    return project;
  }

  list() {
    return [...this.projects];
  }
}
