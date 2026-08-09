export const ADMIN_AUTH_ERROR_EVENT = "chile-adicto:admin-auth-error";

export type AdminAuthErrorStatus = 401 | 403;

export type AdminAuthErrorDetail = {
  status: AdminAuthErrorStatus;
};

export function dispatchAdminAuthError(status: AdminAuthErrorStatus) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<AdminAuthErrorDetail>(ADMIN_AUTH_ERROR_EVENT, {
      detail: { status },
    }),
  );
}
