import { redirect } from "next/navigation";

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

  redirect(approved ? "/dashboard?approved=1" : "/dashboard");
}
