import app from "./src/app";
import pool from "./src/pool";
import "dotenv/config";
import { startCronJobs } from "./src/utils";

const port = process.env.PORT || 5000;

pool
  .connect({
    host: "postgres",
    port: 5432,
    database: "carparking",
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
  })
  .then(() => {
    app().listen(port, () => {
      console.log(`Listening on port: ${port}...`);
      startCronJobs();
    });
  })
  .catch((err) => console.log(err));
