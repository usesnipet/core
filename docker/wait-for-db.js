#!/usr/bin/env node
/**
 * Waits for PostgreSQL to be ready by parsing DATABASE_URL.
 * Uses Node built-in net module - no extra dependencies.
 */
const net = require("net");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

// Parse postgresql://user:pass@host:port/db
const match = url.match(/@([^/]+)\//);
if (!match) {
  console.error("Could not parse DATABASE_URL");
  process.exit(1);
}

const hostPort = match[1];
const [host, port = "5432"] = hostPort.split(":");

function checkConnection() {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("error", () => resolve(false));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(parseInt(port, 10), host);
  });
}

async function wait() {
  console.log(`Waiting for database at ${host}:${port}...`);
  for (let i = 0; i < 60; i++) {
    if (await checkConnection()) {
      console.log("Database is ready!");
      process.exit(0);
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.error("Timeout waiting for database");
  process.exit(1);
}

wait();
