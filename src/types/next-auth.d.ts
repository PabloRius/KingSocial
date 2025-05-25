import { CustomUser } from "./types";

declare module "next-auth" {
  interface Session {
    user: CustomUser;
  }

  interface User {
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
  }
}
