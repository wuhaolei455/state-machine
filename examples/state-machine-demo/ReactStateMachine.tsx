import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { createMachine, Config, Options } from '../../src/index';

/**
 * React状态机Hook - 最佳实践实现
 * 
 * 这个Hook封装了状态机的创建和管理，提供了：
 * 1. 自动同步状态机状态到React状态
 * 2. 清理事件监听器
 * 3. 类型安全的状态转换方法
 * 4. 状态变化回调支持
 */
function useStateMachine<T extends Config>(
  config: T,
  options: Options<T> & {
    onStateChange?: (current: keyof T & string, last: keyof T & string) => void;
  }
) {
  const { onStateChange, ...machineOptions } = options;
  
  // 使用useRef存储状态机实例，避免重新创建
  const machineRef = useRef<ReturnType<typeof createMachine<T>> | null>(null);
  
  // 使用useState同步状态机的当前状态，用于触发React重新渲染
  const [currentState, setCurrentState] = useState<keyof T & string>(
    machineOptions.initialState
  );
  
  // 使用useState跟踪状态转换的加载状态
  const [isTransitioning, setIsTransitioning] = useState(false);

  // 初始化状态机实例（仅在首次渲染时创建）
  if (!machineRef.current) {
    machineRef.current = createMachine(config, machineOptions);
  }

  const machine = machineRef.current;

  // 使用useEffect监听状态变化并同步到React状态
  useEffect(() => {
    // 监听所有状态的进入事件
    const unsubscribeEnter = machine.onEnter((event) => {
      setCurrentState(event.current as keyof T & string);
      setIsTransitioning(false);
      
      // 调用用户提供的状态变化回调
      if (onStateChange) {
        onStateChange(
          event.current as keyof T & string,
          event.last as keyof T & string
        );
      }
    });

    // 监听状态退出事件，设置转换中状态
    const unsubscribeExit = machine.onExit(() => {
      setIsTransitioning(true);
    });

    // 清理函数：组件卸载时取消订阅
    return () => {
      unsubscribeEnter();
      unsubscribeExit();
    };
  }, [machine, onStateChange]);

  // 创建状态转换方法，使用useCallback优化性能
  const transition = useCallback(
    async (action: Parameters<typeof machine.transition>[0], meta?: unknown) => {
      setIsTransitioning(true);
      try {
        const newState = await machine.transition(action, meta);
        return newState;
      } catch (error) {
        setIsTransitioning(false);
        throw error;
      }
    },
    [machine]
  );

  // 获取所有可用的动作方法
  const actions = useMemo(() => {
    const actionMethods: Record<string, (meta?: unknown) => Promise<any>> = {};
    
    // 从状态机实例中提取所有动作方法
    Object.keys(machine).forEach((key) => {
      if (
        typeof machine[key as keyof typeof machine] === 'function' &&
        key !== 'transition' &&
        key !== 'getState' &&
        !key.startsWith('on')
      ) {
        actionMethods[key] = machine[key as keyof typeof machine] as (
          meta?: unknown
        ) => Promise<any>;
      }
    });
    
    return actionMethods;
  }, [machine]);

  return {
    // 当前状态
    currentState,
    // 是否正在转换中
    isTransitioning,
    // 状态转换方法
    transition,
    // 所有可用的动作方法
    actions,
    // 获取当前状态（同步方法）
    getState: () => machine.getState(),
    // 状态机实例（用于高级用法）
    machine,
  };
}

/**
 * 示例：任务管理状态机组件
 * 
 * 演示了一个任务从待处理 -> 进行中 -> 已完成的状态流转
 */
type TaskState = 'idle' | 'pending' | 'inProgress' | 'completed' | 'failed';

const taskMachineConfig = {
  idle: {
    start: () => 'pending' as TaskState,
  },
  pending: {
    begin: async () => {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 500));
      return 'inProgress' as TaskState;
    },
    cancel: () => 'idle' as TaskState,
  },
  inProgress: {
    complete: async () => {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 800));
      return 'completed' as TaskState;
    },
    fail: () => 'failed' as TaskState,
    pause: () => 'pending' as TaskState,
  },
  completed: {
    reset: () => 'idle' as TaskState,
  },
  failed: {
    retry: () => 'pending' as TaskState,
    reset: () => 'idle' as TaskState,
  },
} as const satisfies Config;

/**
 * 任务管理组件
 */
