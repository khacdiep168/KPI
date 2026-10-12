"use client";

import React, { useState, useEffect } from "react";
import { User, EvaluationRecord } from "@/types";
import { getCurrentUser, canUserAccessTab, logout, getUsers } from "@/lib/storage";
import { syncFromSupabase } from "@/lib/supabaseSync";
import Navbar from "@/components/Navbar";
import EvaluationForm from "@/components/EvaluationForm";
import HistoryList from "@/components/HistoryList";
import ManagerReview from "@/components/ManagerReview";
import AdminDashboard from "@/components/AdminDashboard";
import AnnualReport from "@/components/AnnualReport";
import LoginForm from "@/components/LoginForm";
import { ShieldAlert } from "lucide-react";

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"evaluate" | "history" | "manager" | "admin" | "annual-report">("evaluate");
  const [selectedEditTarget, setSelectedEditTarget] = useState<string | undefined>(undefined);
  const [selectedEditPeriod, setSelectedEditPeriod] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsMounted(true);
    const user = getCurrentUser();
    if (user) {
      if (user.status === "INACTIVE") {
        logout();
        setCurrentUser(null);
      } else {
        setCurrentUser(user);
      }
    }
    // Sync with Supabase in background and re-verify current user status
    syncFromSupabase().then(() => {
      const refreshed = getCurrentUser();
      if (refreshed) {
        if (refreshed.status === "INACTIVE") {
          logout();
          setCurrentUser(null);
          alert("Tài khoản của bạn đã bị khóa bởi Quản trị viên.");
          return;
        }
        const userList = getUsers();
        const stillExists = userList.some(
          (u) => u.manv.trim().toUpperCase() === refreshed.manv.trim().toUpperCase()
        );
        if (!stillExists) {
          logout();
          setCurrentUser(null);
          alert("Tài khoản của bạn đã bị xóa khỏi hệ thống.");
          return;
        }
        setCurrentUser(refreshed);
      }
    }).catch(console.error);
  }, []);

  // Listen to hash changes with strict RBAC Guard
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      const validTabs = ["history", "evaluate", "manager", "admin", "annual-report"];
      if (validTabs.includes(hash)) {
        if (canUserAccessTab(hash, currentUser)) {
          setActiveTab(hash as any);
        } else {
          setActiveTab("evaluate");
          window.location.hash = "evaluate";
        }
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [currentUser]);

  // Ensure current active tab is strictly allowed for currentUser
  useEffect(() => {
    if (currentUser && !canUserAccessTab(activeTab, currentUser)) {
      setActiveTab("evaluate");
      window.location.hash = "evaluate";
    }
  }, [currentUser, activeTab]);

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
          if (!canUserAccessTab(tab, currentUser)) {
            setActiveTab("evaluate");
            window.location.hash = "evaluate";
            return;
          }
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-20 pb-28 sm:pt-24 md:pb-8">
        {activeTab === "evaluate" && (
          <EvaluationForm
            key={`${selectedEditTarget || currentUser.manv}-${selectedEditPeriod || "default"}`}
            currentUser={currentUser}
            initialTargetManv={selectedEditTarget}
            initialPeriodMonthYear={selectedEditPeriod}
            initialEditMode={Boolean(selectedEditTarget)}
            onSuccess={() => {
              setSelectedEditTarget(undefined);
              setSelectedEditPeriod(undefined);
            }}
          />
        )}

        {activeTab === "history" && (
          <HistoryList 
            currentUser={currentUser} 
            onEditEvaluation={(target, period) => {
              setSelectedEditTarget(target);
              setSelectedEditPeriod(period);
              setActiveTab("evaluate");
              window.location.hash = "evaluate";
            }}
          />
        )}

        {activeTab === "manager" && (
          canUserAccessTab("manager", currentUser) ? (
            <ManagerReview currentUser={currentUser} />
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-sm max-w-xl mx-auto my-12">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">Không có quyền truy cập</h3>
              <p className="text-xs text-slate-500 mt-1">Trang Duyệt Bộ Phận chỉ dành cho Cấp Quản Lý hoặc Ban Giám Đốc.</p>
            </div>
          )
        )}

        {activeTab === "admin" && (
          canUserAccessTab("admin", currentUser) ? (
            <AdminDashboard currentUser={currentUser} />
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-sm max-w-xl mx-auto my-12">
              <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">Không có quyền truy cập</h3>
              <p className="text-xs text-slate-500 mt-1">Trang Quản Trị & Hội Đồng chỉ dành riêng cho Ban Giám Đốc (Admin).</p>
            </div>
          )
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
