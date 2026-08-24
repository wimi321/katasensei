# GoAgent v0.4.21

GoAgent v0.4.21 adds optional ChatGPT sign-in through an embedded Codex App Server while preserving the existing OpenAI-compatible API connection and GoAgent's domain-specific teacher runtime. KataGo 1.17.1, the official Transformer 10B Balanced model, the official Zhizi API, Metal, OpenCL, CUDA/CUDNN, SHA-256 asset verification, and the multilingual download center remain included. local KataGo remains the default. KataGo 1.17.2 is reserved for its upstream TensorRT-specific fixes.

QQ群：1030632742，欢迎交流、反馈问题并一起完善 GoAgent。

## 中文

### 下载

| 平台 / 场景 | 下载 |
| --- | --- |
| macOS Apple Silicon（M 系列） | [GoAgent-0.4.21-mac-arm64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-arm64.dmg) |
| macOS Intel | [GoAgent-0.4.21-mac-x64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-x64.dmg) |
| Windows x64 标准版（OpenCL）免安装 ZIP，推荐大多数用户 | [GoAgent-0.4.21-win-x64-portable.zip](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-portable.zip) |
| Windows x64 标准版（OpenCL）安装版 | [GoAgent-0.4.21-win-x64.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64.exe) |
| Windows x64 NVIDIA 专版（CUDA/CUDNN）免安装 7z | [GoAgent-0.4.21-win-x64-nvidia-portable.7z](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia-portable.7z) |
| Windows x64 NVIDIA 专版（CUDA/CUDNN）安装版 | [GoAgent-0.4.21-win-x64-nvidia.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia.exe) |

### 本版重点

- 新增可选的 ChatGPT 登录；GoAgent 仍由自己的围棋老师运行时管理棋盘截图、KataGo、知识库和棋手画像。
- ChatGPT 连接只有在真实文字、随机棋盘图片和动态围棋工具三项测试通过后才会显示就绪。
- GoAgent 使用独立登录目录，不会退出或修改 Codex CLI、Codex Desktop 的账号。
- 安装包内置并校验 Codex 0.149.0 运行时；不同 AI 连接失败时不会偷偷切换到另一种方式。
- 本机 KataGo 仍是默认分析引擎；智子云只在用户主动启用后使用。

## 繁體中文

### 下載

| 平台 / 情境 | 下載 |
| --- | --- |
| macOS Apple Silicon（M 系列） | [GoAgent-0.4.21-mac-arm64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-arm64.dmg) |
| macOS Intel | [GoAgent-0.4.21-mac-x64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-x64.dmg) |
| Windows x64 標準版（OpenCL）免安裝 ZIP，建議多數使用者 | [GoAgent-0.4.21-win-x64-portable.zip](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-portable.zip) |
| Windows x64 標準版（OpenCL）安裝版 | [GoAgent-0.4.21-win-x64.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64.exe) |
| Windows x64 NVIDIA（CUDA/CUDNN）免安裝 7z | [GoAgent-0.4.21-win-x64-nvidia-portable.7z](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia-portable.7z) |
| Windows x64 NVIDIA（CUDA/CUDNN）安裝版 | [GoAgent-0.4.21-win-x64-nvidia.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia.exe) |

### 本版重點

- 新增可選的 ChatGPT 登入；棋盤截圖、KataGo、知識庫與棋手資料仍由 GoAgent 的圍棋老師執行環境管理。
- 只有真實文字、隨機棋盤圖片與動態圍棋工具三項測試全部通過，才會顯示 ChatGPT 已就緒。
- GoAgent 使用獨立登入目錄，不會影響 Codex CLI 或 Codex Desktop 的帳號。
- 安裝包內建並驗證 Codex 0.149.0；不同 AI 連線之間不會自動切換。
- 本機 KataGo 仍是預設分析引擎；智子雲只在使用者主動啟用後使用。

## English

### Downloads

