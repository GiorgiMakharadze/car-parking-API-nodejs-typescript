import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import UserRepo from "../repos/userRepo";
import { validateVehicleInput, validateParkingZoneExistence } from "../utils";
import AuthUserRepo from "../repos/userAuthRepo";
import AdminRepo from "../repos/adminRepo";

const addVehicle = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { name, stateNumber, type } = req.body;

  validateVehicleInput(name, stateNumber, type);

  const newVehicle = await UserRepo.addVehicle(
    userId as any,
    name,
    stateNumber,
    type
  );
  res.status(StatusCodes.CREATED).json(newVehicle);
};

const editVehicle = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const vehicleId = parseInt(req.params.vehicleId);
  const { name, stateNumber, type } = req.body;

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
    type
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

const reserveParkingZone = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { parkingZoneId, vehicleId, hours } = req.body;

  const parkingZone = await AdminRepo.findParkingZoneById(parkingZoneId);
  if (!parkingZone) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "Parking Zone not found" });
  }

  const userBalance = 100;
  const cost = parkingZone.hourlyCost * hours;
  if (userBalance < cost) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Insufficient balance" });
  }

  const endTime = new Date();
  endTime.setHours(endTime.getHours() + hours);

  await UserRepo.addParkingHistory(
    userId,
    vehicleId,
    parkingZoneId,
    endTime,
    cost
  );
  console.log("UserId:", userId);
  console.log("Body:", req.body);

  const newBalance = userBalance - cost;
  await UserRepo.updateBalance(userId, newBalance);

  res.status(StatusCodes.OK).json({ msg: "Reservation successful", endTime });
};

export {
  addVehicle,
  editVehicle,
  deleteVehicle,
  getUserVehicles,
  reserveParkingZone,
};
