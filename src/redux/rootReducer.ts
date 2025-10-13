

import { baseApi } from "./api/baseApi";
import authReducer from "@/store/Slices/authSlice";

export const reducer = {
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
};
