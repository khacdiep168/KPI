"use client";

import React, { useState, useEffect } from "react";
import { User, EvaluationRecord } from "@/types";
import { getCurrentUser } from "@/lib/storage";
import { syncFromSupabase } from "@/lib/supabaseSync";
import Navbar from "@/components/Navbar";
import EvaluationForm from "@/components/EvaluationForm";
import HistoryList from "@/components/HistoryList";
import ManagerReview from "@/components/ManagerReview";
import AdminDashboard from "@/components/AdminDashboard";
import AnnualReport from "@/components/AnnualReport";
import LoginForm from "@/components/LoginForm";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"evaluate" | "history" | "manager" | "admin" | "annual-report">("evaluate");
  const [selectedEditTarget, setSelectedEditTarget] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    // Sync with Supabase in background
    syncFromSupabase().catch(console.error);
  }, []);

  // Listen to hash changes if user navigated via modal buttons
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "history" || hash === "evaluate" || hash === "manager" || hash === "admin" || hash === "annual-report") {
        setActiveTab(hash as any);
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-300">Đang khởi tạo TKV KPI...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login
  if (!currentUser) {
    return <LoginForm onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== "evaluate") {
            setSelectedEditTarget(undefined);
          }
          window.location.hash = tab;
        }}
        onUserSwitch={(u) => {
          setCurrentUser(u);
          setSelectedEditTarget(undefined);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-8">
        {activeTab === "evaluate" && (
          <EvaluationForm
            key={selectedEditTarget || currentUser.manv}
            currentUser={currentUser}
            initialTargetManv={selectedEditTarget}
            onSuccess={() => {
              // Could trigger notification or auto-switch
            }}
          />
        )}

        {activeTab === "history" && (
          <HistoryList 
            currentUser={currentUser} 
            onEditEvaluation={(target) => {
              setSelectedEditTarget(target);
              setActiveTab("evaluate");
              window.location.hash = "evaluate";
            }}
          />
        )}

        {activeTab === "manager" && (
          <ManagerReview currentUser={currentUser} />
        )}

        {activeTab === "admin" && (
          <AdminDashboard currentUser={currentUser} />
        )}

        {activeTab === "annual-report" && (
          <AnnualReport currentUser={currentUser} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">TKV KPI Platform</span>
            <span>•</span>
            <span>Quy chế đánh giá hiệu quả lao động 2026</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Phiên bản 2.0</span>
            <span>•</span>
            <span className="text-blue-600 font-medium">Bảo mật nội bộ</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
