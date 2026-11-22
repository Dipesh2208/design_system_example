import React, { Suspense } from "react";
import { AppSpinner } from "@repo/ui/atoms/AppSpinner";
import { ClientOnly } from "~/components/ClientOnly";

// Lazy-load the interactive sandbox showcase component
const ButtonContainerTest = React.lazy(() =>
  import("@/components/sandbox/ButtonContainerTest").then((m) => ({
    default: m.ButtonContainerTest,
  })),
);

export default function IndexRoute() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <ClientOnly
        fallback={
          <div className="flex items-center justify-center min-h-[50vh]">
            <AppSpinner size="lg" className="text-primary" />
          </div>
        }
      >
        {() => (
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <AppSpinner size="lg" className="text-primary" />
              </div>
            }
          >
            <ButtonContainerTest />
          </Suspense>
        )}
      </ClientOnly>
    </main>
  );
}
