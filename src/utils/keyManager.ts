import { generateKeyPairSync } from "crypto";

let privateKeyPEM: string;
let publicKeyPEM: string;

const generateKeys = () => {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");

  const privateKeyExport = privateKey.export({
    type: "pkcs8",
    format: "pem",
  });

  const publicKeyExport = publicKey.export({ type: "spki", format: "pem" });

  if (
    typeof privateKeyExport === "string" &&
    typeof publicKeyExport === "string"
  ) {
    privateKeyPEM = privateKeyExport;
    publicKeyPEM = publicKeyExport;
  } else {
    throw new Error("Key exports are not strings");
  }
};

generateKeys();

export { privateKeyPEM, publicKeyPEM };
