# Sprint 3 Delivery: Board + Teacher UX Upgrade

## 已提供的新增文件

### Board UX

- `src/renderer/src/features/board/boardGeometry.ts`
- `src/renderer/src/features/board/GoBoardV2.tsx`
- `src/renderer/src/features/board/WinrateTimelineV2.tsx`
- `src/renderer/src/features/board/BoardInsightPanel.tsx`
- `src/renderer/src/features/board/board-v2.css`

### Teacher UX

- `src/renderer/src/features/teacher/TeacherRunCardPro.tsx`
- `src/renderer/src/features/teacher/TeacherComposerPro.tsx`
- `src/renderer/src/features/teacher/teacher-pro.css`

### Design System

- `src/renderer/src/styles/design-tokens.css`

### Tests / Contracts

- `tests/sprint3-ui-contract.test.mjs`

## Sprint 3 验收目标

1. 棋盘视觉不再像开发调试图，而像正式围棋分析产品。
2. 推荐点可以清楚表达主推荐、次推荐、胜率、目差和访问数。
3. 当前手、最后一手、关键问题手能被用户一眼看到。
4. 胜率图能支持当前手和关键问题手定位。
5. 老师区输出不再是一大段 markdown，而是结构化卡片。
6. 工具日志默认折叠，出错时能定位阶段。
7. UI 仍保持原三栏结构，不破坏 Sprint 1/2 的主链路。

## 本轮不做

- 不提交 KataGo binary/model。
- 不重写主进程 Teacher Runtime。
- 不新增大依赖。
- 不做完整题库系统。
- 不改发布策略。
