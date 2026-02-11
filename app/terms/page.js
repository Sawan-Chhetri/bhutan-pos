import React from "react";
import Link from "next/link";

export default function Terms() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-10 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-black mb-2">Terms of Service</h1>
        <p className="text-slate-500 font-medium mb-10">
          Last updated: February {new Date().getFullYear()}
        </p>

        <section className="space-y-8 bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="space-y-4">
            <h2 className="text-xl font-black">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing and using SwiftGST, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do
              not use our services.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black">2. Service Description</h2>
            <p className="text-slate-600 leading-relaxed">
              SwiftGST provides GST billing and inventory management software
              for businesses in Bhutan. We are not a government agency and are
              not responsible for your tax filings, though our tools are
              designed to assist with compliance.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black">3. Data Privacy</h2>
            <p className="text-slate-600 leading-relaxed">
              Your business data belongs to you. We do not sell your data to
              third parties. We use industry-standard security measures to
              protect your information, but cannot guarantee absolute security
              against unauthorized intrusion.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black">4. Subscription & Payments</h2>
            <p className="text-slate-600 leading-relaxed">
              Services are billed on a subscription basis (Monthly or Annually).
              You may cancel your subscription at any time. Refunds are
              processed according to our refund policy.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black">5. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              SwiftGST shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other
              intangible losses.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-black">6. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about these Terms, please contact us at
              support@swiftgst.bt
            </p>
          </div>
        </section>

        <footer className="mt-12 text-center text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} SwiftGST. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
