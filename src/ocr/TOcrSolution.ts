export type TOcrSolution = {
  getTextFromImage: (fileUrl: string) => Promise<string | null>;
};
