# dsh-workspace-tags

> 给 **DeepSeek Harness** 桌面版侧栏的「工作区（文件夹）」打上彩色标签，参考 macOS 文件夹标签，让你一眼分辨重要项目。

纯前端 DOM 注入实现，**不修改 DSH 程序源码**；所有样式使用 DSH 主题令牌，浅色 / 深色主题均适配。

---

## ✨ 功能特性

| 功能 | 说明 |
| --- | --- |
| 🏷️ 打标签菜单 | 在工作区行「⋯」菜单中新增「打标签」项（带标签图标），点击弹出标签选择器。 |
| 🖼️ 对话插入图标 | 每条对话（会话）的「⋯」菜单里、 「重命名」上方新增「插入图标」：从 Emoji 中选择，可替换 / 移除；图标纯 DOM 注入在对话标题前，不影响重命名。 |
| 🎨 多选 + 新建 | 支持多选已有标签；7 种内置彩色标签开箱即用，也可自定义取色盘与名称。一个文件夹可挂多个标签。 |
| ⚡ 即时生效 | 勾选 / 取消即时保存，无需点击「保存」。 |
| 🔤 首 / 全 显示 | 工作区行标题前显示标签圆牌，可切换「首」（只显示首字，省空间）/「全」（显示全称）。 |
| 📚 平铺 / 堆叠 | 标签可平铺排列，也可堆叠收起，鼠标悬浮自动展开；切换与悬浮使用同一套过渡动画。 |
| ↔️ 拖拽排序 | 已选标签在弹窗内可拖拽调整顺序（内联 SortableJS）。 |
| 🗑️ 一键清空 | 标题栏垃圾桶按钮，二次确认后清空当前文件夹的全部标签，附盖子开合动画。 |
| 💾 集中记录 | 所有「路径 → 标签 / 展示方式」记录在浏览器本地一个 JSON 中，下次打开直接复用。 |
| 🧹 自动清理 | 标签仍有文件夹引用则保留，全部解除绑定后自动消失；在 DSH 删除工作区后自动清除对应路径记录。 |
| 🪟 跨平台 | macOS / Windows 均可使用：路径自动兼容 `\` 与大小写差异，Emoji 只保留各平台都能正常显示的字符。 |

---

## 📦 安装

### 从 GitHub 安装（推荐）

在 DSH 的插件管理中使用以下安装项：

```text
github:lwfjyjy/dsh-workspace-tags
```

### 本地开发安装

```bash
dsh plugin --profile <你的 profile> add link:/绝对路径/dsh-workspace-tags
```

> ⚠️ 安装或升级后请**完全退出 DSH 再重新打开**，确保客户端 bundle 加载新代码。

**环境要求**

- DeepSeek Harness 桌面版（Web UI）
- DSH `>= 0.2.1-rc.5`
- Node.js `>= 24`
- 支持 macOS 与 Windows（Linux 未单独验证）

---

## 🖱️ 使用

1. 鼠标移到工作区行，点右侧「⋯」菜单 → 选「打标签」。
2. 在搜索框输入可筛选标签；点下方「可选标签」即选中，再点一次或点胶囊上的 `×` 取消。已选标签显示在搜索框上方的胶囊区，可拖拽排序。
3. 输入新名称并选好颜色后，按回车或点「创建新标签」，即可新建并挂到当前文件夹。
4. 对话「⋯」菜单 → 「插入图标」：从系统 Emoji 里挑一个加到对话标题前，可随时替换或移除。
5. 标题栏按钮：
   - 「首」：切换标签显示「首字 / 全称」；
   - 「堆」：切换标签「平铺 / 堆叠」；
   - 🗑️：清空当前文件夹全部标签（二次确认）。
6. 所有改动即时生效，工作区行标题前实时显示标签圆牌。

---

## 🗃️ 数据存储

数据以单个 JSON 保存在浏览器 `localStorage`（键名见 `client.js` 的 `STORAGE_KEY`），结构大致如下：

```json
{
  "version": 1,
  "tags":   { "t1": { "name": "重要", "color": "#FF3B30" } },
  "paths":  { "/Users/you/project": ["t1"] },
  "modes":  { "/Users/you/project": "first" },
  "stacks": { "/Users/you/project": true },
  "sessionIcons": { "session-id": { "type": "emoji", "value": "🚀" } },
  "recentEmojis": ["🚀", "✅"]
}
```

- `tags`：标签库（名称 + 颜色），含 7 个内置彩色标签。
- `paths`：每个文件夹路径挂了哪些标签，数组顺序即工作区圆牌顺序。
- `modes`：该文件夹标签展示方式，`"first"` 显示首字；缺省 / `"full"` 显示全称。
- `stacks`：是否堆叠，`true` 为堆叠，缺省为平铺。
- `sessionIcons`：每条对话的自定义图标，键为对话 id，值为 `{ type:"emoji", value }`。
- `recentEmojis`：最近使用的 Emoji（最多 30 个），显示在图标选择器顶部。
- 标签无人引用时会被自动清理，保证标签库只保留仍在使用的标签。

---

## 🧱 实现说明

- 菜单项通过官方 `contextMenus` 服务注册（`target: 'workspace'`, `order: 150`，夹在「重命名」与「删除」之间），不劫持 DOM 点击；图标通过官方 `contextMenu.icon` 槽（keyed）注册。
- 工作区行与标题容器用 `[data-row-key^="workspace:"]`、`[class*="projectText"]` 定位，选择器集中在 `client.js` 的 `SEL` 常量，DSH 升级只需改一处。
- 圆牌用 `dataset.ids` / `dataset.mode` 判断：只有标签集合变化才重建节点，切换「首/全」「平铺/堆叠」仅改类名，既避免与 `MutationObserver` 互相触发，又保证过渡动画连贯。
- 删除工作区后的清理做了「列表就绪」保护：只有 `workspaces` 列表确实加载出数据后才清理失效路径，避免启动瞬间误删全部记录。
- 弹窗为自绘 overlay，样式全部使用 DSH 主题令牌（`--dsw-*`）；悬浮提示对齐 DSH 官方 Tooltip 气泡样式。
- 拖拽排序内联 SortableJS 1.15.6、垃圾桶开合动画内联 morphicons 2.0.2（均为 MIT），无额外运行时依赖。
- 插件卸载时通过 `ctx.effect` 的 cleanup 回收 `MutationObserver`、事件监听与注入的样式 / 圆点 / 弹窗。

---

## 📁 项目结构

```text
dsh-workspace-tags/
├── package.json      # 包清单 + dsh.bundle / dsh.client
├── cordis.patch.yml  # 插入 workspace-tags 插件行
├── index.js          # Host 半（空 apply，渲染在 Client）
├── client.js         # Client 半：菜单项 + 打标签弹窗 + 彩色圆牌 + 数据清理
├── locale/zh.json    # 插件列表显示名 / 描述（中文）
├── locale/en.json    # 插件列表显示名 / 描述（英文）
└── icon.svg          # 插件图标
```

---

## 🛠️ 开发

```bash
node --check client.js
node --check index.js
```

插件为纯 JavaScript，无构建步骤；修改后重新加载插件并完全重启 DSH 即可验证。

---

## 📄 License

[MIT](./LICENSE)
