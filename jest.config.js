/*
 * Copyright 2018-2019 VMware, Inc.
 * SPDX-License-Identifier: MIT
 */

const { pathsToModuleNameMapper } = require("ts-jest/utils");
const { compilerOptions } = require("./tsconfig");

module.exports = {
    preset: "ts-jest",
    testMatch: ["**/__tests__/**/*.spec.ts"],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/../" }),
    collectCoverage: true,
    coveragePathIgnorePatterns: [".*/__tests__/.*", ".*/src/proto/.*", ".*/common/src/rest/.*"],
    globals: {
        "ts-jest": {
            "tsConfig": "<rootDir>/tsconfig.json",
            "diagnostics": {
                "warnOnly": true
            }
        }
    }
};
