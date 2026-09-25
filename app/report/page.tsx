import { redirect } from "next/navigation";

// Keep the common singular URL working for demo users.
export default function ReportRedirectPage() {
  redirect("/reports");
}
