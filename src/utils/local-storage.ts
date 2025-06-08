// import { removeUserInfo } from "../services/auth.services";

// import { getSession } from "next-auth/react";

// // Save token to localStorage
// export const setToLocalStorage = (key: string, token: string) => {
//   console.log(token);
//   if (!key || typeof window === "undefined") {
//     return "";
//   }
//   return localStorage.setItem(key, token);
// };

// // Get token from localStorage or NextAuth session if not available
// export const getFromLocalStorage = (key: string) => {
//   if (!key || typeof window === "undefined") {
//     return "";
//   }

//   // First, check if the token is available in localStorage
//   let token = localStorage.getItem(key);

//   if (!token) {
//     // If not available, try to get the session from NextAuth using .then()
//     getSession().then((session) => {
//       console.log("local", session);
//       if (session && session.data.accessToken) {
//         token = session.data.accessToken as string; // Assuming session contains `accessToken`
//         // Optionally, you can store this token back to localStorage for future use
//         localStorage.setItem(key, token);
//       }
//     });
//   }

//   return token;
// };