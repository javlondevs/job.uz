// Bosh sahifa - serverda ma'lumot olinadi, render klientda (til/temaga mos)
import api from "@/lib/api";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic"; // har safar yangi ma'lumot

async function getLatestJobs() {
  try {
    const { data } = await api.get("/api/jobs?limit=6&sort=new");
    return data.data || [];
  } catch (e) {
    // VAQTINCHALIK debug
    globalThis.__ssrErr = `${e.code || "NO_CODE"}:${(e.message || "").slice(0, 90)}`;
    return []; // backend o'chsa ham sahifa ochiladi
  }
}

export default async function HomePage() {
  const jobs = await getLatestJobs();
  const dbg = globalThis.__ssrErr || "";
  return (
    <>
      {dbg ? <pre hidden>SSRERR:{dbg}</pre> : null}
      <HomeClient jobs={jobs} />
    </>
  );
}
