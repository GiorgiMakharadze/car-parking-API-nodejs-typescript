"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const userAuthRepo_1 = __importDefault(require("../../repos/userAuthRepo"));
const pool_1 = __importDefault(require("../../pool"));
const baseUrl = "/api/v1";
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
it("create a user", async () => {
    const startingCount = await userAuthRepo_1.default.countUsers();
    expect(startingCount).toEqual(0);
    await (0, supertest_1.default)(app_1.default)
        .post(`${baseUrl}/auth/register`)
        .send({
        username: "test",
        email: "test@gmail.com",
        password: "giorgigiorgigiorgi1!",
        securityQuestion: "Your favorite Weapon?",
        securityAnswer: "Mk18",
    })
        .expect(200);
    const finishCount = await userAuthRepo_1.default.countUsers();
    expect(finishCount).toHaveBeenCalledTimes(1);
}, 10000);
