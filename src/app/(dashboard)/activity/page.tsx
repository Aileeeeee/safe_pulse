import dynamic from "next/dynamic";

// This tells Next.js 15: "Do not attempt to render or evaluate this on the server!"
const ActivityLogView = dynamic(
  () => import("@/components/views/ActivityLogView"),
  { ssr: false }
);

export default function ActivityPage() {
  return <ActivityLogView />;
}
