# Dash

Dash is a fast and lightweight private web application navigation panel. It is inspired by [Heimdall](https://github.com/linuxserver/Heimdall), but with some improvements to make it faster and more lightweight.

English | [简体中文](README-zh_CN.md)

![logo](./logo.png)

## Features

- Private deployment.
- Default storage using sqlite, also supports mysql and postgres.
- Multi-user support: each user has their own independent navigation page.
- Theme switching: supports light and dark themes.
- Low resource usage and fast running speed.
- Cross-platform: can run on Linux, macOS, and Windows operating systems.
- Supports PWA for a native app-like experience.

## Installation and Usage

### Using Docker (recommended)

We recommend using Docker for installation. Just run the following command:

```sh
docker pull ghcr.io/nashaofu/dash:latest
docker run -d \
  --name dash \
  -p 3000:3000 \
  -v /path/to/data:/opt/dash/data \
  ghcr.io/nashaofu/dash:latest
```

Then, you can use it by accessing `http://127.0.0.1:3000` in your browser. The default username and password are `username/password`.

If you need to customize the configuration, you can copy the `settings.example.yaml` file from the project root directory to the `/opt/dash/data` directory and rename it to `settings.yaml`. For specific configurations, refer to the Configuration section.

### Using in System

1. Go to the [release](https://github.com/nashaofu/dash/releases) page and download `dash-xxxx.zip`, where `xxxx` represents the system architecture. Please choose according to your situation.
2. Unzip the executable file from `dash-xxxx.zip`, then run it in the terminal to start the service.

## Configuration

The project configuration file is `settings.yaml`, with the following content:

```yaml
# Server port number
port: 3000
# Database configuration
database:
  url: postgres://postgres:password@db:5432/dash
```

## Contribution Guide

If you want to contribute to Dash, you can follow these steps:

1. Clone the project to your local machine:

   ```sh
   git clone https://github.com/nashaofu/dash.git
   ```

2. Create a new branch:

   ```sh
   git checkout -b my-feature-branch
   ```

3. Start the project: you need to install rust, nodejs, and yarn.

   ```sh
   # Start the server-side project
   cargo run
   # Start the front-end project
   cd web && yarn && yarn dev
   ```

4. Modify and submit code:

   ```sh
   git add .
   git commit -m "Add new feature"
   ```

5. Push code to remote repository:

   ```sh
   git push origin my-feature-branch
   ```

6. Create a Pull Request: Create a new Pull Request on GitHub and wait for review.

## License

Dash uses the MIT license. For details, please see the [LICENSE](LICENSE) file.