export const TaskManager: React.FC = () => {
  const {
    currentState,
    isTransitioning,
    actions,
    transition,
  } = useStateMachine(taskMachineConfig, {
    initialState: 'idle',
    onStateChange: (current, last) => {
      console.log(`状态变化: ${last} -> ${current}`);
    },
  });

  // 根据当前状态渲染不同的UI
  const renderStateContent = () => {
    switch (currentState) {
      case 'idle':
        return (
          <div className="state-content">
            <h3>待开始</h3>
            <p>任务尚未开始</p>
            <button
              onClick={() => actions.start?.()}
              disabled={isTransitioning}
            >
              开始任务
            </button>
          </div>
        );
      case 'pending':
        return (
          <div className="state-content">
            <h3>待处理</h3>
            <p>任务已创建，等待开始</p>
            <button
              onClick={() => actions.begin?.()}
              disabled={isTransitioning}
            >
              {isTransitioning ? '开始中...' : '开始执行'}
            </button>
            <button
              onClick={() => actions.cancel?.()}
              disabled={isTransitioning}
            >
              取消
            </button>
          </div>
        );
      case 'inProgress':
        return (
          <div className="state-content">
            <h3>进行中</h3>
            <p>任务正在执行中...</p>
            <button
              onClick={() => actions.complete?.()}
              disabled={isTransitioning}
            >
              {isTransitioning ? '完成中...' : '标记完成'}
            </button>
            <button
              onClick={() => actions.fail?.()}
              disabled={isTransitioning}
            >
              标记失败
            </button>
            <button
              onClick={() => actions.pause?.()}
              disabled={isTransitioning}
            >
              暂停
            </button>
          </div>
        );
      case 'completed':
        return (
          <div className="state-content">
            <h3>已完成</h3>
            <p>任务已成功完成！</p>
            <button
              onClick={() => actions.reset?.()}
              disabled={isTransitioning}
            >
              重置任务
            </button>
          </div>
        );
      case 'failed':
        return (
          <div className="state-content">
            <h3>失败</h3>
            <p>任务执行失败</p>
            <button
              onClick={() => actions.retry?.()}
              disabled={isTransitioning}
            >
              重试
            </button>
            <button
              onClick={() => actions.reset?.()}
              disabled={isTransitioning}
            >
              重置
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="task-manager">
      <div className="state-indicator">
        <div className={`state-badge state-${currentState}`}>
          {currentState}
          {isTransitioning && <span className="loading">转换中...</span>}
        </div>
      </div>
      {renderStateContent()}
      <div className="state-info">
        <p>当前状态: <strong>{currentState}</strong></p>
        <p>转换状态: {isTransitioning ? '是' : '否'}</p>
      </div>
    </div>
  );
};

/**
 * 更简单的示例：开关组件
 */
export const LightSwitch: React.FC = () => {
  const lightMachineConfig = {
    off: {
      switchOn: () => 'on' as const,
    },
    on: {
      switchOff: () => 'off' as const,
    },
  } as const satisfies Config;

  const { currentState, actions, isTransitioning } = useStateMachine(
    lightMachineConfig,
    {
      initialState: 'off',
    }
  );

  return (
    <div className="light-switch">
      <div className={`light ${currentState}`}>
        {currentState === 'on' ? '💡' : '⚫'}
      </div>
      <button
        onClick={() => {
          if (currentState === 'off') {
            actions.switchOn?.();
          } else {
            actions.switchOff?.();
          }
        }}
        disabled={isTransitioning}
      >
        {currentState === 'off' ? '打开' : '关闭'}
      </button>
    </div>
  );
};

/**
 * 使用示例和最佳实践说明
 * 
 * ## React状态机集成最佳实践：
 * 
 * 1. **状态机实例管理**
 *    - 使用 useRef 存储状态机实例，避免每次渲染都重新创建
 *    - 状态机实例应该是稳定的，不随组件重新渲染而改变
 * 
 * 2. **状态同步**
 *    - 使用 useState 存储当前状态，用于触发React重新渲染
 *    - 通过 useEffect 监听状态机的状态变化事件，同步更新React状态
 * 
 * 3. **事件清理**
 *    - 在 useEffect 的清理函数中取消事件订阅，防止内存泄漏
 *    - 确保组件卸载时所有监听器都被正确清理
 * 
 * 4. **异步处理**
 *    - 使用 isTransitioning 状态跟踪异步转换过程
 *    - 在转换过程中禁用相关按钮，防止重复操作
 * 
 * 5. **性能优化**
 *    - 使用 useCallback 缓存状态转换方法
 *    - 使用 useMemo 缓存计算值（如动作方法集合）
 * 
 * 6. **类型安全**
 *    - 充分利用TypeScript的类型推断
 *    - 使用 satisfies 确保配置类型正确
 * 
 * 7. **用户体验**
 *    - 提供清晰的视觉反馈（加载状态、状态指示器）
 *    - 根据当前状态显示不同的UI和可用操作
 */

export default TaskManager;

