// import React from "react";

// const LandingPage = () => {
//   return (
//     <main className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-[#A8DF8E]/30">
//       {/* Navigation */}
//       <nav className="relative w-full max-w-6xl mx-auto px-6 py-8 flex justify-between items-center z-50">
//         <div className="text-2xl font-black tracking-tighter text-slate-950">
//           Swift<span className="text-[#A8DF8E]">GST.</span>
//         </div>
//         <div className="hidden md:flex gap-8 items-center font-bold text-sm text-slate-600">
//           <a href="#solutions" className="hover:text-slate-950 transition">
//             Solutions
//           </a>
//           <a href="#pricing" className="hover:text-slate-950 transition">
//             Pricing
//           </a>
//           <a
//             href="/login"
//             className="px-5 py-2 rounded-full bg-slate-950 text-white hover:bg-slate-800 transition"
//           >
//             Login
//           </a>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <section className="relative w-full max-w-6xl mx-auto px-6 pt-12 pb-20 text-center">
//         <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-black tracking-widest text-[#EE4B6A] uppercase bg-[#FFD8DF]/30 rounded-full border border-[#FFAAB8]/20">
//           Made in Bhutan <span className="text-2xl">🇧🇹</span>
//         </div>
//         <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-950 mb-8 leading-[1.1]">
//           The Billing Tool for <br />
//           <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500">
//             Every Local Business.
//           </span>
//         </h1>
//         <p className="text-xl md:text-2xl text-slate-500 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
//           Whether you sell over a counter or bill by the project, SwiftGST keeps
//           your records clean and your taxes calculated.
//         </p>
//         <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
//           <a
//             href="/register"
//             className="w-full sm:w-auto px-10 py-4 rounded-2xl text-lg font-bold bg-slate-950 text-white hover:shadow-2xl hover:shadow-slate-500/30 transition-all"
//           >
//             Start Free Trial
//           </a>
//         </div>
//       </section>

//       {/* Solutions: The Dual-Mode Section */}
//       <section id="solutions" className="w-full max-w-6xl mx-auto px-6 py-12">
//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Solution 1: Retail */}
//           <div className="relative group overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 p-10 hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
//             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
//               <span className="text-8xl">🛒</span>
//             </div>
//             <div className="relative z-10">
//               <div className="text-xs font-black tracking-[0.2em] text-[#A8DF8E] uppercase mb-4"></div>
//               <h3 className="text-3xl font-black text-slate-950 mb-4 text-balance">
//                 Retail & Restaurants
//               </h3>
//               <p className="text-slate-500 mb-8 font-medium leading-relaxed">
//                 A high-speed interface for physical stores. Switch on "POS Mode"
//                 to ring up sales, print receipts, and track daily cash flow.
//               </p>
//               <ul className="space-y-3 mb-8">
//                 {[
//                   "Automatic GST vs. Exempt filtering",
//                   "End-of-day Sales Summaries",
//                   "Works offline on any tablet/laptop",
//                 ].map((f) => (
//                   <li
//                     key={f}
//                     className="flex items-center gap-3 text-sm font-bold text-slate-700"
//                   >
//                     <div className="w-1.5 h-1.5 rounded-full bg-[#A8DF8E]" />{" "}
//                     {f}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           {/* Solution 2: Service */}
//           <div className="relative group overflow-hidden rounded-[2.5rem] bg-slate-950 p-10 hover:shadow-2xl hover:shadow-slate-900/20 transition-all">
//             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
//               <span className="text-8xl">🏗️</span>
//             </div>
//             <div className="relative z-10">
//               <div className="text-xs font-black tracking-[0.2em] text-[#FFAAB8] uppercase mb-4"></div>
//               <h3 className="text-3xl font-black text-white mb-4 text-balance">
//                 Service & Construction
//               </h3>
//               <p className="text-slate-400 mb-8 font-medium leading-relaxed">
//                 A professional dashboard for contractors. Switch to "Invoicer
//                 Mode" to generate PDF bills, track outstanding debts, and manage
//                 projects.
//               </p>
//               <ul className="space-y-3 mb-8">
//                 {[
//                   "Professional PDF Invoicing",
//                   "Track unpaid client balances",
//                   "Service-based GST calculations",
//                 ].map((f) => (
//                   <li
//                     key={f}
//                     className="flex items-center gap-3 text-sm font-bold text-slate-300"
//                   >
//                     <div className="w-1.5 h-1.5 rounded-full bg-[#FFAAB8]" />{" "}
//                     {f}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Pricing Section - Unified */}
//       <section
//         id="pricing"
//         className="w-full max-w-6xl mx-auto px-6 py-20 border-t border-slate-100"
//       >
//         <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
//           <div className="text-left">
//             <h2 className="text-4xl font-black mb-2">Simple Pricing.</h2>
//             <p className="text-slate-500 font-bold">
//               Both modes included in every plan.
//             </p>
//           </div>

