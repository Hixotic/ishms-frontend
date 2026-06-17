import React from "react";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="p-8">
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="animate-spin" />
          <span>Example Page</span>
        </div>
        <Streamdown>Any **markdown** content</Streamdown>
        <Button variant="default" className="mt-4">
          Example Button
        </Button>
      </main>
    </div>
  );
}
