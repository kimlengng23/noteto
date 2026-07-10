const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const configDirectory = path.join(__dirname, "runtime-config");
const configPath = path.join(configDirectory, "database.json");
const defaultConnOption = {
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS || 5000),
};
const defaultDatabaseName = trimWrappedValue(
  process.env.DEFAULT_DB_NAME || process.env.DB_NAME || "Noteto"
);

let activeClient = null;

function trimWrappedValue(value) {
  if (!value) return "";
  return String(value).trim().replace(/^['"]|['"]$/g, "");
}

function getEnvironmentConfig() {
  return {
    connectionString: trimWrappedValue(process.env.CONN_STR),
    databaseName: trimWrappedValue(process.env.DB_NAME),
  };
}

function getLocalConfig() {
  if (!fs.existsSync(configPath)) return {};
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    console.log("Database - unable to read runtime database config", error);
    return {};
  }
}

function isRunningInDocker() {
  return fs.existsSync("/.dockerenv");
}

function normalizeConnectionString(connectionString) {
  const value = trimWrappedValue(connectionString);
  if (!value) return "";
  if (isRunningInDocker()) return value;
  return value.replace("://noteto-database:", "://127.0.0.1:");
}

function getDbConfig(override = {}) {
  const environmentConfig = getEnvironmentConfig();
  const localConfig = getLocalConfig();
  const config = Object.assign({}, environmentConfig, localConfig, override);
  return {
    connectionString: normalizeConnectionString(
      config.connectionString || config.connUrl
    ),
    databaseName: trimWrappedValue(config.databaseName || config.dbName) || defaultDatabaseName,
  };
}

function validateConfig(config) {
  if (!config.connectionString) {
    throw new Error("MongoDB connection string is required.");
  }
}

function sanitizeConnectionString(connectionString) {
  if (!connectionString) return "";
  return connectionString.replace(/(mongodb(?:\+srv)?:\/\/)([^:@/]+):([^@/]+)@/i, "$1$2:***@");
}

function getStatus() {
  const config = getDbConfig();
  return {
    configured: Boolean(config.connectionString),
    connected: Boolean(activeClient),
    connectionString: sanitizeConnectionString(config.connectionString),
    databaseName: config.databaseName || "",
  };
}

function connect(config) {
  validateConfig(config);
  return MongoClient.connect(config.connectionString, defaultConnOption).then((client) => {
    return { client, db: client.db(config.databaseName) };
  });
}

async function createDbConn(override = {}) {
  const config = getDbConfig(override);
  const { client, db } = await connect(config);
  if (activeClient) {
    activeClient.close();
  }
  activeClient = client;
  console.log(`Successfully connected to MongoDB database "${config.databaseName}".`);
  return db;
}

async function testDbConn(override = {}) {
  const config = getDbConfig(override);
  const { client } = await connect(config);
  await client.db(config.databaseName).command({ ping: 1 });
  await client.close();
  return {
    code: 200,
    data: {
      connectionString: sanitizeConnectionString(config.connectionString),
      databaseName: config.databaseName,
    },
  };
}

function saveLocalConfig(config) {
  const nextConfig = getDbConfig(config);
  validateConfig(nextConfig);
  fs.mkdirSync(configDirectory, { recursive: true });
  fs.writeFileSync(
    configPath,
    JSON.stringify(
      {
        connectionString: nextConfig.connectionString,
        databaseName: nextConfig.databaseName,
      },
      null,
      2
    )
  );
  return {
    connectionString: sanitizeConnectionString(nextConfig.connectionString),
    databaseName: nextConfig.databaseName,
  };
}

module.exports = {
  createDbConn,
  getStatus,
  saveLocalConfig,
  testDbConn,
};
