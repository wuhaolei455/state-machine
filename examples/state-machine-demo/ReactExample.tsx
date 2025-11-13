/**
 * React状态机使用示例
 * 
 * 这个文件展示了如何在React应用中集成和使用状态机
 */

import React from 'react';
import { TaskManager, LightSwitch } from './ReactStateMachine';
import './styles.css';

/**
 * 主应用组件
 */
export const App: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>React状态机示例</h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>示例1: 任务管理器</h2>
        <TaskManager />
      </section>
      
      <section style={{ marginBottom: '40px' }}>
        <h2>示例2: 开关组件</h2>
        <LightSwitch />
      </section>
    </div>
  );
};

export default App;

