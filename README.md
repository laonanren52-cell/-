# 人生支线 LifeQuest

LifeQuest 是一个人生任务打卡小软件 MVP。它把生活里的第一次、日常待办、成长目标、纪念节点和阶段复盘，沉淀成可回看的人生卡。

当前版本是纯前端 Demo，使用 `localStorage` 保存数据；AI 能力支持 Mock 模式和 OpenAI 兼容 API 模式。未配置 API Key 时会自动 fallback 到 Mock。

## 功能特性

- 首页进度盘：收敛为欢迎区、今日概览、今日重点、最近完成和复盘入口。
- 任务库：内置 30 条预设人生任务，改为左图右文的轻量列表卡片。
- 待办事项：替代原 Wishlist，定位为每日待办，支持新增、编辑、删除、置顶、完成和转打卡。
- 打卡页：支持完成时间、设备定位、自由填写今日情绪、文字感受、图片上传、纪念日标记、AI 生图。
- 图片逻辑：用户上传图优先并压缩保存；未上传且勾选 AI 生图时调用图片 API；都没有或接口失败时使用默认视觉卡。
- 地点逻辑：浏览器定位保存经纬度，配置高德地图 Web 服务 Key 后会反查地点名称和详细地址，界面默认不展示经纬度。
- 人生卡详情：展示用户上传图或 AI 生成图、AI 纪念文案、自由情绪、小日记和地点信息。
- 纪念日：支持手动添加，也支持重要打卡自动转化为纪念日。
- 复盘回溯：支持日/周/月/季/年复盘，AI 总结和下一步建议基于真实完成的人生卡生成。
- 设置页：支持昵称、AI 模式、AI 共情/幽默/客观偏好、复盘偏好、导出 JSON、恢复演示数据。

## 技术栈

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- lucide-react
- localStorage

## 目录结构

```text
src/
  components/
    Layout/
    LifeCard/
    MoodTag/
    ReviewPanel/
    TaskCard/
    Timeline/
  data/
    mockData.ts
    presetTasks.ts
  pages/
    Dashboard.tsx
    TaskLibrary.tsx
    Todos.tsx
    CheckIn.tsx
    LifeCardDetail.tsx
    Anniversaries.tsx
    Reviews.tsx
    TimelinePage.tsx
    Settings.tsx
  services/
    AppDataContext.tsx
    aiService.ts
    reverseGeocodeService.ts
    reviewService.ts
    storageService.ts
  types/
    index.ts
  utils/
    date.ts
    id.ts
```

## 本地安装

建议使用 Node.js 20 或更高版本。

```bash
npm install
```

如果当前环境对默认 npm 缓存目录没有写入权限，可以把缓存放在项目内：

```bash
npm install --cache ./.npm-cache
```

## 本地启动

```bash
npm run dev
```

启动后访问终端输出的本地地址，通常是：

```text
http://127.0.0.1:5173/
```

如果 5173 被占用，Vite 会自动切换到其他端口。

## 构建

```bash
npm run build
```

构建产物输出到：

```text
dist/
```

本地预览生产构建：

```bash
npm run preview
```

## AI API 配置

默认不需要环境变量。设置页选择 Mock 模式时，系统会使用本地 mock AI 逻辑。

现在支持两种真实 API 接入方式：

1. 在线填写：部署后直接进入「设置 → 在线 AI API 配置」，填写 Base、Key、Model，点击「保存 API 配置」，再测试文本 API / 生图 API。
2. 构建时注入：在项目根目录创建 `.env`，或在 Vercel / Netlify 配置环境变量。

在线填写会保存在当前浏览器的 localStorage 中，并优先于 `.env` 生效，适合演示和个人使用。

如果要使用 `.env`，可以参考 `.env.example`：

```text
VITE_AI_TEXT_API_BASE=
VITE_AI_TEXT_API_KEY=
VITE_AI_TEXT_MODEL=
VITE_AI_IMAGE_API_BASE=
VITE_AI_IMAGE_API_KEY=
VITE_AI_IMAGE_MODEL=
VITE_AMAP_API_KEY=
```

接口按 OpenAI 兼容风格封装：

- 文本生成：`{VITE_AI_TEXT_API_BASE}/chat/completions`
- 图片生成：`{VITE_AI_IMAGE_API_BASE}/images/generations`
- 地点反查：高德地图 Web 服务 `https://restapi.amap.com/v3/geocode/regeo`

然后在设置页把 AI 模式切换为 `API 模式`。如果接口失败，系统会自动 fallback 到 Mock，不会中断打卡流程。

