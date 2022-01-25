/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */


// // jest.config.js
// const { pathsToModuleNameMapper } = require('ts-jest')
// // In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// // which contains the path mapping (ie the `compilerOptions.paths` option):
// const { compilerOptions } = require('./tsconfig')

// module.exports = {
//   // [...]
//   moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths /*, { prefix: '<rootDir>/' } */),
// }
// const path = require('path');
// path.resolve()
//path.resolve(__dirname, "dist"),
module.exports = {
  preset: 'ts-jest',
  //testEnvironment: 'node',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^~/(.*)$': __dirname+'/src/$1',
    '^dependingState$': __dirname+'/../dependingState/src/index.ts',
    '^dependingState/(.*)$': __dirname+'/../dependingState/src/$1',
    '^dependingStateRouter$': __dirname+'/../dependingStateRouter/src/index.ts',
    '^dependingStateRouter/(.*)$': __dirname+'/../dependingStateRouter/src/$1',
/*
      "~/*": ["src/*"],
      "dependingState": ["../dependingState/src"],
      "dependingStateRouter": ["../dependingStateRouter/src"],

*/    
  },};