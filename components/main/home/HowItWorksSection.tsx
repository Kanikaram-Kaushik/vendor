import SectionHeader from "@/components/SectionHeader";
import Reveal from "@/components/Reveal";
import { Search, MessagesSquare, PenTool } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Discover",
    description:
      "Browse our curated collection of elite designers and draw inspiration to find your unique style.",
    icon: Search,
  },
  {
    step: "02",
    title: "Connect",
    description:
      "Reach out to visionary studios that match your aesthetic and schedule in-depth consultations.",
    icon: MessagesSquare,
  },
  {
    step: "03",
    title: "Create",
    description:
      "Collaborate intimately with your chosen designer to bring your absolute dream space to life.",
    icon: PenTool,
  },
];

export function HowItWorksSection() {
  return (
    <section className="relative w-full bg-background px-4 py-24 sm:py-36 sm:px-6 lg:px-8 overflow-hidden z-0">

      {/* Subtle Depth Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(var(--accent-shadow)/0.04),transparent_60%)]" />

      <div className="mx-auto max-w-7xl space-y-16 lg:space-y-28">

        <SectionHeader
          eyebrow="THE PROCESS"
          title="Your design journey, elevated."
          description="Three effortless steps to transform your space by partnering with the industry's finest minds."
          align="center"
        />

        <div className="grid gap-12 lg:gap-20 lg:grid-cols-3">

          {STEPS.map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.step} delay={0.2 * index}>
                <div className="group relative flex flex-col items-center text-center">

                  {/* Step Badge */}
                  <div className="absolute -top-6 right-8 rounded-full bg-foreground px-3 py-1 text-xs font-semibold tracking-widest text-background shadow-md">
                    {item.step}
                  </div>

                  {/* Icon Glass Orb */}
                  <div className="mb-6 sm:mb-10 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full border border-accent/20 bg-card/60 backdrop-blur-xl shadow-[0_20px_50px_rgba(var(--accent-shadow)/0.1)] transition-all duration-500 group-hover:scale-110 group-hover:bg-card/80 group-hover:shadow-[0_30px_70px_rgba(var(--accent-shadow)/0.18)]">
                    <Icon className="h-8 w-8 sm:h-9 sm:w-9 text-foreground" />
                  </div>

                  {/* Glass Card */}
                  <div className="relative w-full rounded-[2.2rem] border border-accent/20 bg-card/60 px-6 py-10 sm:px-10 sm:py-14 backdrop-blur-2xl shadow-[0_25px_70px_rgba(var(--accent-shadow)/0.12)] transition-all duration-500 group-hover:-translate-y-6 group-hover:bg-card/80 group-hover:shadow-[0_40px_100px_rgba(var(--accent-shadow)/0.18)]">

                    <h3 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-semibold tracking-tight text-text-strong">
                      {item.title}
                    </h3>

                    <p className="leading-relaxed text-para opacity-90 text-base sm:text-lg">
                      {item.description}
                    </p>

                    {/* Glass Reflection Layer */}
                    <div className="pointer-events-none absolute inset-0 rounded-[2.2rem] bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60 dark:from-white/5" />

                  </div>
                </div>
              </Reveal>
            );
          })}

        </div>
      </div>
    </section>
  );
}