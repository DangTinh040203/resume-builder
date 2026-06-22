import { type AxiosRequestConfig } from "axios";

import { Env } from "@/configs/env.config";

export const axiosConfig: AxiosRequestConfig = {
  baseURL: Env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true,
};