注意：

- 前端直连第三方 AI API 会暴露 Key，正式上线建议改为自建后端转发。
- 有些 API 服务不允许浏览器跨域请求。如果测试时出现 CORS 错误，需要通过后端代理转发。
- Base URL 建议填写到版本路径，例如 `https://api.openai.com/v1` 或 `https://api.siliconflow.cn/v1`。如果误填成完整接口路径，例如 `/images/generations` 或 `/chat/completions`，代码会自动规整为最终请求地址。
- SiliconFlow 生图接口会使用 `image_size: "1024x1024"`、`batch_size: 1`、`num_inference_steps: 20`、`guidance_scale: 7.5`，同时保留 OpenAI 兼容的 `size` 和 `n` 字段。
- 图片返回会按 `data[0].url`、`data[0].b64_json`、`images[0].url`、`url` 的优先级解析；base64 会自动转成 `data:image/png;base64,...`。
- 若未配置 `VITE_AMAP_API_KEY` 或设置页未填写高德 Key，系统仍会保存定位坐标，但不会把经纬度填到地点输入框，会提示用户手动填写地点。

## 部署

这是一个纯前端 Vite 项目，部署时只需要安装依赖并执行构建命令。

### 部署到 Vercel

1. 在 Vercel 导入 GitHub 仓库。
2. Framework Preset 选择 `Vite`。
3. Build Command 填写：

```bash
npm run build
```

4. Output Directory 填写：

```text
dist
```

5. 如果需要真实 AI API 和地图地点反查，在 Vercel 的 Environment Variables 中配置 `VITE_AI_TEXT_*`、`VITE_AI_IMAGE_*`、`VITE_AMAP_API_KEY`，也可以部署后在设置页在线填写。
6. 点击 Deploy。

### 部署到 Netlify

1. 在 Netlify 导入 GitHub 仓库。
2. Build command 填写：

```bash
npm run build
```

3. Publish directory 填写：

```text
dist
```

4. 如果需要真实 AI API 和地图地点反查，在 Netlify 的 Environment variables 中配置 `VITE_AI_TEXT_*`、`VITE_AI_IMAGE_*`、`VITE_AMAP_API_KEY`，也可以部署后在设置页在线填写。
5. 点击 Deploy site。

### 部署到 GitHub Pages

如果仓库使用 GitHub Pages，需要注意 Vite 的 `base` 路径。

当前仓库名是 `-`，GitHub Pages 地址通常类似：

```text
https://laonanren52-cell.github.io/-/
```

这种情况下建议在 `vite.config.ts` 中设置：

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/-/",
  plugins: [react()],
});
```

然后构建：

```bash
npm run build
```

再把 `dist/` 发布到 GitHub Pages。可以使用 GitHub Actions，也可以使用 `gh-pages` 包。

如果部署到自定义域名、Vercel 或 Netlify，通常不需要设置 `base`。

## 数据说明

MVP 使用 `localStorage` 保存数据：

- 任务数据
- 待办事项
- 人生卡
- 小日记
- 纪念日
- 复盘设置
- 用户设置
- AI 偏好

首次进入系统时会自动初始化演示数据，包括 30 条预设任务、3 条待办事项、5 张人生卡和 2 个纪念日。

如需恢复演示数据，可以在设置页点击「清空并恢复演示数据」。

## AI 逻辑说明

AI service 位于：

```text
src/services/aiService.ts
```

包含：

- `generateLifeCardText`
- `generateCardImage`
- `generateReviewSummary`
- `generateNextTaskSuggestions`
- `buildLifeCardPrompt`
- `buildImagePrompt`

人生卡文案、复盘总结、下一步建议都会结合：

- 任务标题
- 任务分类
- 用户真实感受
- 用户自由填写的今日情绪
- AI 偏好：共情、幽默、客观

## 注意事项

- 当前版本是前端 MVP，没有后端账号系统。
- 数据只保存在当前浏览器的 localStorage 中，换浏览器或清缓存后数据会丢失。
- 图片上传目前以 base64 存在 localStorage 中，适合 MVP 演示；生产环境建议接对象存储。
- AI 生成图片如果返回临时 URL，后续可能过期；生产环境建议下载后转存对象存储。
- 前端直连第三方 AI API 会暴露 Key，正式上线建议改为自建后端转发。
- 高德地图 Key 当前从前端调用，生产环境建议限制调用来源或改成后端代理。
- 夜间主题是预留入口，尚未接入完整实现。

## License

仅作为学习、演示和 MVP 原型使用。
