module.exports = {
  apps: [
    {
      name: "ewvlm-gateway",
      script: "python",
      args: "ewvlm_fastapi_gateway.py",
      cwd: "e:/projects/ewVLM/backend",
      watch: false
    },
    {
      name: "ewvlm-frontend",
      script: "node_modules/vite/bin/vite.js",
      args: "",
      cwd: "e:/projects/ewVLM/frontend",
      watch: false
    },
    {
      name: "ewvlm-fast-loop",
      script: "python",
      args: "fast_loop.py",
      cwd: "e:/projects/ewVLM/backend",
      watch: false
    },
    {
      name: "ewvlm-vlm-bridge",
      script: "python",
      args: "ewvlm_lmstudio_bridge.py",
      cwd: "e:/projects/ewVLM/backend",
      watch: false
    }
  ]
};
