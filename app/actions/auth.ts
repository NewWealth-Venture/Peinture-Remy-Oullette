"use server";

import { changeCurrentUserPassword } from "@/lib/auth/password";

export type ChangePasswordActionResult =
  | { success: true }
  | { success: false; error: string; code?: string };

export async function changePasswordAction(newPassword: string): Promise<ChangePasswordActionResult> {
  const result = await changeCurrentUserPassword(newPassword);
  if (result.success) return { success: true };
  return {
    success: false,
    error: result.message,
    code: result.code,
  };
}

