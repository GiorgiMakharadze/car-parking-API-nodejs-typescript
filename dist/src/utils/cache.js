"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.queryWithCache = void 0;
const pool_1 = __importDefault(require("../pool"));
const redis_1 = require("redis");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const redisUrl = `redis://${process.env.REDIS_HOST}:6379`;
const redisClient = (0, redis_1.createClient)({
    url: redisUrl,
});
const connectToRedis = (() => {
    async function connect() {
        try {
            await redisClient.connect();
        }
        catch (err) {
            console.error("Error connecting to Redis:", err);
        }
    }
    connect();
    return {
        connect,
    };
})();
redisClient.on("error", (err) => {
    console.error("Error connecting to Redis:", err);
});
const queryWithCache = async (query, params, cacheKey) => {
    // Check cache
    const cacheValue = await redisClient.hGet(cacheKey, query);
    if (cacheValue) {
        console.log("SERVING FROM CACHE");
        return JSON.parse(cacheValue);
    }
    const result = await pool_1.default.query(query, params);
    const rows = result === null || result === void 0 ? void 0 : result.rows;
    console.log("SERVING FROM POSTGRESQL");
    redisClient
        .hSet(cacheKey, query, JSON.stringify(rows))
        .then(() => {
        return redisClient.expire(cacheKey, 10);
    })
        .then(() => {
        console.log("CACHE SET TO EXPIRE IN 10 SECONDS");
    })
        .catch((err) => {
        console.error("Error while setting cache:", err);
    });
    return rows;
};
exports.queryWithCache = queryWithCache;
const clearCache = (hashKey) => {
    redisClient
        .del(hashKey)
        .then(() => {
        console.log("CACHE CLEARED FOR HASHKEY:", hashKey);
    })
        .catch((err) => {
        console.error("Error while clearing cache:", err);
    });
};
exports.clearCache = clearCache;
