"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.queryWithCache = void 0;
const pool_1 = __importDefault(require("../pool"));
const redis_1 = require("redis");
const redisUrl = "redis://redis:6379";
const redisClient = (0, redis_1.createClient)({
    url: redisUrl,
});
const connectToRedis = (() => {
    async function connect() {
        try {
            await redisClient.connect();
            console.log("Connected to Redis!");
        }
        catch (err) {
            console.error("Error connecting to Redis:", err);
            console.log("Retrying in 5 seconds...");
            setTimeout(connect, 5000);
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
    const cacheValue = await redisClient.hGet(cacheKey, query);
    if (cacheValue) {
        return JSON.parse(cacheValue);
    }
    const result = await pool_1.default.query(query, params);
    const rows = result === null || result === void 0 ? void 0 : result.rows;
    redisClient
        .hSet(cacheKey, query, JSON.stringify(rows))
        .then(() => {
        return redisClient.expire(cacheKey, 300);
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
