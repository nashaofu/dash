# Dash

Dash 是一个快速、轻量的私有网页应用导航面板。它的灵感来源于 [Heimdall](https://github.com/linuxserver/Heimdall)，但是进行了一些改进，使得它更快、更轻量级。

[English](README.md) | 简体中文

![logo](./logo.png)

## 功能特性

- 私有部署。
- 默认使用 sqlite 存储数据，同时也支持 mysql、postgres。
- 多用户支持：每个用户都有自己独立的导航页面。
- 主题切换：支持浅色主题与暗黑主题。
- 占用资源少，运行速度快。
- 跨平台：可以在 Linux、macOS 和 Windows 操作系统上运行。

## 安装和使用

### Docker 中使用（推荐）

推荐使用 Docker 安装方式，使用简单方便，只需运行如下命令：

```sh
docker pull ghcr.io/nashaofu/dash:latest
docker run -d \
  --name dash \
  -p 3000:3000 \
  -v /path/to/data:/opt/dash/data \
  ghcr.io/nashaofu/dash:latest
```

然后在浏览器中访问 `http://127.0.0.1:3000` 即可使用。默认账号密码为 `username/password`。

如果需要自定义配置，可将项目根目录下的 `settings.example.toml` 文件拷贝到 `/opt/dash/data` 目录下并重命名为 `settings.toml`，具体配置参考配置章节。

### 系统中使用

1. 前往[release](https://github.com/nashaofu/dash/releases)页面下载`dash-client.zip`与`dash-xxxx.zip`，`xxxx`表示系统架构，请根据自己的情况选择
2. 新建一个目录`dash`,解压`dash-client.zip`到`dash/www`,解压`dash-xxxx.zip`到`dash`目录下，最终目录结构如下

   ```bash
   .
   ├── dash # dash-xxxx.zip
   └── www # dash-client.zip
       ├── ... # other files
       └── index.html
   ```

3. 在终端中运行`./dash`即可启动服务

## 配置

项目配置文件为`settings.toml`，配置内容如下：

```toml
# 服务端口号
port = 3000
# 数据库配置
[database]
url = "postgres://postgres:password@db:5432/dash"
```

## 贡献指南

如果您想为 Dash 做出贡献，可以按照以下步骤进行：

1. 克隆项目到本地：

   ```sh
   git clone https://github.com/nashaofu/dash.git
   ```

2. 创建新分支：

   ```sh
   git checkout -b my-feature-branch
   ```

3. 启动项目：你需要安装 rust、nodejs 与 yarn

   ```sh
   # 启动服务端项目
   cargo run
   # 启动前端项目
   cd client && yarn && yarn dev
   ```

4. 修改并提交代码：

   ```sh
   git add .
   git commit -m "Add new feature"
   ```

5. 推送代码到远程仓库：

   ```sh
   git push origin my-feature-branch
   ```

6. 创建 Pull Request：在 GitHub 上创建一个新的 Pull Request 并等待审核。

## 许可证

Dash 使用 MIT 许可证，详情请参阅 [LICENSE](LICENSE) 文件。
