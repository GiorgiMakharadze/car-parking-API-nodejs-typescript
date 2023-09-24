"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testFuncntion = void 0;
require("dotenv/config");
const testFuncntion = async (req, res) => {
    res.status(200).json({ msg: "you are admin" });
};
exports.testFuncntion = testFuncntion;
