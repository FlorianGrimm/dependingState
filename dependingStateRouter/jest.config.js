/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  //testMatch: [ "**/src/**/__tests__/**/*.[jt]s?(x)", "**/src/**/?(*.)+(spec|test).[jt]s?(x)" ]
  testMatch: [ 
    // "**/src/**/__tests__/**/*.[jt]s?(x)", 
    // "**/src/**/?(*.)+(spec|test).[jt]s?(x)" 
    "**/src/__tests__/**/?(*.)+(spec|test).[jt]s?(x)" 
  ]
};