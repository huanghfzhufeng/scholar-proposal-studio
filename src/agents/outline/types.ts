export type OutlineSection = {
  title: string;
  children: string[];
};

export type OutlineCandidate = {
  label: string;
  focus: string;
  sections: OutlineSection[];
};

export type OutlineInput = {
  projectTitle: string;
  interviewSummary: string;
};

export type OutlineOutput = {
  candidates: OutlineCandidate[];
};
