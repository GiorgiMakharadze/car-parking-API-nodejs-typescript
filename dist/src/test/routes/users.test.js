"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const userRepo_1 = __importDefault(require("../../repos/userRepo"));
const pool_1 = __importDefault(require("../../pool"));
jest.mock("../../src/repos/userRepo");
const mockedUserRepo = userRepo_1.default;
const baseUrl = "/api/v1";
beforeAll(async () => {
    await pool_1.default.connect({
        host: "postgres_test",
        port: 5432,
        database: "carparkingtest",
        user: process.env.PGUSERTEST,
        password: process.env.PGPASSWORDTEST,
    });
});
afterAll(async () => {
    await pool_1.default.close();
});
it("create a user", async () => {
    mockedUserRepo.countUsers.mockResolvedValue(0);
    const response = await (0, supertest_1.default)(app_1.default)
        .post(`${baseUrl}/auth/register`)
        .send({
        username: "test",
        email: "test@gmail.com",
        password: "giorgigiorgigiorgi1!",
        securityQuestion: "Your favorite Weapon?",
        securityAnswer: "Mk18",
    });
    expect(response.status).toEqual(200);
    expect(userRepo_1.default.countUsers).toHaveBeenCalledTimes(1);
});
