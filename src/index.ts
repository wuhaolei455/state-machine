import { Actions, Config, EventTypes, Events, Options, StateEvents, Transition } from "./types";
import { createEventEmitter, EventEmitter, EventHandler, EventListener } from 'holly-emitter';

export function createMachine<T extends Config>(config: T, options: Options<T>) {
  const { initialState, emitter = createEventEmitter<Events<T>>() } = options;
  const stateEmitter = createEventEmitter<StateEvents<T>>();
  const handlers = buildHandlers(config, stateEmitter);
  const actions = buildActions(config, transition)

  let current = initialState;

  /**
   * 获取当前状态
   */
  function getState() {
    return current;
  }

  /**
   * 注册进入状态时触发的回调
   */
  function onEnter(handler: (data: Events<T>[EventTypes.ON_ENTER]) => Promise<void> | void) {
    emitter.on(EventTypes.ON_ENTER, handler);

    return function offEnter() {
      emitter.off(EventTypes.ON_ENTER, handler);
    }
  }

  /**
   * 注册退出状态时触发的回调
   */
  function onExit(handler: (data: Events<T>[EventTypes.ON_EXIT]) => void) {
    emitter.on(EventTypes.ON_EXIT, handler);

    return function offExit() {
      emitter.off(EventTypes.ON_EXIT, handler);
    }
  }

  /**
   * 状态迁移
   */
  async function transition(action: Actions<T>, meta?: unknown) {
    await emitter.emit(EventTypes.ON_EXIT, { action, current, meta})
    const last = current;
    const currentAction = (config[current] as Record<string, any>)[action as string];
    if (!currentAction) {
      return;
    }
    current = await currentAction(meta);
    await emitter.emit(EventTypes.ON_ENTER, { action, current, last, meta});
    await stateEmitter.emit(current, {
      action,
      current,
      last: last as Exclude<keyof T, keyof T & string>,
      meta,
    });
    return current;
  }

  function buildActions<T extends Config>(config: T, transition: Transition<T>) {
    const actionSet = Object.values(config).reduce((acc, curr) => {
      Object.keys(curr).forEach(key => {
        acc.add(key as Actions<T>);
      });
      return acc;
    }, new Set<Actions<T>>())

    return Array.from(actionSet).reduce((acc, action) => {
      acc[action] = function doTransition(meta?: unknown) {
        return transition(action, meta);
      }
      return acc;
    }, {} as Record<Actions<T>, (meta?: unknown) => Promise<string | undefined>>);
  }

  function buildHandlers<T extends Config>(
    config: T,
    emitter: EventEmitter<StateEvents<T>>
  ) {
    const keys = Object.keys(config) as (keyof T)[];
  
    return keys.reduce((acc, cur: any) => {
      const first = cur.slice(0, 1);
      const rest = cur.slice(1).split("");
  
      const k = `on${first.toUpperCase()}${rest.join("")}` as `on${Capitalize<
        Extract<keyof T, string>
      >}`;
  
      acc[k] = (handler: EventHandler<StateEvents<T>[keyof T]>) => {
        emitter.on(cur, handler);
  
        return () => emitter.off(cur, handler);
      };
  
      return acc;
    }, <Record<`on${Capitalize<keyof T & string>}`, (handler: EventHandler<StateEvents<T>[keyof T]>) => () => void>>{});
  }

  return {
    ...actions,
    ...handlers,
    onEnter,
    onExit,
    transition,
    getState,
  };
}

export * from './types';
