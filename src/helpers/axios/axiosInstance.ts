
import { authKey } from "@/constants/storageKey";
import { IGenericErrorResponse, ResponseSuccessType } from "@/types";

import axios from "axios";

import { getFromLocalStorage } from "@/utils/local-storage";
import { getNewAccessToken } from "@/services/auth.services";

const instance = axios.create();
instance.defaults.headers.post["Content-Type"] = "application/json";
instance.defaults.headers["Accept"] = "application/json";
instance.defaults.timeout = 60000;

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent

    const accessToken = getFromLocalStorage(authKey);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor

instance.interceptors.response.use(
  //@ts-ignore
  function (response) {
    const responseObject: ResponseSuccessType = {
      data: response?.data?.data,
      meta: response?.data?.meta,
    };
    console.log(response);
    return responseObject;
  },
  async function (error) {
    const config = error?.config;
    console.log(config);
    console.log(error);
    if (error?.response?.status === 403 && !config.sent) {
      config.sent = true;
      try {
        const response = await getNewAccessToken();
        if (response?.data?.accessToken) {
          console.log("generate");
          const accessToken = response?.data?.accessToken;
          config.headers["Authorization"] = accessToken;
          setToLocalStorage(authKey, accessToken);
          return instance(config);
        }
      } catch (tokenRefreshError) {
        console.error("Token refresh failed", tokenRefreshError);
        handleLogout();
      }
    }

    if (error.response?.status === 400 || error.response?.status === 500) {
      handleLogout();
    }

    const responseObject: IGenericErrorResponse = {
      statusCode: error?.response?.data?.statusCode || 500,
      message: error?.response?.data?.message || "Something went wrong",
      errorMessages: error?.response?.data?.message,
    };
    return Promise.reject(responseObject);
  }
);

// Function to handle logout and redirection
function handleLogout() {
  removeUserInfo(authKey);
  window.location.href = "/login"; // Redirect to login or home page
}

export { instance };
