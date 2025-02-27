import axios from "axios";
import { getWithAuth } from "./request";

export const getUser = async () => {
  try {
    const response = await getWithAuth("/auth/user");
    return response;
  } catch (err) {
    console.error("Failed to get user", err);
  }
};

export const logout = async () => {
  try {
    await axios.post(
      `${import.meta.env.OTTER_API_URL}/auth/logout`,
      {},
      {
        withCredentials: true,
      },
    );

    localStorage.removeItem("refreshToken");
  } catch (err) {
    console.error("Failed to logout", err);
  }
};

export const parseUserHeader = async (ctx: any) => {
  const userHeader = ctx.headers["x-user"];
  if (userHeader) {
    try {
      ctx.user = JSON.parse(userHeader);
    } catch (error) {
      console.error("Failed to parse x-user header:", error);
    }
  }
};
