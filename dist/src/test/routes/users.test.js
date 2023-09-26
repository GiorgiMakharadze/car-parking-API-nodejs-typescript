"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const pool_1 = __importDefault(require("../../pool"));
const http_status_codes_1 = require("http-status-codes");
const app_1 = __importDefault(require("../../app"));
describe("Auth Controller", () => {
    beforeAll(async () => {
        return pool_1.default.connect({
            host: "postgres_test",
            port: 5432,
            database: "carparkingtest",
            user: process.env.PGUSERTEST,
            password: process.env.PGPASSWORDTEST,
        });
    });
    afterAll(async () => {
        return pool_1.default.close();
    });
    describe("POST /api/v1/auth/register", () => {
        it("should register a new user", async () => {
            const response = await (0, supertest_1.default)((0, app_1.default)())
                .post("/api/v1/auth/register")
                .send({
                username: "testuser",
                email: "testuser@example.com",
                password: "StrongPassword123!",
                securityQuestion: "What is your favorite color?",
                securityAnswer: "Blue",
            });
            expect(response.status).toBe(http_status_codes_1.StatusCodes.CREATED);
            expect(response.body).toHaveProperty("username", "testuser");
            // Add any other assertions based on the response body
            // Clean up: Optionally delete the user you have just created
        });
        // You can add more test cases as needed
    });
});
