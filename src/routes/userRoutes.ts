import express from "express";
import {
  editVehicle,
  deleteVehicle,
  getUserVehicles,
  addVehicle,
  reserveParkingZone,
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
  .post(authenticateToken, userValidation, reserveParkingZone);

export default router;
