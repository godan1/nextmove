import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { TrustSignals } from "@/components/sections/trust-signals";
import { ServiceArea } from "@/components/sections/service-area";
import { MovingPrep } from "@/components/sections/moving-prep";
import { Faq } from "@/components/sections/faq";
import { QuoteSection } from "@/components/sections/quote-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <TrustSignals />
      <ServiceArea />
      <MovingPrep />
      <Faq />
      <QuoteSection />
    </>
  );
}
