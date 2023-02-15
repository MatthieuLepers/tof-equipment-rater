module.exports = {
  moduleFileExtensions: ['js'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/tests/*.spec.js',
    '<rootDir>/tests/**/*.spec.js',
  ],
  verbose: true,
};
