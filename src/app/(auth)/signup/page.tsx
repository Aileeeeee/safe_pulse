import { SignupForm } from "@/features/auth/SignupForm";
import { AuthShell } from "@/components/auth/AuthShell";

export const metadata = { title: "Sign up — SAFEPULSE" };

export default function SignupPage() {
  return (
    <AuthShell>
      <SignupForm />
    </AuthShell>
  );
}