//           {/* Annual Switcher Label */}
//           <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-4">
//             <span className="px-4 py-2 text-xs font-black text-slate-500 uppercase tracking-widest">
//               Pricing in Nu.
//             </span>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-8">
//           {/* Monthly */}
//           <div className="p-10 rounded-[2.5rem] bg-white border border-slate-200 flex flex-col justify-between">
//             <div>
//               <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
//                 Pay as you go
//               </p>
//               <div className="flex items-baseline gap-2 mb-8">
//                 <span className="text-6xl font-black text-slate-950">750</span>
//                 <span className="text-slate-400 font-bold text-xl">/mo</span>
//               </div>
//               <p className="text-slate-500 font-medium mb-8">
//                 Best for seasonal businesses or short-term projects.
//               </p>
//             </div>
//             <button className="w-full py-4 rounded-2xl border-2 border-slate-950 text-slate-950 font-black hover:bg-slate-950 hover:text-white transition">
//               Start Monthly
//             </button>
//           </div>

//           {/* Annual */}
//           <div className="p-10 rounded-[2.5rem] bg-slate-950 text-white relative shadow-2xl flex flex-col justify-between overflow-hidden">
//             <div className="absolute top-6 right-6 bg-[#A8DF8E] text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
//               Save Nu. 1,800
//             </div>
//             <div>
//               <p className="text-sm font-black text-[#A8DF8E] uppercase tracking-widest mb-4">
//                 Best for Growth
//               </p>
//               <div className="flex items-baseline gap-2 mb-8">
//                 <span className="text-6xl font-black text-white">600</span>
//                 <span className="text-slate-400 font-bold text-xl">/mo</span>
//               </div>
//               <p className="text-slate-400 font-medium mb-8 text-balance">
//                 Commit to your business growth. Billed Nu. 7,200 annually.
//               </p>
//             </div>
//             <button className="w-full py-4 rounded-2xl bg-[#A8DF8E] text-slate-950 font-black hover:brightness-110 transition shadow-lg shadow-[#A8DF8E]/20">
//               Get Annual Deal
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Trust Footer */}
//       <footer className="w-full py-16 bg-slate-50 text-center">
//         <p className="text-slate-400 text-xs font-black tracking-widest uppercase mb-4">
//           No Hardware Required • Cloud Sync • GST Compliant
//         </p>
//         <div className="text-slate-950 font-black tracking-tighter text-xl">
//           SwiftGST Bhutan
//         </div>
//       </footer>
//     </main>
//   );
// };

// export default LandingPage;

"use client";
import React from "react";
import { useRouter } from "next/navigation";

