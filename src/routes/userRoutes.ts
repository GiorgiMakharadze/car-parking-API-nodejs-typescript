import express from "express";
import {
  addVehicle,
  editVehicle,
  deleteVehicle,
  getUserVehicles,
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

export default router;
