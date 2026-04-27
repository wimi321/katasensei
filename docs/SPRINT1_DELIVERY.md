# Sprint 1 Delivery

## 已交付

- 启动诊断模块
- 用户可读错误码
- Claude 兼容代理 provider 抽象
- 学生画像基础服务
- 本地知识卡 schema、检索和 48 张 P0 教学卡
- 老师结构化结果 schema 与 prompt builder
- Renderer 诊断页、设置面板、老师结果卡片
- smoke check 脚本

## 需要合并的现有文件

1. `src/main/index.ts`
   - 加 IPC：`diagnostics:get`、`students:list`、`students:resolve-fox`、`students:attach-game`、`knowledge:search`
2. `src/preload/index.ts`
   - 暴露上述方法
3. `src/main/services/llm.ts`
   - 改为调用 `postOpenAICompatibleChat` 和 `probeOpenAICompatibleProvider`
4. `src/renderer/src/App.tsx`
   - 启动时先拿 diagnostics，blocked 时显示 `DiagnosticsPanel`
5. `src/renderer/src/styles.css`
   - import / 合并 diagnostics、teacher-result 样式

## 下一批开发

- SGF 导入后绑定学生
- 野狐同步后自动 resolve 学生画像
- Teacher runtime 接入知识库和画像
- 棋盘 UI 视觉重构
