import { redirect } from "next/navigation";
import { getAccessToken } from "@/lib/api-client";

export default function RootPage() {
  const token = getAccessToken();
  if (token) redirect("/dashboard");
  else redirect("/login");
}
