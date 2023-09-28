import UserRepo from "../repos/userRepo";

const findVehicle = async (vehicleId: number, userId: number) => {
  const vehicle = await UserRepo.findVehicleById(vehicleId);
  if (!vehicle || parseInt(vehicle.userId) !== userId) {
    return null;
  }
  return vehicle;
};

const findReservation = async (reservationId: number, userId: number) => {
  const reservation = await UserRepo.findReservationById(reservationId);
  if (!reservation || reservation.userId !== userId) {
    return null;
  }
  return reservation;
};

export { findVehicle, findReservation };
