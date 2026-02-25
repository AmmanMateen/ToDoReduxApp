module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage/async-storage|@reduxjs/toolkit|redux|redux-persist|react-redux|immer)/)',
  ],
};
