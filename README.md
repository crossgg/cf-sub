# 🚀 Cloudflare Worker Preferred-IP 智能调度与边缘网络中枢

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/crossgg/cf-sub)
[![Deploy Status](https://github.com/crossgg/cf-sub/actions/workflows/deploy.yml/badge.svg)](https://github.com/crossgg/cf-sub/actions/workflows/deploy.yml)
[![Cloudflare Workers](https://img.shields.io/badge/Platform-Cloudflare%20Workers-F38020?style=flat&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)

基于 Cloudflare Workers 打造的轻量级、高可用智能网络调度系统与 Web 管理平台。原生支持 **WebSocket 边缘高速中继**、**电信/联通/移动三网实测优选**、**OpenAI 纯美专线分流**与多协议客户端配置分发。

无需自备云服务器，完全依托 Cloudflare 免费层（Workers + KV）运行！

---

## 🎯 一键部署到 Cloudflare（三种方式任选其一）

| 部署方式 | 特点 | 推荐指数 | 适用场景 |
| :--- | :--- | :---: | :--- |
| **[方式一：Cloudflare 官方一键部署按钮](#-方式一cloudflare-官方一键部署按钮)** | 点击按钮直达 CF 控制台，自动授权导入 | ⭐⭐⭐⭐ | 想通过官方网页流程部署 |
| **[方式二：GitHub Actions 一键自动部署](#-方式二github-actions-一键自动部署全自动创建-kv-与-secrets推荐)** | **全自动创建 KV、自动生成 UUID/密钥**，最少仅需 1 个 Token | ⭐⭐⭐⭐⭐ | **强烈推荐**，最省心且永久自动维护 |
| **[方式三：CF 控制台直接粘贴代码](#-方式三cf-控制台直接复制代码部署小白速通)** | 复制 `dist/_worker.js` 混淆代码直接粘贴发布 | ⭐⭐⭐ | 仅测试体验，不想配置 Git |

---

### 🌐 方式一：Cloudflare 官方一键部署按钮

点击下方按钮直接在 Cloudflare 中创建并部署本 Worker：

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/crossgg/cf-sub)

> 💡 **使用提示**：
> 1. 点击上方按钮后，Cloudflare 会引导你授权 GitHub 并自动将本仓库连接到你的 Cloudflare Workers；
> 2. 部署完成后，在 Cloudflare 控制台 Worker 设置中绑定一个名为 `XS_SUB_KV` 的 KV 命名空间，并添加环境变量即可。
> 3. *（已绑定仓库 `crossgg/cf-sub`，点击即可一键直达部署）*

---

### 🤖 方式二：GitHub Actions 一键自动部署（全自动创建 KV 与 Secrets · 推荐）

如果你希望**完全不用手动去 Cloudflare 创建 KV 数据库、不用手动生成 UUID 和密码**，推荐使用内置的 GitHub Actions 自动化工作流。

#### 第一步：添加 1 个必填的 GitHub Secret
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，右上角点击 **头像** -> **My Profile** -> **API Tokens** -> **Create Token**；
2. 选择 **Edit Cloudflare Workers** 模板创建一个 Token（包含 Workers、KV 与路由权限）；
3. 打开仓库密钥设置页：[👉 点击前往 Secrets 设置页面](https://github.com/crossgg/cf-sub/settings/secrets/actions)，点击 **New repository secret**：

| Secret 变量名 | 是否必填 | 作用与说明 |
| :--- | :---: | :--- |
| `CF_API_TOKEN` | **必填** | 上一步生成的 Cloudflare API Token |
| `DOMAIN` | 选填 | 你的自定义子域名（如 `sub.yourdomain.com`，主域名需在同账号托管；不填则使用免费 workers.dev 域名） |
| `ADMIN_PASSWORD` | 选填 | 管理员后台密码（若不填，系统将**自动生成 16 位强密码**并在摘要中展示） |

#### 第二步：一键运行部署
1. 推送代码到 `main` 分支，或直接打开：[👉 点击前往 Actions 运行页面](https://github.com/crossgg/cf-sub/actions/workflows/deploy.yml)；
2. 点击右侧 **Run workflow** 按钮；
3. 工作流将**全自动执行**：
   - 自动检测并创建绑定的 KV 数据库（`XS_SUB_KV`）；
   - 自动生成 `NODE_UUID` 与安全密钥；
   - 自动发布并生成登录初始密码！
4. 执行完成后，点击进入该次运行的 **Summary（摘要）** 卡片，即可查看到管理员邮箱与初始登录密码。

---

### 📋 方式三：CF 控制台直接复制代码部署（小白速通）

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)，点击 **Workers & Pages** -> **Create** -> **Create Worker**；
2. 输入任意名称（如 `cf-sub`），点击 **Deploy**；
3. 点击 **Edit code**，清空默认代码，将本项目混淆构建好的 [`dist/_worker.js`](dist/_worker.js) 全部内容复制并粘贴进去，点击 **Deploy** 保存；
4. 按照下方 **[正常运行必需配置清单](#-正常运行必需配置清单部署后必看)** 补齐机密、自定义域名与 `XS_SUB_KV` 绑定。

---

## ⚙️ 正常运行必需配置清单（部署后必看）

> 若通过 **GitHub Actions（方式二）** 部署，工作流会自动创建 KV 并注入全部机密；若使用 **官方一键部署（方式一）** 或 **手动部署（方式三）**，请按以下 4 步配齐，缺一不可：

### 1. 三个核心机密（Secrets · 必填）
路径：Cloudflare 控制台 -> 进入该 Worker -> **Settings -> Variables and Secrets -> Add（勾选 Encrypt）**

| 变量名 | 严格要求 | 缺失 / 填错后果 |
| :--- | :--- | :--- |
| **`NODE_UUID`**<br>*(自动兼容历史 UUID 变量名)* | **必须为标准 RFC4122 v1~v5 UUID**<br>第 3 段首位须为 `1~5`，第 4 段首位须为 `8/9/a/b`<br>✅ 正确示例：`c83a71b2-5f6e-4b9a-8c1d-9e2f3a4b5c6d` | ⚠️ **切勿手编** `12345678-1234-1234-1234-123456789abc`（第 4 段不符合规范会被拒收），否则配置接口报 **`503`**、客户端握手全部失败。<br>生成方式：PowerShell 执行 `[guid]::NewGuid()` 或 Node 执行 `node -e "console.log(crypto.randomUUID())"`。 |
| **`TOKEN_SECRET_V9`** | **长度必须 $\ge 24$ 位**的随机字符串 | 缺失或不足 24 位时，注册、管理员首次登录、签发客户端 Token 全部报 **`500`**。 |
| **`ADMIN_PASSWORD_V9`** | 建议 $\ge 12$ 位强密码 | 缺失时无法解锁「管理端后台」，也无法初始化管理员账号。 |

### 2. 自定义域名（两处必须同时配置）

| 配置位置 | 填写内容 | 说明 |
| :--- | :--- | :--- |
| **① 环境变量 `DOMAIN`**<br>*(Settings -> Variables and Secrets)* | 你的子域名（如 `sub.example.com`） | 若 `DOMAIN` 留空，下发节点的 `Host` / `SNI` 会回退为占位符 `sub.example.com` 导致无法连通，**务必填写真实域名**。 |
| **② 绑定自定义域路由**<br>*(Settings -> Domains & Routes -> Add Custom Domain)* | 同上（如 `sub.example.com`） | 主域名须托管在同一 Cloudflare 账号下，且 DNS 列表不能存在同名 A/CNAME 冲突记录。保存后等待 1~2 分钟自动签发 SSL 证书即可。*(仅用 `*.workers.dev` 在国内大多被阻断且不支持优选 IP 路由)* |

### 3. KV 持久化存储绑定（强烈建议必填）
1. 在 Cloudflare 控制台左侧 **Storage & Databases -> KV** 中创建一个命名空间（名称任意，如 `XS_SUB_KV`）；
2. 进入该 Worker -> **Settings -> Bindings -> Add Binding -> KV Namespace**：
   - **Variable name（变量名）**：必须严格填写 **`XS_SUB_KV`**
   - **KV namespace**：选择刚创建的空间并保存。
3. **说明**：为避免一键部署触发 `code: 10042` 构建报错，`wrangler.toml` 默认跳过 KV 绑定。不绑定虽可打开页面，但 Worker 休眠重启后**所有注册用户、客户端管理列表、CDK、优选测速缓存和配额统计都会清空**，且客户端探针上报会报错。

### 4. 可选环境变量（均已有内置默认值）

| 变量名 | 默认值 | 说明 |
| :--- | :--- | :--- |
| **`ADMIN_EMAIL`** | `admin@example.com` | 管理员登录邮箱（配合 `ADMIN_PASSWORD_V9` 首次登录用户中心完成初始化）。 |
| **`SUB_TITLE`** | `Preferred-IP 三网实测节点` | 客户端导入时展示的节点名称前缀。 |
| **`RELAY_IP`** *(兼容 `PROXYIP`)* | 留空 | 备用中继出口 IP。日常绝大部分网站走原生直连，**默认留空即可**；仅访问同样托管在 Cloudflare 的站点报 Error 1000 时按需填写。 |
| **`GLOBALPING_TOKEN`** | 留空 | 可选，用于提高每 30 分钟定时优选探针的免费额度上限。 |

*(注：构建依赖 `terser`/`acorn`/`wrangler`、`compatibility_flags = ["nodejs_compat"]` 以及每 30 分钟一次的 Cron 定时任务均已在仓库内置，无需额外修改。)*

### ✅ 部署完成后的 4 步上线验收清单
1. 浏览器访问 `https://<你的域名>/` → 正常加载仪表盘且无 1101 / 500 报错；
2. 切换到 **「管理端后台」** Tab，输入 `ADMIN_PASSWORD_V9` → 成功解锁后台；
3. 在 **「客户端管理」** 签发一个测试客户端，点击右侧 **「测试」** → 浏览器返回 YAML 节点列表，核对其中 `uuid` 为你设置的 `NODE_UUID`、`servername` 为你设置的 `DOMAIN`（而非 `sub.example.com`）；
4. 在 **「实时监控大屏」** 点击一次 **「立即执行全网 Preferred-IP 优选」**，确认测速日志与 KV 写入正常。

---

## ✨ 核心特性

- ⚡ **三网实测智能优选 (Preferred-IP)**
  - 自动轮转 Cloudflare 官方各网段优选候选 IP，结合外部分布式探针为**移动 (CM)、联通 (CU)、电信 (CT)** 定制最优低延迟节点拓扑。
  - 支持多网探测、TCP/TLS 握手校验与自动熔断降级。
- 🛡️ **严格精准分流策略**
  - **🤖 OpenAI / ChatGPT / Claude 纯美专线**：铁律隔离，绝不混入香港/日本/台湾出口，防止账号风控。
  - **🌐 Google 防跳转**：智能重定向 Google 服务，避免亚洲出口误判地区。
  - **🛑 内置广告拦截**：自动过滤主流广告追踪与恶意流量。
- 📱 **全平台客户端原生适配**
  - 自动渲染输出 **Clash / Mihomo (Clash Meta)** 完整规则组；
  - 自动输出 **Sing-box** 现代化 JSON 配置；
  - 支持通用 Base64 聚合节点订阅链接。
- 🖥️ **现代化可视化管理大屏**
  - 内置 Web 管理仪表盘，实时查看优选节点状态、出口 IP 拓扑与每日 100,000 次免费配额消耗；
  - 支持客户端隔离：为不同设备或用户独立签发专属 HMAC 访问 Token。

---

## 🖥️ 管理后台与订阅使用

1. 打开部署好的 Worker 域名：`https://<你的域名>/`；
2. 输入 **管理员邮箱**（默认 `admin@<你的域名>` 或 `admin@example.com`）与 **管理员密码** 登录后台；
3. **签发专属客户端订阅**：
   - 在后台控制面板中点击“添加客户端”，为你的手机、电脑签发专属 Token；
   - 复制生成的 Clash / Mihomo / Sing-box 订阅链接并导入客户端即可使用！

---

## ❓ 常见问题 (FAQ)

### Q1: `RELAY_IP` 是做什么用的？必须填吗？
* **回答：默认留空即可，不需要填。**
* **原理**：Cloudflare 禁止 Worker 直接回环连接到 Cloudflare 自己的 CDN 节点（会报 `Error 1000`）。当 Worker 访问的目标也是托管在 Cloudflare 上的站点时，`RELAY_IP`（兼容旧名 `PROXYIP`）作为外部中转跳板代为转发。
* **实际影响**：日常访问 Google, YouTube, GitHub, Twitter 等绝大部分主流网站走的是 Worker 原生直连（速度最快、延迟最低）。只有在遇到极少数套了 Cloudflare CDN 且打不开的站点时，才需要在后台添加 `RELAY_IP`。

### Q2: 每天 100,000 次免费额度够用吗？
* **回答：个人或小团体完全绰绰有余。**
* 节点订阅接口默认启用了 300 秒边缘缓存，并且客户端通常设置数小时更新一次。正常使用下，单人每天消耗的请求数仅几十到上百次。

### Q3: 为什么绑定自定义域名提示冲突？
* 若在 Cloudflare 添加了自定义域名报错，请检查该子域名在 Cloudflare DNS 列表中是否已有 A 或 CNAME 记录。如果有，请先在 DNS 页面删除同名记录，Wrangler 部署时会自动生成路由记录并签发 SSL 证书。

---

## 📄 开源许可与免责声明

- 本项目仅供网络技术研究、学习与分布式网络性能测试使用。
- 请遵守 Cloudflare 服务条款（ToS）及当地法律法规。
