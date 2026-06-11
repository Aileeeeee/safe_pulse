"use client";

import dynamic from "next/dynamic";

// The import path MUST be a string literal inside the arrow function, 
// not a variable or a pre-imported component module.
const ActivityLogView = dynamic(
  () => import("@/components/views/ActivityLogView"),
  { ssr: false }
);

export default function ActivityPage() {
  return <ActivityLogView />;
}
