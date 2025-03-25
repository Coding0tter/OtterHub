import type { ProfilePicture } from "./profilePicture";

export type User = {
  id: string;
  email: string;
  name: string;
  image: ProfilePicture;
  apps: string[];
};
