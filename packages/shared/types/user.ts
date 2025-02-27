import type { ProfilePicture } from "./profilePicture";

export type User = {
  email: string;
  name: string;
  picture: ProfilePicture;
  services: string[];
};
