export type MakeNullable<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: T[P] | null;
};
