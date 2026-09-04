import { getAllProjectsMeta } from "@/lib/registry";
import AboutSection from "@/components/AboutSection";
import GitHubTelemetry from "@/components/home/GitHubTelemetry";
import HexBoard from "@/components/home/HexBoard";
import HomeAtmosphere from "@/components/home/HomeAtmosphere";
import LetsConnect from "@/components/sections/LetsConnect";

export default async function HomePage() {
  const projects = await getAllProjectsMeta();

  return (
    <HomeAtmosphere>
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center overflow-x-clip px-6 pb-24 pt-20">
      <h1 className="text-2xl sm:text-2xl md:text-4xl font-bold tracking-tight max-w-5xl text-center mb-3">
        An ecosystem of automated pipelines.
      </h1>
      <p className="max-w-lg text-center text-sm text-muted">
        Each channel is a swappable engine. This site is a static registry of how they
        are built — not a CMS.
      </p>

      <section id="mosaic" className="mt-16 w-full scroll-mt-24 overflow-x-clip">
        {projects.length > 0 ? (
          <div className="hex-mosaic-scale mx-auto flex origin-center justify-center transition-transform scale-[0.62] sm:scale-[0.85] md:scale-100 max-sm:-my-[19%] sm:max-md:-my-[7%]">
            <HexBoard projects={projects} />
          </div>
        ) : (
          <p className="text-sm text-muted">No channels registered yet.</p>
        )}
      </section>

      <div id="profile" className="mt-32 flex w-full scroll-mt-24 justify-center">
        <AboutSection />
      </div>

      <div id="agents" className="mt-8 flex w-full scroll-mt-24 justify-center">
        <GitHubTelemetry />
      </div>

      <div className="mt-24 w-full">
        <LetsConnect />
      </div>
    </main>
    </HomeAtmosphere>
  );
}