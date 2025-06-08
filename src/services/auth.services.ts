import { authKey } from "@/constants/storageKey";
import { setToLocalStorage, getFromLocalStorage } from "../utils/local-storage";
import { decodedToken, isTokenExpired } from "../utils/jwt";
import { instance as axiosInstance } from "@/helpers/axios/axiosInstance";
import { getBaseUrl } from "@/helpers/config/envConfig";

export const storeUserInfo = ({ accessToken }: { accessToken: string }) => {

  return setToLocalStorage(authKey, accessToken as string);
};

export const getUserInfo = () => {
  let authToken = getFromLocalStorage(authKey);
  console.log("auth", authToken);

  const expired = isTokenExpired(authToken);
  // console.log("valid",expired);
  if (!expired) {
    const decodedData = decodedToken(authToken);
    // console.log("dec", decodedData);
    return decodedData;
  }

  return "";
};

export const getNewAccessToken = async () => {
  return await axiosInstance({
    url: `${getBaseUrl()}/auth/refresh-token`,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
};


export const isLoggedIn = () => {
  const authToken = getFromLocalStorage(authKey);



  return !!authToken;
};


export const token = () => {
  const authToken = getFromLocalStorage(authKey);
  return authToken;
};

export const removeUserInfo = (key: string) => {
  const data = localStorage.removeItem(key);

  return data;
};