import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getAllUsers,
  getUserById,
  deleteUser,
  getAllParkingZones,
  getParkingZoneById,
  createParkingZone,
  deleteParkingZone,
  updateParkingZone,
  makeUserAdmin,
  viewParkingHistory,
} from "../controllers/adminController";

const router = Router();
const adminApiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: "Too many requests from this IP, please try again after 10 minutes",
});

router.route("/get-all-users").get(adminApiLimiter, getAllUsers);

router
  .route("/get-user/:id")
  .get(adminApiLimiter, getUserById)
  .delete(adminApiLimiter, deleteUser);

router.route("/get-user/grant-admin/:id").patch(adminApiLimiter, makeUserAdmin);

router
  .route("/parking-zone")
  .get(adminApiLimiter, getAllParkingZones)
  .post(adminApiLimiter, createParkingZone);

router
  .route("/parking-zone/:id")
  .get(adminApiLimiter, getParkingZoneById)
  .delete(adminApiLimiter, deleteParkingZone)
  .patch(adminApiLimiter, updateParkingZone);

router.route("/parking-history").get(adminApiLimiter, viewParkingHistory);

export default router;
