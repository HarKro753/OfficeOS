import { ProjectDashboard } from "@/features/project-dashboard";

type HomeProps = {
  searchParams?: Promise<{
    approved?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const approvedParam = resolvedSearchParams?.approved;
  const approved = Array.isArray(approvedParam)
    ? approvedParam[0] === "1"
    : approvedParam === "1";

  return <ProjectDashboard approved={approved} />;
}
