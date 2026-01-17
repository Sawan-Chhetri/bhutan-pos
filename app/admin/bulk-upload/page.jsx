"use client";
import AdminBulkItemUpload from "@/components/admin/AdminBulkItemUpload";
import { useEffect, useState } from "react";

export default function BulkUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <AdminBulkItemUpload />
    </div>
  );
}
