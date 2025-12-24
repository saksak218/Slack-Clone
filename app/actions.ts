"use client";

import { authClient } from "@/lib/auth-client";

export const getCurrentUser = async () => {
  const { data, error } = await authClient.useSession();
  console.log(data);
  return data;
};
