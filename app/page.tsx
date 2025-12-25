import { HeroSection } from "@/components/features/HeroSection";
import { ImpactSection } from "@/components/features/ImpactSection";
import { PartnersSection } from "@/components/features/PartnersSection";
import { TimelineSection } from "@/components/features/TimelineSection";
import { ParticlesBackground } from "@/components/ui/ParticlesBackground";

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
