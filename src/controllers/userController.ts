import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import UserRepo from "../repos/userRepo";
import { validateVehicleInput, validateParkingZoneExistence } from "../utils";
import AuthUserRepo from "../repos/userAuthRepo";

const addVehicle = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { name, stateNumber, type, parkingZoneId } = req.body;

  validateVehicleInput(name, stateNumber, type);
  await validateParkingZoneExistence(parkingZoneId);

  const newVehicle = await UserRepo.addVehicle(
    userId,
    name,
    stateNumber,
    type,
    parkingZoneId
  );
  res.status(StatusCodes.CREATED).json({ ...newVehicle, parkingZoneId });
};

const editVehicle = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const vehicleId = parseInt(req.params.vehicleId);
  const { name, stateNumber, type, parkingZoneId } = req.body;

  validateVehicleInput(name, stateNumber, type);

  const vehicle = await UserRepo.findVehicleById(vehicleId);
  if (!vehicle) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "Vehicle not found" });
  }

  if (parseInt(vehicle.userId) !== userId) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Unauthorized action" });
  }

  const updatedVehicle = await UserRepo.editVehicle(
    vehicleId,
    name,
    stateNumber,
    type,
    parkingZoneId
  );
  res.status(StatusCodes.OK).json(updatedVehicle);
};

const deleteVehicle = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const vehicleId = parseInt(req.params.vehicleId);

  const vehicle = await UserRepo.findVehicleById(vehicleId);
  if (!vehicle) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "Vehicle not found" });
  }

  if (parseInt(vehicle.userId) !== userId) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Unauthorized action" });
  }

  await UserRepo.deleteVehicle(vehicleId);
  res.status(StatusCodes.OK).json({ msg: "Vehicle deleted" });
};

const getUserVehicles = async (req: any, res: Response) => {
  const userId = parseInt(req.params.userId);
  //change type
  if (parseInt(req.userId) !== userId) {
    return res.status(StatusCodes.FORBIDDEN).json({ msg: "Unauthorized" });
  }

  const user = await AuthUserRepo.findById(userId);
  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
  }

  const vehicles = await UserRepo.getUserVehicles(userId);
  res.status(StatusCodes.OK).json(vehicles);
};

export { addVehicle, editVehicle, deleteVehicle, getUserVehicles };
