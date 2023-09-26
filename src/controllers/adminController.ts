import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import UserRepo from "../repos/userRepo";
import AdminRepo from "../repos/adminRepo";
import {
  validateParkingZoneInput,
  validateParkingZoneExistence,
} from "../utils";

/**
 * @function getAllUsers
 * @description Retrieve all users from the database and sanitize the output.
 * This function is responsible for fetching all user details, removing sensitive information,
 * and returning sanitized user objects.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object used to send the sanitized user details back to the client.
 */
const getAllUsers = async (req: Request, res: Response) => {
  const users = await UserRepo.findAllUsers();
  const sanitizedUsers = users.map((user) => {
    const {
      password,
      refreshToken,
      checksum,
      securityQuestion,
      securityAnswer,
      ...sanitizedUser
    } = user;
    return sanitizedUser;
  });
  res.status(StatusCodes.OK).json(sanitizedUsers);
};

/**
 * @function getUserById
 * @description Fetch a user by ID, sanitize and return the user object.
 * This function retrieves a user based on the provided user ID, removes sensitive information,
 * and sends the sanitized user object as a response.
 * @param {Request} req - Express request object with user ID in parameters.
 * @param {Response} res - Express response object used to send the sanitized user details back to the client.
 */
const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const user = await UserRepo.findById(userId);

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
  }

  const {
    password,
    refreshToken,
    checksum,
    securityQuestion,
    securityAnswer,
    ...sanitizedUser
  } = user;

  res.status(StatusCodes.OK).json(sanitizedUser);
};

const deleteUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);

  const deletedUser = await AdminRepo.deleteUser(userId);
  if (!deletedUser) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
  }

  res.status(StatusCodes.OK).json({ msg: `User with id ${userId} is deleted` });
};

const makeUserAdmin = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = id.toString();

  const authenticatedUser = await UserRepo.findById(req.userId.toString());

  if (!authenticatedUser || authenticatedUser.role !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({ msg: "Permission denied" });
  }

  const user = await UserRepo.findById(userId);

  if (!user) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "User not found" });
  }

  if (user.role === "admin") {
    return res.status(StatusCodes.OK).json({ msg: "User is already an admin" });
  }

  await AdminRepo.grantAdminRights(userId);

  return res.status(StatusCodes.OK).json({ msg: "User has been made admin" });
};

/**
 * @function createParkingZone
 * @description Validate input and create a new parking zone.
 * This function validates the parking zone input, checks if a parking zone with the same name already exists,
 * and if not, creates a new parking zone and returns its details.
 * @param {Request} req - Express request object containing parking zone details like name, address, and hourly cost.
 * @param {Response} res - Express response object used to send the response back to the client.
 */
const createParkingZone = async (req: Request, res: Response) => {
  const { name, address, hourlyCost } = req.body;

  validateParkingZoneInput(name, address, hourlyCost);

  const existingZone = await AdminRepo.findParkingZoneByName(name);
  if (existingZone) {
    return res
      .status(StatusCodes.CONFLICT)
      .json({ msg: "Parking zone already exists" });
  }

  const newParkingZone = await AdminRepo.createParkingZone(
    name,
    address,
    hourlyCost
  );
  res.status(StatusCodes.CREATED).json(newParkingZone);
};

/**
 * @function getAllParkingZones
 * @description Retrieve and return all parking zones from the database.
 * This function fetches and sends back all parking zones stored in the database.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object used to send the parking zones details back to the client.
 */
const getAllParkingZones = async (_req: Request, res: Response) => {
  const parkingZones = await AdminRepo.findAllParkingZones();
  res.status(StatusCodes.OK).json(parkingZones);
};

/**
 * @function getParkingZoneById
 * @description Fetch and return the parking zone by ID.
 * This function validates if the parking zone with the given ID exists, retrieves it,
 * and returns its details.
 * @param {Request} req - Express request object with parking zone ID in parameters.
 * @param {Response} res - Express response object used to send the parking zone details back to the client.
 */
const getParkingZoneById = async (req: Request, res: Response) => {
  const zoneId = parseInt(req.params.id);

  await validateParkingZoneExistence(zoneId);

  const parkingZone = await AdminRepo.findParkingZoneById(zoneId);
  res.status(StatusCodes.OK).json(parkingZone);
};

/**
 * @function updateParkingZone
 * @description Validate input, check the existence of the parking zone and update its details.
 * This function validates the parking zone input, ensures the parking zone with the given ID exists,
 * updates its details, and returns the updated parking zone.
 * @param {Request} req - Express request object containing updated parking zone details and ID in parameters.
 * @param {Response} res - Express response object used to send the updated parking zone details back to the client.
 */
const updateParkingZone = async (req: Request, res: Response) => {
  const zoneId = parseInt(req.params.id);
  const { name, address, hourlyCost } = req.body;

  validateParkingZoneInput(name, address, hourlyCost);
  await validateParkingZoneExistence(zoneId);

  const updatedParkingZone = await AdminRepo.updateParkingZone(
    zoneId,
    name,
    address,
    hourlyCost
  );
  res.status(StatusCodes.OK).json({
    msg: `Parking zone with id ${zoneId} is updated`,
    updatedParkingZone,
  });
};

/**
 * @function deleteParkingZone
 * @description Validate the existence of the parking zone and delete it.
 * This function checks if the parking zone with the given ID exists and deletes it, returning a confirmation message.
 * @param {Request} req - Express request object with parking zone ID in parameters.
 * @param {Response} res - Express response object used to send a confirmation of deletion back to the client.
 */
const deleteParkingZone = async (req: Request, res: Response) => {
  const zoneId = parseInt(req.params.id);
  await validateParkingZoneExistence(zoneId);

  await AdminRepo.deleteParkingZone(zoneId);
  res
    .status(StatusCodes.NO_CONTENT)
    .json({ msg: `Parking zone wit id ${zoneId} is deleted` });
};

export {
  getAllUsers,
  getUserById,
  deleteUser,
  makeUserAdmin,
  createParkingZone,
  getAllParkingZones,
  getParkingZoneById,
  updateParkingZone,
  deleteParkingZone,
};
