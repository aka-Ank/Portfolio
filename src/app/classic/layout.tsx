import type { ReactNode } from "react";
import { ClassicHeader } from "@/components/classic/ClassicHeader";

export default function ClassicLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <ClassicHeader />
      {children}
    </div>
  );
}
