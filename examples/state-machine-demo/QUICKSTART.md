# React状态机快速开始指南

## 概述

本项目提供了一个完整的React状态机集成方案，展示了如何在React应用中优雅地使用状态机来管理组件状态。

## 文件结构

```
state-machine-demo/
├── ReactStateMachine.tsx    # 核心Hook实现和示例组件
├── ReactExample.tsx         # 使用示例
├── styles.css               # 样式文件
├── README.md                # 详细的最佳实践文档
├── QUICKSTART.md            # 本文件
└── package.json             # 依赖配置
```

## 快速开始

### 1. 安装依赖

```bash
# 在项目根目录
npm install

# 如果需要运行React示例，需要安装React相关依赖
cd examples/state-machine-demo
npm install
```

### 2. 使用 useStateMachine Hook

```tsx
import { useStateMachine } from './ReactStateMachine';
import { Config } from '../../src/index';

// 定义状态机配置
const myMachineConfig = {
  idle: {
    start: () => 'active',
  },
  active: {
    stop: () => 'idle',
  },
} as const satisfies Config;

function MyComponent() {
  const { currentState, actions, isTransitioning } = useStateMachine(
    myMachineConfig,
    {
      initialState: 'idle',
      onStateChange: (current, last) => {
        console.log(`状态从 ${last} 变为 ${current}`);
      },
    }
  );

  return (
    <div>
      <p>当前状态: {currentState}</p>
      <button 
        onClick={() => actions.start?.()} 
        disabled={isTransitioning}
      >
        开始
      </button>
    </div>
  );
}
```

### 3. Hook返回值说明

`useStateMachine` 返回一个对象，包含以下属性：

- **currentState**: 当前状态（会触发React重新渲染）
- **isTransitioning**: 是否正在转换中（用于显示加载状态）
- **actions**: 所有可用的动作方法（动态生成）
- **transition**: 手动触发状态转换的方法
- **getState**: 获取当前状态（同步方法）
- **machine**: 状态机实例（用于高级用法）

### 4. 异步状态转换

状态机支持异步操作：

```tsx
const config = {
  idle: {
    start: async () => {
      await fetch('/api/start');
      return 'active';
    },
  },
} as const satisfies Config;

// 使用时自动处理异步
const { actions, isTransitioning } = useStateMachine(config, {
  initialState: 'idle',
});

// isTransitioning 会在转换过程中自动更新
<button disabled={isTransitioning}>
  {isTransitioning ? '处理中...' : '开始'}
</button>
```

## 示例组件

### TaskManager - 任务管理状态机

展示了完整的状态流转：`idle -> pending -> inProgress -> completed/failed`

### LightSwitch - 简单开关组件

展示了最简单的状态机用法：`off <-> on`

## 核心最佳实践

1. **使用 useRef 存储状态机实例** - 保持实例稳定
2. **使用 useState 同步状态** - 触发React重新渲染
3. **在 useEffect 中清理事件** - 防止内存泄漏
4. **跟踪转换状态** - 提供更好的用户体验
5. **使用 useCallback/useMemo** - 优化性能
6. **充分利用TypeScript类型** - 确保类型安全

详细的最佳实践说明请参考 [README.md](./README.md)

## 运行示例

如果配置了React开发环境，可以直接运行：

```bash
# 使用Vite
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
# 复制 state-machine-demo 目录下的文件到项目中
```

## 类型安全

所有API都提供了完整的TypeScript类型支持：

- 状态类型自动推断
- 动作方法类型检查
- 配置类型验证

## 常见问题

### Q: 为什么需要 useStateMachine Hook？

A: 状态机本身不会触发React重新渲染，需要通过事件监听器同步状态。这个Hook封装了所有必要的逻辑。

### Q: 可以在多个组件中使用同一个状态机吗？

A: 可以，但需要将状态机实例提升到父组件或使用Context共享。

### Q: 如何处理错误？

A: 可以在 transition 方法中添加 try-catch，或者使用 Promise 的 catch 方法。

## 下一步

- 阅读 [README.md](./README.md) 了解详细的最佳实践
- 查看 `ReactStateMachine.tsx` 了解实现细节
- 运行 `ReactExample.tsx` 查看实际效果

