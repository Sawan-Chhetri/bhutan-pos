import GSTReport from "@/components/gst/GSTReport";

export default function GSTReportPage({ params }) {
  const { month } = params;

  return <GSTReport month={month} />;
}
