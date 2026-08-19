import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Slices (auth, files, folders) will be registered here
  },
});