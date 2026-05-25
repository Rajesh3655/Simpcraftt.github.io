module.exports = {
  apps: [
    {
      name: "infibolt-api",
      cwd: "./infibolt-backend",
      script: "src/server.js",
      node_args: "--enable-source-maps",
      env: { NODE_ENV: "production", PORT: 4000 },
      max_memory_restart: "450M",
      time: true,
    },
    {
      name: "infibolt-web",
      cwd: "./infibolt-frontend",
      script: "server.js",
      env: { NODE_ENV: "production", PORT: 3000 },
      max_memory_restart: "350M",
      time: true,
    },
    {
      name: "infibolt-admin",
      cwd: "./infibolt-admin",
      script: "server.js",
      env: { NODE_ENV: "production", PORT: 3001 },
      max_memory_restart: "350M",
      time: true,
    },
  ],
};