| Platform / use case | Download |
| --- | --- |
| macOS Apple Silicon | [GoAgent-0.4.21-mac-arm64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-arm64.dmg) |
| macOS Intel | [GoAgent-0.4.21-mac-x64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-x64.dmg) |
| Windows x64 Standard (OpenCL) portable ZIP, recommended for most users | [GoAgent-0.4.21-win-x64-portable.zip](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-portable.zip) |
| Windows x64 Standard (OpenCL) installer | [GoAgent-0.4.21-win-x64.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64.exe) |
| Windows x64 NVIDIA (CUDA/CUDNN) portable 7z | [GoAgent-0.4.21-win-x64-nvidia-portable.7z](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia-portable.7z) |
| Windows x64 NVIDIA (CUDA/CUDNN) installer | [GoAgent-0.4.21-win-x64-nvidia.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia.exe) |

### Highlights

- Adds optional ChatGPT sign-in without replacing GoAgent's Go-specific teacher runtime or the existing OpenAI-compatible API connection.
- Verifies text, a randomized board image, and a real dynamic Go-tool round trip before marking ChatGPT ready.
- Keeps GoAgent credentials isolated from Codex CLI and Codex Desktop account state.
- Bundles and verifies the pinned Codex 0.149.0 App Server for each package platform; providers never silently fall back to one another.
- local KataGo remains the default; Zhizi Cloud is used only after explicit activation.

## 日本語

### ダウンロード

| 環境 | ダウンロード |
| --- | --- |
| macOS Apple Silicon | [GoAgent-0.4.21-mac-arm64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-arm64.dmg) |
| macOS Intel | [GoAgent-0.4.21-mac-x64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-x64.dmg) |
| Windows x64 Standard（OpenCL）ポータブル ZIP | [GoAgent-0.4.21-win-x64-portable.zip](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-portable.zip) |
| Windows x64 Standard（OpenCL）インストーラー | [GoAgent-0.4.21-win-x64.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64.exe) |
| Windows x64 NVIDIA（CUDA/CUDNN）ポータブル 7z | [GoAgent-0.4.21-win-x64-nvidia-portable.7z](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia-portable.7z) |
| Windows x64 NVIDIA（CUDA/CUDNN）インストーラー | [GoAgent-0.4.21-win-x64-nvidia.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia.exe) |

### 主な変更

- GoAgent 独自の囲碁先生ランタイムを維持したまま、任意の ChatGPT ログインを追加しました。
- テキスト、ランダム盤面画像、動的な囲碁ツール呼び出しを実際に確認してから利用可能と表示します。
- GoAgent のログイン領域は Codex CLI / Desktop と分離されています。
- 各 OS 用 Codex 0.149.0 App Server を同梱して検証し、接続方式を自動で切り替えません。
- ローカル KataGo が既定で、智子クラウドは明示的に有効化した場合のみ使用します。

## 한국어

### 다운로드

| 환경 | 다운로드 |
| --- | --- |
| macOS Apple Silicon | [GoAgent-0.4.21-mac-arm64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-arm64.dmg) |
| macOS Intel | [GoAgent-0.4.21-mac-x64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-x64.dmg) |
| Windows x64 Standard (OpenCL) 포터블 ZIP | [GoAgent-0.4.21-win-x64-portable.zip](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-portable.zip) |
| Windows x64 Standard (OpenCL) 설치 프로그램 | [GoAgent-0.4.21-win-x64.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64.exe) |
| Windows x64 NVIDIA (CUDA/CUDNN) 포터블 7z | [GoAgent-0.4.21-win-x64-nvidia-portable.7z](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia-portable.7z) |
| Windows x64 NVIDIA (CUDA/CUDNN) 설치 프로그램 | [GoAgent-0.4.21-win-x64-nvidia.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia.exe) |

### 주요 변경

