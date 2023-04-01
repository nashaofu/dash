# Dash

Dash is a fast and lightweight private web app navigation panel. It is inspired by [Heimdall](https://github.com/linuxserver/Heimdall) but with some improvements to make it faster and lighter.

English | [简体中文](README-zh_CN.md)

## Features

- Private deployment.
- Default data storage with SQLite but also supports MySQL and Postgres.
- Multiple user support: Each user has their own independent navigation page.
- Theme switching: supports light and dark themes.
- Low resource consumption and fast running speed.
- Cross-platform: can run on Linux, macOS, and Windows operating systems.

## Installation and Usage

### Docker (Recommended)

It is recommended to use Docker to install Dash, which is simple and convenient. Just run the following command:

```sh
docker pull ghcr.io/nashaofu/dash:latest
docker run -d \
  --name dash \
  -p 3000:3000 \
  -v /path/to/data:/opt/dash/data \
  ghcr.io/nashaofu/dash:latest
```

After that, you can use it by visiting `http://127.0.0.1:3000` in your browser. The default account and password are `admin/password`.

If you need to customize the configuration, you can copy the `settings.example.toml` file in the project root directory to the `/opt/dash/data` directory and rename it to `settings.toml`. For specific configurations, please refer to the Configuration section.

### System installation

Binary packages for corresponding platforms are not currently provided, and users can refer to the contribution guidelines to build them themselves.

## Configuration

The project configuration file is `settings.toml`, and the configuration is as follows:

```toml
# Server port number
port = 3000
# Database configuration
[database]
url = "postgres://postgres:password@db:5432/dash"
```

## Contribution Guidelines

If you want to contribute to Dash, you can follow these steps:

1. Clone the project to your local machine:

   ```sh
   git clone https://github.com/nashaofu/dash.git
   ```

2. Create a new branch:

   ```sh
   git checkout -b my-feature-branch
   ```

3. Start the project: You need to install Rust, Node.js, and Yarn. If you are compiling on Linux, you may need to install `libssl-dev`.

   ```sh
   # Start the server project
   cargo run
   # Start the front-end project
   cd client && yarn && yarn dev
   ```

4. Modify and submit the code:

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

Dash is released under the MIT license. See [LICENSE](LICENSE) for details.
