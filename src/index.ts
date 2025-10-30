import { Config, Options } from "./types";

export function createMachine<T extends Config>(config: T, options: Options<T>) {
  const { initialState } = options;

  let current = initialState;

  function getState() {
    return current;
  }


  // todo
  let secEmitter;
  let emitter;

  const transition = () => {}
  const buildActions = (config: T, func: any) => {}
  const buildHandlers = (config: T, emitter: any) => {}
  const handlers = buildHandlers(config, secEmitter);
  const actions = buildActions(config, transition)

  return {
    state: initialState,
    actions,
  };
}
