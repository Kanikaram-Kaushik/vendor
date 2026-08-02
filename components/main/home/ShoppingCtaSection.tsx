import Image from "next/image";
import { shoppingUrl } from "@/lib/config";
import ButtonLink from "@/components/ButtonLink";

export function ShoppingCtaSection() {
  return (
    <section className="w-full px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-card px-8 py-16 sm:px-16 sm:py-20">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-accent" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent" />
          </div>
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <span className="inline-block text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                Curated Shopping
              </span>
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                Furnishings that complete the vision
              </h2>
              <p className="text-lg text-muted">
                Discover curated pieces from trusted makers and brands. From
                statement furniture to finishing touches, find everything to bring
                your design to life.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <ButtonLink href={shoppingUrl} label="Visit Shopping Site" external />
                <ButtonLink
                  href="/services"
                  label="View Services"
                  variant="secondary"
                />
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=1200&q=80"
                  alt="Curated furniture"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
