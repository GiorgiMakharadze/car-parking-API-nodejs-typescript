import crypto from "crypto";

interface UserType {
  id: number;
  username: string;
  email: string;
}

export const calculateChecksum = (user: UserType): string => {
  const checksumData = {
    id: user.id,
    username: user.username,
    email: user.email,
  };
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(checksumData))
    .digest("hex");
};
