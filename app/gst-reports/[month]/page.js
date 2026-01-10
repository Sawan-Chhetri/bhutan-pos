import GSTReport from "@/components/gst/GSTReport";

export default async function GSTReportPage({ params }) {
  const { month } = await params;

  return <GSTReport month={month} />;
}
