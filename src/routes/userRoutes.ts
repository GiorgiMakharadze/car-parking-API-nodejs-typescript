import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  editVehicle,
  deleteVehicle,
  getUserVehicles,
  addVehicle,
  reserveParkingZone,
  deleteReservation,
  getReservation,
  userReservations,
} from "../controllers/userController";

const router = Router();
const userApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,
  message: "Too many requests from this IP, please try again after an hour",
});

router
  .route("/:userId/vehicles")
  .get(userApiLimiter, getUserVehicles)
  .post(userApiLimiter, addVehicle);

router
  .route("/:userId/vehicles/:vehicleId")
  .patch(userApiLimiter, editVehicle)
  .delete(userApiLimiter, deleteVehicle);

router
  .route("/:userId/reservations")
  .get(userApiLimiter, userReservations)
  .post(userApiLimiter, reserveParkingZone);

router
  .route("/:userId/reservations/:reservationId")
  .get(userApiLimiter, getReservation)
  .delete(userApiLimiter, deleteReservation);

export default router;
