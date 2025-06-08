import { jwtDecode } from "jwt-decode";
import { removeUserInfo } from "../services/auth.services";
import { authKey } from "@/constants/storageKey";

export const decodedToken = (token: string) => {
  console.log("decode", token);
  if (token == "undefined") {
    removeUserInfo(authKey);
    // router.refresh();
  }
  return jwtDecode(token);
};

export const isTokenExpired = (token: string) => {
  try {
    const decoded: any = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      return true;
    }
    return false;
  } catch (error) {
    return true; // If there's an error decoding, consider the token as expired
  }
};