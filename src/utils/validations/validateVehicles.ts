// utils/validate.ts

import validator from "validator";

const validateVehicleInput = (
  name: string,
  stateNumber: string,
  type: string
) => {
  if (!validator.isAlpha(name, "en-US", { ignore: " " })) {
    throw new Error("Invalid vehicle name");
  }
  if (!validator.isAlphanumeric(stateNumber, "en-US")) {
    throw new Error("Invalid state number");
  }
  if (!["Sedan", "Hatchback", "SUV", "Truck"].includes(type)) {
    throw new Error("Invalid vehicle type");
  }
};

export { validateVehicleInput };