- GoAgent의 바둑 전용 선생님 런타임을 유지하면서 선택형 ChatGPT 로그인을 추가했습니다.
- 실제 텍스트, 무작위 바둑판 이미지, 동적 바둑 도구 호출을 모두 확인한 뒤 준비 상태를 표시합니다.
- GoAgent 로그인은 Codex CLI 및 Codex Desktop 계정과 분리됩니다.
- 플랫폼별 Codex 0.149.0 App Server를 포함하고 검증하며 연결 방식을 자동 전환하지 않습니다.
- 로컬 KataGo가 기본이며 Zhizi Cloud는 사용자가 직접 활성화한 경우에만 사용합니다.

## ภาษาไทย

### ดาวน์โหลด

| แพลตฟอร์ม | ดาวน์โหลด |
| --- | --- |
| macOS Apple Silicon | [GoAgent-0.4.21-mac-arm64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-arm64.dmg) |
| macOS Intel | [GoAgent-0.4.21-mac-x64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-x64.dmg) |
| Windows x64 Standard (OpenCL) portable ZIP | [GoAgent-0.4.21-win-x64-portable.zip](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-portable.zip) |
| Windows x64 Standard (OpenCL) installer | [GoAgent-0.4.21-win-x64.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64.exe) |
| Windows x64 NVIDIA (CUDA/CUDNN) portable 7z | [GoAgent-0.4.21-win-x64-nvidia-portable.7z](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia-portable.7z) |
| Windows x64 NVIDIA (CUDA/CUDNN) installer | [GoAgent-0.4.21-win-x64-nvidia.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia.exe) |

### จุดสำคัญ

- เพิ่มการเข้าสู่ระบบ ChatGPT แบบเลือกใช้ โดยยังคง runtime ครูสอนโกะเฉพาะของ GoAgent
- ตรวจสอบข้อความ ภาพกระดานแบบสุ่ม และการเรียกใช้เครื่องมือโกะแบบไดนามิกจริงก่อนแสดงว่าพร้อมใช้งาน
- พื้นที่เข้าสู่ระบบของ GoAgent แยกจากบัญชี Codex CLI และ Codex Desktop
- รวมและตรวจสอบ Codex 0.149.0 App Server สำหรับแต่ละแพลตฟอร์ม และไม่สลับผู้ให้บริการอัตโนมัติ
- KataGo ในเครื่องยังเป็นค่าเริ่มต้น ส่วน Zhizi Cloud ใช้เมื่อผู้ใช้เปิดเองเท่านั้น

## Tiếng Việt

### Tải xuống

| Nền tảng | Tải xuống |
| --- | --- |
| macOS Apple Silicon | [GoAgent-0.4.21-mac-arm64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-arm64.dmg) |
| macOS Intel | [GoAgent-0.4.21-mac-x64.dmg](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-mac-x64.dmg) |
| Windows x64 Standard (OpenCL) portable ZIP | [GoAgent-0.4.21-win-x64-portable.zip](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-portable.zip) |
| Windows x64 Standard (OpenCL) installer | [GoAgent-0.4.21-win-x64.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64.exe) |
| Windows x64 NVIDIA (CUDA/CUDNN) portable 7z | [GoAgent-0.4.21-win-x64-nvidia-portable.7z](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia-portable.7z) |
| Windows x64 NVIDIA (CUDA/CUDNN) installer | [GoAgent-0.4.21-win-x64-nvidia.exe](https://github.com/wimi321/GoAgent/releases/download/v0.4.21/GoAgent-0.4.21-win-x64-nvidia.exe) |

### Điểm mới

- Thêm đăng nhập ChatGPT tùy chọn nhưng vẫn giữ runtime giáo viên cờ vây chuyên biệt của GoAgent.
- Chỉ báo sẵn sàng sau khi kiểm tra thật văn bản, ảnh bàn cờ ngẫu nhiên và một lượt gọi công cụ cờ vây động.
- Vùng đăng nhập GoAgent tách biệt với tài khoản Codex CLI và Codex Desktop.
- Đóng gói và xác minh Codex 0.149.0 App Server cho từng nền tảng; không tự động đổi nhà cung cấp.
- KataGo cục bộ vẫn là mặc định; Zhizi Cloud chỉ hoạt động khi người dùng chủ động bật.
