"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordStrength = void 0;
const passwordStrength = (password) => {
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= 10 && hasNumber && hasSpecialChar;
};
exports.passwordStrength = passwordStrength;
