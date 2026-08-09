"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase-client";
import {
  ADMIN_AUTH_ERROR_EVENT,
  type AdminAuthErrorDetail,
  type AdminAuthErrorStatus,
} from "@/lib/admin-auth-events";

export function AdminAuthErrorModal() {
  const router = useRouter();
  const [status, setStatus] = useState<AdminAuthErrorStatus | null>(null);

  useEffect(() => {
    const handleAuthError = (event: Event) => {
      const detail = (event as CustomEvent<AdminAuthErrorDetail>).detail;
      if (detail?.status !== 401 && detail?.status !== 403) return;

      setStatus((current) => current ?? detail.status);
    };

    window.addEventListener(ADMIN_AUTH_ERROR_EVENT, handleAuthError);
    return () =>
      window.removeEventListener(ADMIN_AUTH_ERROR_EVENT, handleAuthError);
  }, []);

  const close = () => setStatus(null);

  const goToLogin = async () => {
    close();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  };

  const isUnauthorized = status === 401;

  return (
    <AlertDialog
      open={status !== null}
      onOpenChange={(open) => !open && close()}
    >
      <AlertDialogContent
        overlayClassName="z-[10000]"
        className="z-[10000] border-[#20211f]/15 bg-[#fffefa]"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isUnauthorized ? "Sesión expirada" : "Acceso no autorizado"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isUnauthorized
              ? "Tu sesión administrativa ya no es válida. Inicia sesión nuevamente para continuar."
              : "Tu usuario está autenticado, pero no tiene permisos de superadmin para realizar esta acción."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {isUnauthorized ? (
            <AlertDialogAction onClick={() => void goToLogin()}>
              Volver al acceso
            </AlertDialogAction>
          ) : (
            <AlertDialogCancel onClick={close}>Cerrar</AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