const LandingPage = () => {
  const route = useRouter();
  return (
    <main className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-[#A8DF8E]/30">
      {/* Navigation */}
      <nav className="relative w-full max-w-6xl mx-auto px-6 py-8 flex justify-between items-center z-50">
        <div className="text-2xl font-black tracking-tighter text-slate-950 italic">
          Swift<span className="text-[#A8DF8E]">GST.</span>
        </div>
        <div className="flex gap-4 items-center">
          <a
            href="/login"
            className="text-sm font-bold text-slate-600 hover:text-slate-950 transition"
          >
            Login
          </a>
          <a
            href="/get-started"
            className="px-5 py-2 rounded-full bg-slate-950 text-white text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Hero: The "Stop the Bleeding" Headline */}
      <section className="relative w-full max-w-5xl mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-xs font-black tracking-widest text-slate-500 uppercase bg-slate-100 rounded-full border border-slate-200">
          Built for Bhutanese Businesses <span className="text-2xl">🇧🇹</span>
        </div>
        <h1 className="text-5xl md:text-[5.5rem] font-black tracking-tight text-slate-950 mb-8 leading-none">
          Managing GST shouldn&apos;t <br />
          <span className="text-[#EE4B6A]">cost this much.</span>
        </h1>
        <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
          You&apos;re either overpaying for bloated &quot;Enterprise&quot;
          software or losing hours to manual GST math. **SwiftGST is the simple
          solution.**
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/get-started"
            // className="w-full sm:w-auto px-12 py-5 rounded-2xl text-lg font-black bg-[#A8DF8E] text-slate-950 hover:shadow-[0_20px_50px_rgba(168,223,142,0.4)] transition-all transform hover:-translate-y-1"
            className="w-full md:w-md bg-gray-900 dark:bg-brand-pink text-white py-5 px-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-pink-500/10 mt-4 disabled:opacity-50 disabled:hover:scale-100"
          >
            Start Today — Free for 14 Days
          </a>
        </div>
        <p className="mt-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
          Quick setup • No payment required
        </p>
      </section>

      {/* The Pain Wall: Re-engineered for Emotional Impact */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 bg-[#F8FAFC] rounded-[4rem] border border-slate-200/60 relative overflow-hidden">
        {/* Sublte background decorative element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-60"></div>

        <div className="text-center mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Running a business shouldn&apos;t feel like <br />
            <span className="text-[#EE4B6A] italic">
              fighting the government.
            </span>
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">
            The old way is costing you more than just time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          {[
            {
              title: "The 'Invisible' Tax Leak",
              desc: "You pay GST on your sales, but lose thousands because you aren't tracking the GST you paid on purchases. That's your hard-earned profit, gone.",
              icon: "📉",
              tag: "Financial Drain",
            },
            {
              title: "The 'Item Cap' Prison",
              desc: "Other apps charge you more just because you added a 101st product or a second phone. We don't believe in punishing you for growing.",
              icon: "🔓",
              tag: "Artificial Limits",
            },
            {
              title: "The 'Friday Night' Math",
              desc: "Spending hours with a calculator and a shoebox of crumpled receipts just to file a return. You should be with your family, not a spreadsheet.",
              icon: "🕰️",
              tag: "Burnout",
            },
          ].map((pain, i) => (
            <div
              key={i}
              className="group p-10 bg-white rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="text-5xl">{pain.icon}</div>
                <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 text-slate-500 rounded-full group-hover:bg-[#EE4B6A]/10 group-hover:text-[#EE4B6A] transition-colors">
                  {pain.tag}
                </span>
              </div>
              <h4 className="text-2xl font-black mb-4 text-slate-950 leading-tight">
                {pain.title}
              </h4>
              <p className="text-slate-500 leading-relaxed text-sm font-bold opacity-80">
                {pain.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-400 font-black text-xs uppercase tracking-widest">
            Stop the bleeding. Start billing with{" "}
            <span className="text-slate-900 italic">SwiftGST.</span>
          </p>
        </div>
      </section>

      {/* The Solutions: Industry-Specific GST Painkillers */}
      <section id="solutions" className="w-full max-w-6xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black mb-4 italic">
            One System. Four Ways to Save.
          </h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
            Custom workflows for the most complex sectors in Bhutan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 1. RETAIL & SHOPS */}
          <div className="relative group p-10 rounded-[2.5rem] bg-white border-2 border-slate-100 hover:border-[#A8DF8E]/50 transition-all">
            <div className="text-xs font-black tracking-widest text-[#A8DF8E] uppercase mb-4">
              Retail & Groceries
            </div>
            <h3 className="text-3xl font-black text-slate-950 mb-6">
              Stop the Stock Bleeding.
            </h3>
            <p className="text-slate-500 mb-8 font-medium text-md leading-relaxed">
              High-speed POS for busy counters. Track every Nu. from the shelf
              to the drawer while capturing ITC on every purchase.
            </p>
            <div className="space-y-4">
              {[
                "Auto-Shopping Lists",
                "Inventory Valuation",
                "Stock level tracking",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-3 font-bold text-slate-700 text-sm"
                >
                  <span className="text-[#A8DF8E]">✔</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* 2. SERVICES & CONSTRUCTION */}
          <div className="relative group p-10 rounded-[2.5rem] bg-slate-950 text-white shadow-2xl">
            <div className="text-xs font-black tracking-widest text-[#FFAAB8] uppercase mb-4">
              Construction & Services
            </div>
            <h3 className="text-3xl font-black mb-6">
              Invoices that Save Taxes.
            </h3>
            <p className="text-slate-400 mb-8 font-medium text-md leading-relaxed">
              Professional PDF billing for contractors. Track ITC on materials
              so you only pay GST on your actual profit.
            </p>
            <div className="space-y-4">
              {[
                "Track Unpaid Balances",
                "Input Tax Credit Tracking",
                "One-Click PDF Billing",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-3 font-bold text-slate-300 text-sm"
                >
                  <span className="text-[#FFAAB8]">✔</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* 3. HOTELS & STAYS */}
          <div className="relative group p-10 rounded-[2.5rem] bg-white border-2 border-slate-100 hover:border-blue-400/50 transition-all">
            <div className="text-xs font-black tracking-widest text-blue-500 uppercase mb-4">
              Hotels & Guest Houses
            </div>
            <h3 className="text-3xl font-black text-slate-950 mb-6">
              Unified Hospitality Billing.
            </h3>
            <p className="text-slate-500 mb-8 font-medium text-md leading-relaxed">
              Manage room statuses and restaurant orders on one guest bill.
              Seamlessly handle high-volume seasonal GST filing.
            </p>
            <div className="space-y-4">
              {[
                "Merged Food & Room Bills",
                "Guest History & Sales",
                "Easy GST Filing",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-3 font-bold text-slate-700 text-sm"
                >
                  <span className="text-blue-500">✔</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* 4. RESTAURANTS & CAFES */}
          <div className="relative group p-10 rounded-[2.5rem] bg-[#FDF2F4] border-2 border-[#FFAAB8]/20 transition-all">
            <div className="text-xs font-black tracking-widest text-[#EE4B6A] uppercase mb-4">
              Cafes & Restaurants
            </div>
            <h3 className="text-3xl font-black text-slate-950 mb-6">
              Kitchen Speed, GST Accuracy.
            </h3>
            <p className="text-slate-500 mb-8 font-medium text-md leading-relaxed">
              Lightning-fast menu interface. Record every grocery purchase to
              maximize your Input Tax Credits at the end of the month.
            </p>
            <div className="space-y-4">
              {[
                "Easily update menu items",
                "Purchase Recording for ITC",
                "Fast Receipt Printing",
              ].map((f) => (
                <div
                  key={f}
                  className="flex items-center gap-3 font-bold text-slate-700 text-sm"
                >
                  <span className="text-[#EE4B6A]">✔</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing: The "GST Simplifier" Section */}
      {/* Pricing: The "Yeti-Killer" GST Section */}
      <section id="pricing" className="w-full max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-black mb-4 italic tracking-tighter">
            Professional GST tools. <br />
            <span className="text-blue-600">Zero artificial limits.</span>
          </h2>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto">
            Why pay more for &quot;item caps&quot; and &quot;device
            limits&quot;? SwiftGST gives you unlimited growth for a fraction of
            the cost.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* SERVICES - Nu. 499 */}
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col justify-between hover:border-blue-500/30 transition-all">
            <div>
              <h4 className="font-black text-blue-500 uppercase tracking-[0.2em] text-[10px] mb-2">
                Services
              </h4>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black text-slate-950">499</span>
                <span className="text-slate-400 font-bold text-sm">/mo</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-tight">
                For Freelancers & Construction
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "UNLIMITED PDF Invoices",
                  "Purchase & ITC Tracking",
                  "Track Unpaid Balances",
                  "GST-Filing Summaries",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-700"
                  >
                    <span className="text-blue-500">✔</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => route.push("/get-started")}
              className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-950 font-black text-[10px] uppercase hover:bg-slate-50 transition"
            >
              Select Service
            </button>
          </div>

          {/* POS LITE - Nu. 599 */}
          <div className="p-8 bg-white border-2 border-emerald-500 rounded-[3rem] flex flex-col justify-between relative shadow-2xl shadow-emerald-500/10 scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase">
              Most Popular
            </div>
            <div>
              <h4 className="font-black text-emerald-600 uppercase tracking-[0.2em] text-[10px] mb-2">
                POS Lite
              </h4>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black text-slate-950">599</span>
                <span className="text-slate-400 font-bold text-sm">/mo</span>
              </div>
              <p className="text-[10px] font-bold text-emerald-600 mb-6 uppercase tracking-tight italic">
                No Item Caps. No Hassle.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "UNLIMITED Items (No Caps)",
                  "Unlimited Daily Sales",
                  "Input Tax Credit (ITC) Logic",
                  "GST-Ready POS Interface",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-700"
                  >
                    <span className="text-emerald-500">✔</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => route.push("/get-started")}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-[10px] uppercase hover:brightness-110 transition shadow-lg"
            >
              Get Started
            </button>
          </div>

          {/* HOTEL - Nu. 799 */}
          <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] flex flex-col justify-between hover:border-blue-600/30 transition-all">
            <div>
              <h4 className="font-black text-blue-600 uppercase tracking-[0.2em] text-[10px] mb-2">
                Hotels
              </h4>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black text-slate-950">899</span>
                <span className="text-slate-400 font-bold text-sm">/mo</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-tight">
                Guest Houses & Boutique Stays
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Room Booking Grid",
                  "Unified Restaurant + Room Bill",
                  "ITC Tracking for Supplies",
                  "Track your expenses",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-700"
                  >
                    <span className="text-blue-600">✔</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => route.push("/get-started")}
              className="w-full py-4 rounded-2xl border-2 border-slate-100 text-slate-950 font-black text-[10px] uppercase hover:bg-slate-50 transition"
            >
              Select Hotel
            </button>
          </div>

          {/* SUPER POS - Nu. 999 */}
          <div className="p-8 bg-slate-950 text-white rounded-[2.5rem] flex flex-col justify-between shadow-2xl relative overflow-hidden group">
            <div>
              <h4 className="font-black text-[#A8DF8E] uppercase tracking-[0.2em] text-[10px] mb-2">
                Super POS
              </h4>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-black">999</span>
                <span className="text-slate-400 font-bold text-sm">/mo</span>
              </div>
              <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-tight">
                For High-Volume Retailers
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "UNLIMITED Devices (Not just 1)",
                  "Real-Time Inventory Valuation",
                  "Auto Shopping List",
                  "Advanced stock tracking",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-300"
                  >
                    <span className="text-[#A8DF8E]">✔</span> {f}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => route.push("/get-started")}
              className="w-full py-4 rounded-2xl bg-[#A8DF8E] text-slate-950 font-black text-[10px] uppercase hover:brightness-110 transition"
            >
              Go Pro
            </button>
          </div>
        </div>

        {/* Comparison Footer */}
        <div className="mt-16 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            No Hardware Contracts • Cancel Anytime
          </p>
        </div>
      </section>

      {/* Final "Zen" Hook */}
      <footer className="w-full py-24 bg-slate-50 text-center px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black mb-6 leading-tight text-slate-950">
            Stop letting your software <br /> dictate your stress.
          </h2>
          <p className="text-slate-500 font-medium mb-10 text-lg">
            Join 10+ local businesses that have simplified their GST, saved
            thousands in fees, and finally got their Friday nights back.
          </p>
          <a
            href="/get-started"
            // className="inline-block px-12 py-5 rounded-2xl text-lg font-black bg-slate-950 text-white hover:bg-slate-800 transition shadow-2xl shadow-slate-900/40"
            className="w-auto bg-gray-900 dark:bg-brand-pink text-white py-5 px-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-pink-500/10 mt-4 disabled:opacity-50 disabled:hover:scale-100"
          >
            Create Your Account — Free for 14 Days
          </a>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
