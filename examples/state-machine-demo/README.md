# React状态机集成最佳实践

本文档介绍了如何在React应用中集成和使用状态机，以及相关的最佳实践。

## 核心Hook: `useStateMachine`

`c` 是一个自定义React Hook，封装了状态机的创建、状态同步和事件管理。

### 基本用法

```tsx
import { useStateMachine } from './ReactStateMachine';

const config = {
  idle: {
    start: () => 'active',
  },
  active: {
    stop: () => 'idle',
  },
};

function MyComponent() {
  const { currentState, actions, isTransitioning } = useStateMachine(config, {
    initialState: 'idle',
  });

  return (
    <div>
      <p>当前状态: {currentState}</p>
      <button onClick={() => actions.start?.()} disabled={isTransitioning}>
        开始
      </button>
    </div>
  );
}
```

## 最佳实践

### 1. 状态机实例管理

**✅ 正确做法：使用 useRef**

```tsx
const machineRef = useRef<ReturnType<typeof createMachine>>(null);

if (!machineRef.current) {
  machineRef.current = createMachine(config, options);
}
```

**❌ 错误做法：每次渲染都创建新实例**

```tsx
// 错误：每次渲染都会创建新的状态机实例
const machine = createMachine(config, options);
```

**原因：** 状态机实例应该在整个组件生命周期中保持稳定，避免不必要的重新创建和状态丢失。

### 2. 状态同步

**✅ 正确做法：使用 useState + useEffect 同步状态**

```tsx
const [currentState, setCurrentState] = useState(initialState);

useEffect(() => {
  const unsubscribe = machine.onEnter((event) => {
    setCurrentState(event.current);
  });
  return unsubscribe;
}, [machine]);
```

**原因：** 状态机的状态变化不会自动触发React重新渲染，需要通过事件监听器同步到React状态。

### 3. 事件清理

**✅ 正确做法：在 useEffect 清理函数中取消订阅**

```tsx
useEffect(() => {
  const unsubscribe = machine.onEnter(handler);
  return () => {
    unsubscribe(); // 清理订阅
  };
}, [machine]);
```

**原因：** 防止内存泄漏，确保组件卸载时所有事件监听器都被正确清理。

### 4. 异步状态转换

**✅ 正确做法：跟踪转换状态，禁用相关操作**

```tsx
const [isTransitioning, setIsTransitioning] = useState(false);

const transition = useCallback(async (action, meta) => {
  setIsTransitioning(true);
  try {
    await machine.transition(action, meta);
  } finally {
    setIsTransitioning(false);
  }
}, [machine]);

// 在UI中使用
<button onClick={handleClick} disabled={isTransitioning}>
  {isTransitioning ? '处理中...' : '提交'}
</button>
```

**原因：** 防止用户在异步转换过程中重复触发操作，提供更好的用户体验。

### 5. 性能优化

**✅ 使用 useCallback 和 useMemo**

```tsx
// 缓存转换方法
const transition = useCallback(async (action, meta) => {
  // ...
}, [machine]);

// 缓存计算值
const actions = useMemo(() => {
  // 提取动作方法
  return actionMethods;
}, [machine]);
```

**原因：** 避免不必要的函数重新创建，减少子组件不必要的重新渲染。

### 6. 类型安全

**✅ 使用 TypeScript 和 satisfies**

```tsx
const config = {
  idle: {
    start: () => 'active' as const,
  },
  active: {
    stop: () => 'idle' as const,
  },
} as const satisfies Config;
```

**原因：** 确保配置类型正确，获得完整的类型推断和类型检查。

### 7. 状态变化回调

**✅ 提供可选的状态变化回调**

```tsx
const { currentState } = useStateMachine(config, {
  initialState: 'idle',
  onStateChange: (current, last) => {
    console.log(`状态从 ${last} 变为 ${current}`);
    // 可以在这里执行副作用，如日志记录、分析等
  },
});
```

**原因：** 允许组件在状态变化时执行自定义逻辑，而不需要直接监听事件。

## 完整示例

### 任务管理状态机

```tsx
const taskMachineConfig = {
  idle: {
    start: () => 'pending',
  },
  pending: {
    begin: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return 'inProgress';
    },
    cancel: () => 'idle',
  },
  inProgress: {
    complete: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return 'completed';
    },
    fail: () => 'failed',
  },
  completed: {
    reset: () => 'idle',
  },
  failed: {
    retry: () => 'pending',
    reset: () => 'idle',
  },
} as const satisfies Config;

function TaskComponent() {
  const { currentState, actions, isTransitioning } = useStateMachine(
    taskMachineConfig,
    {
      initialState: 'idle',
      onStateChange: (current, last) => {
        // 记录状态变化
        analytics.track('state_change', { from: last, to: current });
      },
    }
  );

  return (
    <div>
      <div>状态: {currentState}</div>
      {currentState === 'idle' && (
        <button onClick={() => actions.start?.()} disabled={isTransitioning}>
          开始任务
        </button>
      )}
      {currentState === 'pending' && (
        <>
          <button onClick={() => actions.begin?.()} disabled={isTransitioning}>
            {isTransitioning ? '开始中...' : '开始执行'}
          </button>
          <button onClick={() => actions.cancel?.()} disabled={isTransitioning}>
            取消
          </button>
        </>
      )}
      {/* 其他状态... */}
    </div>
  );
}
```

## 常见问题

### Q: 为什么状态机实例要用 useRef 而不是 useState？

A: 状态机实例本身不需要触发React重新渲染，它只是一个工具对象。使用 useRef 可以避免不必要的重新创建，同时保持实例的稳定性。

### Q: 如何处理状态转换错误？

A: 可以在 transition 方法中添加错误处理：

```tsx
const transition = useCallback(async (action, meta) => {
  setIsTransitioning(true);
  try {
    await machine.transition(action, meta);
  } catch (error) {
    console.error('状态转换失败:', error);
    // 处理错误，如显示错误消息
  } finally {
    setIsTransitioning(false);
  }
}, [machine]);
```

### Q: 可以在多个组件中共享同一个状态机实例吗？

A: 可以，但需要将状态机实例提升到共同的父组件或使用Context：

```tsx
// 在父组件中创建
const machine = useMemo(() => createMachine(config, options), []);

// 通过Context传递给子组件
const MachineContext = createContext(machine);
```

### Q: 如何测试使用状态机的React组件？

A: 可以模拟状态机实例，或者使用真实的状态机但控制其行为：

```tsx
// 测试示例
test('should update state when action is triggered', async () => {
  const { result } = renderHook(() => useStateMachine(config, { initialState: 'idle' }));
  
  await act(async () => {
    await result.current.actions.start?.();
  });
  
  expect(result.current.currentState).toBe('pending');
});
```

## 总结

React状态机集成的最佳实践核心要点：

1. **稳定性**：使用 useRef 保持状态机实例稳定
2. **同步**：通过事件监听器同步状态到React
3. **清理**：正确清理事件订阅
4. **用户体验**：跟踪转换状态，提供反馈
5. **性能**：使用 useCallback 和 useMemo 优化
6. **类型安全**：充分利用TypeScript类型系统

遵循这些实践，可以确保状态机在React应用中稳定、高效地运行。

