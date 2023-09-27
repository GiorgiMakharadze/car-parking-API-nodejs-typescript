import express from "express";
import {
  editVehicle,
  deleteVehicle,
  getUserVehicles,
  reserveParkingZoneAddVehicle,
} from "../controllers/userController";
import { userValidation, authenticateToken } from "../utils";

const router = express.Router();

router
  .route("/:userId/vehicles")
  .get(authenticateToken, userValidation, getUserVehicles);

router
  .route("/:userId/reserve-and-add-vehicle")
  .post(authenticateToken, userValidation, reserveParkingZoneAddVehicle);

router
  .route("/:userId/vehicles/:vehicleId")
  .patch(authenticateToken, userValidation, editVehicle)
  .delete(authenticateToken, userValidation, deleteVehicle);

export default router;
