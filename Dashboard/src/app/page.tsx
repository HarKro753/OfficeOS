import { redirect } from "next/navigation";

type HomeProps = {
  searchParams?: Promise<{
    approved?: string | string[];
    sent?: string | string[];
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const resolvedSearchParams = await searchParams;
  const sentParam = resolvedSearchParams?.sent;
  const approvedParam = resolvedSearchParams?.approved;
  const sent = Array.isArray(sentParam)
    ? sentParam[0] === "1"
    : sentParam === "1";
  const legacyApproved = Array.isArray(approvedParam)
    ? approvedParam[0] === "1"
    : approvedParam === "1";

  redirect(sent || legacyApproved ? "/dashboard?sent=1" : "/dashboard");
}
