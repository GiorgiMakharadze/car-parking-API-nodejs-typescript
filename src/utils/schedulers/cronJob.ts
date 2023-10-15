import cron from "node-cron";
import UserRepo from "../../repos/userRepo";

export const startCronJobs = () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log("Running a task every minute to check reservation expiration");
    await UserRepo.updateExpiredReservations();
  });
};
