import { createMachine } from "../dist/index";

const lightSwitch = {
  off: {
    switchOn: () => "on",
    switchOnAsync: async () => {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 100));
      return "on";
    },
  },
  on: {
    switchOff: () => "off",
    switchOffAsync: async () => {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 100));
      return "off";
    },
  },
};

// 创建状态机实例
// 注意：机器会动态生成方法（如 switchOn, switchOff 等）和状态监听器（如 onOff, onOn 等）
const lightMachine = createMachine(lightSwitch, {
  initialState: "off",
});

console.log("=== 状态机使用示例 ===\n");

// 1. 获取当前状态
console.log("1. 初始状态:", lightMachine.getState()); // off

// 2. 监听状态进入事件（所有状态转换时触发）
const unsubscribeEnter = lightMachine.onEnter((event) => {
  console.log(
    `进入状态: ${event.current}, 来自状态: ${event.last}, 触发动作: ${event.action}`
  );
});

// 3. 监听状态退出事件（所有状态转换时触发）
const unsubscribeExit = lightMachine.onExit((event) => {
  console.log(`退出状态: ${event.current}, 触发动作: ${event.action}`);
});

// 4. 监听特定状态的进入事件（使用动态生成的方法）
const unsubscribeOnOff = lightMachine.onOff((event) => {
  console.log(`[off状态监听器] 进入了off状态`);
});

const unsubscribeOnOn = lightMachine.onOn((event) => {
  console.log(`[on状态监听器] 进入了on状态`);
});

// 5. 使用 transition 方法进行状态转换
// console.log("\n2. 使用 transition 方法:");
// console.log("   执行 switchOn 动作...");
// lightMachine.transition("switchOn").then((newState) => {
//   console.log(`   转换完成，新状态: ${newState}`);
//   console.log(`   当前状态: ${lightMachine.getState()}\n`);
// });

// 6. 使用动态生成的方法（更简洁的方式）
// console.log("3. 使用动态生成的方法:");
// console.log("   执行 switchOff 动作...");
// lightMachine.switchOff().then((newState) => {
//   console.log(`   转换完成，新状态: ${newState}`);
//   console.log(`   当前状态: ${lightMachine.getState()}\n`);
// });

// // 7. 异步状态转换
// console.log("4. 异步状态转换:");
// console.log("   执行 switchOnAsync 动作...");
// lightMachine.switchOnAsync().then((newState) => {
//   console.log(`   异步转换完成，新状态: ${newState}`);
//   console.log(`   当前状态: ${lightMachine.getState()}\n`);
// });

// 8. 传递元数据
// console.log("5. 带元数据的状态转换:");
// const metaData = { reason: "用户手动关闭" };
// lightMachine.transition("switchOff", metaData).then((newState) => {
//   console.log(`   转换完成，新状态: ${newState}`);
//   console.log(`   当前状态: ${lightMachine.getState()}\n`);
// });

// // 9. 连续状态转换
setTimeout(() => {
  console.log("6. 连续状态转换:");
  Promise.resolve()
    .then(() => {
      console.log("   切换到 on...");
      return lightMachine.switchOn();
    })
    .then(() => {
      console.log(`   当前状态: ${lightMachine.getState()}`);
      console.log("   切换到 off...");
      return lightMachine.switchOff();
    })
    .then(() => {
      console.log("   切换到 on...");
      return lightMachine.switchOn();
    })
    .then(() => {
      console.log(`   当前状态: ${lightMachine.getState()}`);
      console.log("   切换到 off...");
      return lightMachine.switchOff();
    })
    .then(() => {
      unsubscribeEnter();
      unsubscribeExit();
      unsubscribeOnOff();
      unsubscribeOnOn();
      console.log(`   当前状态: ${lightMachine.getState()}`);
      console.log("\n=== 示例完成 ===");
    });
}, 500);
