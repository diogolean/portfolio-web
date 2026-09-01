import { notFound } from "next/navigation";
import { getProject, listProjectSlugs } from "@/lib/registry";
import ProjectHero from "@/components/beats/ProjectHero";
import ArchitectureSpine from "@/components/beats/ArchitectureSpine";
import PipelineStations from "@/components/beats/PipelineStations";
import AutomationClose from "@/components/beats/AutomationClose";

export async function generateStaticParams() {
  const slugs = await listProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const { meta, architecture, narrativeHtml } = project;

  return (
    <main className="bg-bg">
      <ProjectHero meta={meta} architecture={architecture} />
      <ArchitectureSpine architecture={architecture} />
      <PipelineStations architecture={architecture} narrativeHtml={narrativeHtml} />
      <AutomationClose architecture={architecture} />
    </main>
  );
}
