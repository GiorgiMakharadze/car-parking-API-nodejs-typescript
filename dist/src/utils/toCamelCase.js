"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCamelCase = void 0;
const toCamelCase = (rows) => {
    return rows.map((row) => {
        const replaced = {};
        for (let key in row) {
            const camelCase = key.replace(/([-_][a-z])/gi, ($1) => $1.toUpperCase().replace("_", ""));
            replaced[camelCase] = row[key];
        }
        return replaced;
    });
};
exports.toCamelCase = toCamelCase;
