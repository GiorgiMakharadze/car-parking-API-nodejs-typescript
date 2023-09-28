"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicKeyPEM = exports.privateKeyPEM = void 0;
const crypto_1 = require("crypto");
let privateKeyPEM;
let publicKeyPEM;
const generateKeys = () => {
    const { privateKey, publicKey } = (0, crypto_1.generateKeyPairSync)("ed25519");
    const privateKeyExport = privateKey.export({
        type: "pkcs8",
        format: "pem",
    });
    const publicKeyExport = publicKey.export({ type: "spki", format: "pem" });
    if (typeof privateKeyExport === "string" &&
        typeof publicKeyExport === "string") {
        exports.privateKeyPEM = privateKeyPEM = privateKeyExport;
        exports.publicKeyPEM = publicKeyPEM = publicKeyExport;
    }
    else {
        throw new Error("Key exports are not strings");
    }
};
generateKeys();
