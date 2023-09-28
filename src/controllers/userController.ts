import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import UserRepo from "../repos/userRepo";
import { validateVehicleInput, validateParkingZoneExistence } from "../utils";
import AuthUserRepo from "../repos/userAuthRepo";
import AdminRepo from "../repos/adminRepo";
import { CustomRequest } from "../types/RequestTypes";

/**
 * @function addVehicle
 * @description Add a new vehicle to the user's account.
 * @param {Request} req - Express request object with user ID and vehicle details.
 * @param {Response} res - Express response object.
 */
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

/**
 * @function editVehicle
 * @description Edit details of an existing vehicle associated with a user.
 * @param {Request} req - Express request object with user ID, vehicle ID, and new vehicle details.
 * @param {Response} res - Express response object.
 */
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

/**
 * @function deleteVehicle
 * @description Delete an existing vehicle associated with a user.
 * @param {Request} req - Express request object with user ID and vehicle ID.
 * @param {Response} res - Express response object.
 */
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

/**
 * @function getUserVehicles
 * @description Retrieve all vehicles associated with a user.
 * @param {CustomRequest} req - Express request object with user ID.
 * @param {Response} res - Express response object.
 */
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

/**
 * @function reserveParkingZone
 * @description Reserve a parking zone for a user and update their balance.
 * @param {Request} req - Express request object with user ID, parking zone details, and reservation duration.
 * @param {Response} res - Express response object.
 */
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

  const parkingHistory = await UserRepo.addParkingHistory(
    userId,
    vehicleId,
    parkingZoneId,
    endTime,
    cost
  );

  const newBalance = userBalance - cost;
  await UserRepo.updateBalance(userId, newBalance);

  res.status(StatusCodes.OK).json({
    msg: "Reservation successful",
    endTime,
    reservationId: parkingHistory.id,
  });
};

/**
 * @function userReservations
 * @description Retrieve all reservations associated with a user.
 * @param {CustomRequest} req - Express request object with user ID.
 * @param {Response} res - Express response object.
 */
const userReservations = async (req: CustomRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const currentUserId = req.userId;

  if (userId !== currentUserId) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Unauthorized action" });
  }

  const reservations = await UserRepo.findReservationsByUserId(userId);
  if (!reservations.length) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "No reservations found for this user" });
  }

  res.status(StatusCodes.OK).json(reservations);
};

/**
 * @function deleteReservation
 * @description Delete an existing reservation associated with a user.
 * @param {CustomRequest} req - Express request object with user ID and reservation ID.
 * @param {Response} res - Express response object.
 */
const deleteReservation = async (req: CustomRequest, res: Response) => {
  const reservationId = parseInt(req.params.reservationId);
  const currentUserId = req.userId;

  const reservation = await UserRepo.findReservationById(reservationId);
  if (!reservation) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "Reservation not found" });
  }

  if (reservation.userId !== currentUserId) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Unauthorized action" });
  }

  await UserRepo.deleteReservation(reservationId);
  res.status(StatusCodes.OK).json({ msg: "Reservation deleted" });
};

/**
 * @function getReservation
 * @description Retrieve details of a specific reservation associated with a user.
 * @param {CustomRequest} req - Express request object with user ID and reservation ID.
 * @param {Response} res - Express response object.
 */
const getReservation = async (req: CustomRequest, res: Response) => {
  const reservationId = parseInt(req.params.reservationId);
  const currentUserId = req.userId;

  const reservation = await UserRepo.findReservationById(reservationId);
  if (!reservation) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: "Reservation not found" });
  }

  if (reservation.userId !== currentUserId) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: "Unauthorized action" });
  }

  res.status(StatusCodes.OK).json(reservation);
};

export {
  addVehicle,
  editVehicle,
  deleteVehicle,
  getUserVehicles,
  reserveParkingZone,
  deleteReservation,
  getReservation,
  userReservations,
};
