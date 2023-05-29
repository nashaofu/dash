# Dash

Dash is a fast and lightweight private web application navigation panel. It was inspired by [Heimdall](https://github.com/linuxserver/Heimdall), but with some improvements to make it faster and lighter.

English | [简体中文](README-zh_CN.md)

![logo](./logo.png)

## Features

- Private deployment.
- Default storage using sqlite, also supports mysql and postgres.
- Multi-user support: each user has their own independent navigation page.
- Theme switching: supports light and dark themes.
- Low resource consumption and fast running speed.
- Cross-platform: can run on Linux, macOS, and Windows operating systems.

## Installation and Usage

### Using Docker (recommended)

We recommend using Docker for installation as it is simple and convenient. Just run the following command:

```sh
docker pull ghcr.io/nashaofu/dash:latest
docker run -d \
  --name dash \
  -p 3000:3000 \
  -v /path/to/data:/opt/dash/data \
  ghcr.io/nashaofu/dash:latest
```

Then, you can use it by accessing `http://127.0.0.1:3000` in your browser. The default username and password are `username/password`.

If you need to customize the configuration, you can copy the `settings.example.yaml` file in the project root directory to the `/opt/dash/data` directory and rename it to `settings.yaml`. For specific configurations, refer to the Configuration section.

### Using system

1. Go to the [release](https://github.com/nashaofu/dash/releases) page to download `dash-web.zip` and `dash-xxxx.zip`, where `xxxx` represents the system architecture. Choose according to your own situation.
2. Create a new directory `dash`, unzip `dash-web.zip` to `dash/www`, unzip `dash-xxxx.zip` to `dash` directory. Finally, the directory structure is as follows:

   ```bash
   .
   ├── dash # dash-xxxx.zip
   └── www # dash-web.zip
       ├── ... # other files
       └── index.html
   ```

3. Run `./dash` in the terminal to start the service.

## Configuration

The project configuration file is `settings.yaml`, which contains the following configurations:

```yaml
# 服务端口号
port: 3000
# 数据库配置
database:
  url: postgres://postgres:password@db:5432/dash
```

## Contribution Guidelines

If you would like to contribute to Dash, please follow these steps:

1. Clone the project to your local machine:

   ```sh
   git clone https://github.com/nashaofu/dash.git
   ```

2. Create a new branch:

   ```sh
   git checkout -b my-feature-branch
   ```

3. Start the project: You need to install rust, nodejs, and yarn.

   ```sh
   # Start the server project
   cargo run
   # Start the front-end project
   cd web && yarn && yarn dev
   ```

4. Modify and commit the code:

   ```sh
   git add .
   git commit -m "Add new feature"
   ```

5. Push the code to the remote repository:

   ```sh
   git push origin my-feature-branch
   ```

6. Create a Pull Request: Create a new Pull Request on GitHub and wait for review.

## License

Dash is licensed under the MIT license. For more information, please refer to the [LICENSE](LICENSE) file.
