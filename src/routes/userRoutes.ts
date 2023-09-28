import express from "express";
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
import { userValidation, authenticateToken } from "../utils";

const router = express.Router();

router
  .route("/:userId/vehicles")
  .get(authenticateToken, userValidation, getUserVehicles)
  .post(authenticateToken, userValidation, addVehicle);

router
  .route("/:userId/vehicles/:vehicleId")
  .patch(authenticateToken, userValidation, editVehicle)
  .delete(authenticateToken, userValidation, deleteVehicle);

router
  .route("/:userId/reserve")
  .get(authenticateToken, userValidation, userReservations)
  .post(authenticateToken, userValidation, reserveParkingZone);

router
  .route("/:userId/reservations/:reservationId")
  .get(authenticateToken, userValidation, getReservation)
  .delete(authenticateToken, userValidation, deleteReservation);

export default router;
