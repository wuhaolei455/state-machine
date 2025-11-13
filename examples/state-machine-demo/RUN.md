# 运行说明

## 前置要求

1. Node.js >= 16.0.0
2. 状态机库的源代码在 `../../src` 目录（webpack会自动处理TypeScript文件，无需预先构建）

## 安装依赖

```bash
cd examples/state-machine-demo
npm install
```

## 运行开发服务器

```bash
npm run dev
# 或
npm start
```

开发服务器会在 http://localhost:3000 启动，并自动打开浏览器。

## 构建生产版本

```bash
npm run build
```

构建后的文件会在 `dist` 目录中。

## 项目结构

```
state-machine-demo/
├── index.html              # HTML入口文件
├── index.tsx               # React应用入口
├── ReactStateMachine.tsx   # 状态机Hook和组件
├── ReactExample.tsx        # 示例组件
├── styles.css              # 样式文件
├── webpack.config.js       # Webpack配置
├── tsconfig.json           # TypeScript配置
└── package.json            # 依赖配置
```

## 故障排除

### 如果遇到模块解析错误

确保状态机库已经构建：
```bash
cd ../..
npm run build
```

### 如果端口被占用

修改 `webpack.config.js` 中的 `devServer.port` 配置。

