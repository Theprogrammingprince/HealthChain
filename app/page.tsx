import dynamic from "next/dynamic";
import { HeroSection } from "@/components/features/HeroSection";
import { ParticlesBackground } from "@/components/ui/ParticlesBackground";

const ImpactSection = dynamic(() => import("@/components/features/ImpactSection").then(mod => mod.ImpactSection));
const PartnersSection = dynamic(() => import("@/components/features/PartnersSection").then(mod => mod.PartnersSection));
const TimelineSection = dynamic(() => import("@/components/features/TimelineSection").then(mod => mod.TimelineSection));

export default function Home() {
  return (
    <main className="relative">
      <ParticlesBackground />
      <HeroSection />
      <TimelineSection />
      <ImpactSection />
      <PartnersSection />
    </main>
  );
}
