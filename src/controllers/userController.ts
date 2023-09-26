import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import UserRepo from "../repos/userRepo";
import { validateVehicleInput, validateParkingZoneExistence } from "../utils";

const addVehicle = async (req: Request, res: Response) => {
  try {
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
    res.status(StatusCodes.CREATED).json(newVehicle);
  } catch (error: any) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message });
  }
};

const editVehicle = async (req: Request, res: Response) => {
  const vehicleId = parseInt(req.params.vehicleId);
  const { name, stateNumber, type } = req.body;

  const updatedVehicle = await UserRepo.editVehicle(
    vehicleId,
    name,
    stateNumber,
    type
  );
  res.status(StatusCodes.OK).json(updatedVehicle);
};

const deleteVehicle = async (req: Request, res: Response) => {
  const vehicleId = parseInt(req.params.vehicleId);

  await UserRepo.deleteVehicle(vehicleId);
  res.status(StatusCodes.NO_CONTENT).json({ msg: "Vehicle deleted" });
};

const getUserVehicles = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId);

  const vehicles = await UserRepo.getUserVehicles(userId);
  res.status(StatusCodes.OK).json(vehicles);
};

export { addVehicle, editVehicle, deleteVehicle, getUserVehicles };
