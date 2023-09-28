import request from "supertest";
import buildApp from "../../app";
import AuthUserRepo from "../../repos/userAuthRepo";
import pool from "../../pool";

const baseUrl = "/api/v1";

beforeAll(async () => {
  return pool.connect({
    host: "postgres_test",
    port: 5432,
    database: "carparkingtest",
    user: process.env.PGUSERTEST,
    password: process.env.PGPASSWORDTEST,
  });
});

afterAll(async () => {
  return pool.close();
});

it("create a user", async () => {
  const startingCount = await AuthUserRepo.countUsers();

  expect(startingCount).toEqual(0);
  await request(buildApp)
    .post(`${baseUrl}/auth/register`)
    .send({
      username: "test",
      email: "test@gmail.com",
      password: "giorgigiorgigiorgi1!",
      securityQuestion: "Your favorite Weapon?",
      securityAnswer: "Mk18",
    })
    .expect(200);

  const finishCount = await AuthUserRepo.countUsers();
  expect(finishCount).toHaveBeenCalledTimes(1);
}, 10000);
