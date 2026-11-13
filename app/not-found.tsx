import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main id="main" className="relative grid min-h-[80svh] place-items-center">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10 opacity-60" />
      <div className="container-x text-center">
        <p className="font-mono text-[13px] text-accent">404 · route not found</p>
        <h1 className="display mt-5 text-[clamp(2.5rem,7vw,5.5rem)]">
          This endpoint <span className="serif-accent text-accent">doesn&apos;t exist.</span>
        </h1>
        <div className="mt-10 flex justify-center">
          <ButtonLink href="/" icon={<ArrowLeft size={16} />}>
            Back home
          </ButtonLink>
        </div>
      </div>
    </main>
  );
}
