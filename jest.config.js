module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/tests/*.spec.js',
    '<rootDir>/tests/*.spec.ts',
    '<rootDir>/tests/**/*.spec.js',
    '<rootDir>/tests/**/*.spec.ts',
  ],
  verbose: true,
};
