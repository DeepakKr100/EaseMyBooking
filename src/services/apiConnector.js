import axios from "axios";

export const axiosInstance = axios.create();

// Optional: if you’d like a default baseURL, uncomment and set it:
// axiosInstance.defaults.baseURL = BASE_URL; // only if you import BASE_URL here

axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    // This shows CORS, cert, DNS, or preflight issues clearly in console
    if (err.response) {
      console.error("API ERROR:", err.response.status, err.response.data);
    } else if (err.request) {
      console.error("API NO RESPONSE (likely CORS/preflight/cert):", err.message);
    } else {
      console.error("API SETUP ERROR:", err.message);
    }
    throw err;
  }
);

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ?? null,
    headers: headers ?? null,
    params: params ?? null,
  });
};
