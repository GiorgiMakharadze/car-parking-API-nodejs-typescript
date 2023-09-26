import validator from "validator";
import AdminRepo from "../../repos/adminRepo";

const validateParkingZoneExistence = async (zoneId: number) => {
  const existingZone = await AdminRepo.findParkingZoneById(zoneId);
  if (!existingZone) {
    throw new Error(`Parking zone with id ${zoneId} not found`);
  }
};

const validateParkingZoneInput = (
  name: string,
  address: string,
  hourlyCost: any
) => {
  if (!validator.isAlpha(name, "en-US", { ignore: " " })) {
    throw new Error("Invalid zone name");
  }
  if (typeof address !== "string" || address.trim() === "") {
    throw new Error("Invalid address");
  }
  if (!validator.isNumeric(String(hourlyCost))) {
    throw new Error("Invalid hourly cost");
  }
};

export { validateParkingZoneExistence, validateParkingZoneInput };
