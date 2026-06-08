import { LoginForm } from "@/features/auth/LoginForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = { title: "Sign in — SAFEPULSE" };

export default function LoginPage() {
  return (
    <AuthShell>
      <LoginForm />
    </AuthShell>
  );
}
