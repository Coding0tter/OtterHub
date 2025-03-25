import axios from "axios";

export const getApiClient = (baseUrl: string) => {
  const apiClient = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
  });

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        try {
          console.log("trying to refresh");
          const response = await axios.post(
            import.meta.env.OTTER_API_URL + "/auth/refresh",
            {
              refreshToken: localStorage.getItem("refreshToken"),
            },
            {
              withCredentials: true,
            },
          );
          localStorage.setItem("refreshToken", response.data.refreshToken);
          return apiClient.request(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed", refreshError);
        }
      }
      return Promise.reject(error);
    },
  );

  return apiClient;
};

export const getWithAuth = async (url: string) => {
  const response = await axios.get(import.meta.env.OTTER_API_URL + url, {
    withCredentials: true,
  });

  return response.data;
};

export const postWithAuth = async (url: string, body: any) => {
  const response = await axios.post(import.meta.env.OTTER_API_URL + url, body, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  return response.data;
};
