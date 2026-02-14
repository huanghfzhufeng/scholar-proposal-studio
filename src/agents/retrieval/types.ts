export type RetrievalInput = {
  projectTitle: string;
  outlineKeywords: string[];
};

export type RetrievalItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  abstract: string;
  year: string;
  sectionKey: '立项依据' | '研究内容' | '研究基础';
  score: number;
  selected: boolean;
};

export type RetrievalOutput = {
  items: RetrievalItem[];
};
