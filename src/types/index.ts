export type Config = {
  [key: string]: Record<string, (...args: any[]) => Promise<string> | string>;
};

type NestedKeys<T> = {
  [K in keyof T]: T[K] extends object ? K | NestedKeys<T[K]> : K;
}[keyof T];

type MyExclude<T, U> = T extends U ? T : never;

export type Actions<T> = MyExclude<NestedKeys<Config>, keyof T>;

export type Options<T> = {
  initialState: keyof T & string;
};
