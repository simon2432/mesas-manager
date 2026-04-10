import axios from "axios";

import { api } from "@/src/api/client";
import type { AuthUser } from "@/src/types/user.types";

export type AuthSuccessResponse = {
  message: string;
  token: string;
  user: AuthUser;
};

export type MeResponse = {
  user: AuthUser;
};

export async function loginRequest(
  email: string,
  password: string,
): Promise<AuthSuccessResponse> {
  const { data } = await api.post<AuthSuccessResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function registerRequest(
  name: string,
  email: string,
  password: string,
): Promise<AuthSuccessResponse> {
  const { data } = await api.post<AuthSuccessResponse>("/auth/register", {
    name,
    email,
    password,
  });
  return data;
}

export async function getMeRequest(): Promise<AuthUser> {
  const { data } = await api.get<MeResponse>("/auth/me");
  return data.user;
}

export function getApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data;
    if (body && typeof body === "object" && "message" in body) {
      const m = (body as { message: unknown }).message;
      if (typeof m === "string" && m.length > 0) {
        return m;
      }
    }
  }
  return fallback;
}
