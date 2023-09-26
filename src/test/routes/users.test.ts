import request from "supertest";
import buildApp from "../../app";
import UserRepo from "../../repos/userRepo";
import pool from "../../pool";

jest.mock("../../src/repos/userRepo");
const mockedUserRepo = UserRepo as jest.Mocked<typeof UserRepo>;
const baseUrl = "/api/v1";

beforeAll(async () => {
  await pool.connect({
    host: "postgres_test",
    port: 5432,
    database: "carparkingtest",
    user: process.env.PGUSERTEST,
    password: process.env.PGPASSWORDTEST,
  });
});

afterAll(async () => {
  await pool.close();
});

it("create a user", async () => {
  mockedUserRepo.countUsers.mockResolvedValue(0);

  const response = await request(buildApp)
    .post(`${baseUrl}/auth/register`)
    .send({
      username: "test",
      email: "test@gmail.com",
      password: "giorgigiorgigiorgi1!",
      securityQuestion: "Your favorite Weapon?",
      securityAnswer: "Mk18",
    });

  expect(response.status).toEqual(200);

  expect(UserRepo.countUsers).toHaveBeenCalledTimes(1);
});
