import { EventEmitter } from 'holly-emitter';

export type Config = {
  [key: string]: Record<string, (...args: any[]) => Promise<string> | Promise<void> | string | void>;
};

// 提取嵌套对象的所有键（仅一层深度）
type NestedKeys<T> = {
  [K in keyof T]: T[K] extends Record<string, any>
    ? keyof T[K] & string
    : never;
}[keyof T];

type MyExclude<T, U> = T extends U ? never : T;

export type Actions<T> = MyExclude<NestedKeys<T>, keyof T>;

export type Options<T> = {
  initialState: keyof T & string;
  emitter?: EventEmitter<Events<T>>;
};

export type Events<T> = {
  onEnter: {
    action: Actions<T>;
    current: keyof T;
    last: keyof T;
    meta?: unknown
  };
  onExit: {
    action: Actions<T>;
    current: keyof T & string;
    meta?: unknown
  };
}

export type StateEvents<T> = {
  [K in keyof T]: {
    action: Actions<T>;
    current: K;
    last: Exclude<keyof T, K>;
    meta?: unknown
  };
}

export const enum EventTypes {
  ON_ENTER = "onEnter",
  ON_EXIT = "onExit",
}

export type Transition<T> = (
  action: Actions<T>,
  meta?: unknown
) => Promise<(keyof T & string) | undefined>;
