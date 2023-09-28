import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import UserRepo from "../repos/userRepo";
import AuthUserRepo from "../repos/userAuthRepo";
import AdminRepo from "../repos/adminRepo";
import { validateVehicleInput, findVehicle } from "../utils";
import { CustomRequest } from "../types/RequestTypes";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors";

/**
 * @function addVehicle
 * @description This function is responsible for adding a new vehicle for a user.
 * It validates the input and then adds the vehicle to the user's record in the database.
 * @param {Request} req - Express request object containing vehicle details like name, stateNumber, and type.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const addVehicle = async (req: CustomRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { name, stateNumber, type } = req.body;

  if (parseInt(req.userId) !== userId) {
    throw new UnauthorizedError("Unauthorized");
  }

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
 * @function getUserVehicles
 * @description This function is responsible for retrieving all vehicles associated with a user.
 * It checks if the user is authorized and exists, then fetches the user's vehicles from the database.
 * @param {Request} req - Express request object containing the user ID in params.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const getUserVehicles = async (req: CustomRequest, res: Response) => {
  const userId = parseInt(req.params.userId);

  if (parseInt(req.userId) !== userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const user = await AuthUserRepo.findById(userId);
  if (!user) {
    throw new NotFoundError(`No User with id: ${userId}`);
  }

  const vehicles = await UserRepo.getUserVehicles(userId);
  res.status(StatusCodes.OK).json(vehicles);
};

/**
 * @function editVehicle
 * @description This function is responsible for editing the details of a user's vehicle.
 * It validates the input, checks if the vehicle exists and belongs to the user, and then updates the vehicle in the database.
 * @param {Request} req - Express request object containing the vehicle details and IDs in params and body.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const editVehicle = async (req: CustomRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const vehicleId = parseInt(req.params.vehicleId);
  const { name, stateNumber, type } = req.body;

  if (parseInt(req.userId) !== userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  validateVehicleInput(name, stateNumber, type);

  const vehicle = await findVehicle(vehicleId, userId);
  if (!vehicle) {
    throw new NotFoundError(`No Vehicle with id: ${vehicleId}`);
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
 * @description This function is responsible for deleting a user's vehicle.
 * It checks if the vehicle exists and belongs to the user, and then deletes the vehicle from the database.
 * @param {Request} req - Express request object containing the user ID and vehicle ID in params.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const deleteVehicle = async (req: CustomRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const vehicleId = parseInt(req.params.vehicleId);

  if (parseInt(req.userId) !== userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const vehicle = await findVehicle(vehicleId, userId);
  if (!vehicle) {
    throw new NotFoundError(`No Vehicle with id: ${vehicleId}`);
  }

  await UserRepo.deleteVehicle(vehicleId);
  res.status(StatusCodes.OK).json({ msg: "Vehicle deleted" });
};

/**
 * @function reserveParkingZone
 * @description This function is responsible for reserving a parking zone for a user's vehicle.
 * It validates the input, checks the user's balance, calculates the cost, and then adds the reservation to the parking history in the database.
 * @param {Request} req - Express request object containing reservation details like parkingZoneId, vehicleId, and hours.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const reserveParkingZone = async (req: CustomRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { parkingZoneId, vehicleId, hours } = req.body;

  if (parseInt(req.userId) !== userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const parkingZone = await AdminRepo.findParkingZoneById(parkingZoneId);
  if (!parkingZone) {
    throw new NotFoundError(`No Parking zone  with id: ${parkingZoneId}`);
  }

  const userBalance = 100;
  const cost = parkingZone.hourlyCost * hours;
  if (userBalance < cost) {
    throw new BadRequestError("Insufficient balance");
  }

  const endTime = new Date();
  endTime.setHours(endTime.getHours() + hours - 4);

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

  if (parseInt(req.userId) !== userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  const reservations = await UserRepo.findReservationsByUserId(userId);
  if (!reservations.length) {
    throw new NotFoundError("No reservations found for this user");
  }

  res.status(StatusCodes.OK).json(reservations);
};

/**
 * @function getReservation
 * @description This function is responsible for retrieving the details of a reservation.
 * It checks if the reservation exists and belongs to the user, and then sends the reservation details back to the client.
 * @param {CustomRequest} req - Express request object containing the reservation ID in params.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const getReservation = async (req: CustomRequest, res: Response) => {
  const reservationId = parseInt(req.params.reservationId);
  const currentUserId = req.userId;

  const reservation = await UserRepo.findReservationById(reservationId);

  if (!reservation) {
    throw new NotFoundError("Reservation not found");
  }

  if (currentUserId !== reservation.userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  res.status(StatusCodes.OK).json(reservation);
};

/**
 * @function deleteReservation
 * @description This function is responsible for deleting a reservation.
 * It checks if the reservation exists and belongs to the user, and then deletes the reservation from the database.
 * @param {CustomRequest} req - Express request object containing the reservation ID in params.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const deleteReservation = async (req: CustomRequest, res: Response) => {
  const reservationId = parseInt(req.params.reservationId);
  const currentUserId = req.userId;

  const reservation = await UserRepo.findReservationById(reservationId);

  if (!reservation) {
    throw new NotFoundError("Reservation not found");
  }

  if (currentUserId !== reservation.userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  await UserRepo.deleteReservation(reservationId);

  res.status(StatusCodes.OK).json({ msg: "Reservation deleted" });
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
