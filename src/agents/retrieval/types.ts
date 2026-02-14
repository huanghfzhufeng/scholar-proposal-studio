export type RetrievalInput = {
  projectTitle: string;
  outlineKeywords: string[];
};

export type RetrievalItem = {
  title: string;
  url: string;
  source: string;
  abstract: string;
  score: number;
};

export type RetrievalOutput = {
  items: RetrievalItem[];
};
