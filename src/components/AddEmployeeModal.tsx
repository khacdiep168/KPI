"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { addUser, getDepartments } from "@/lib/storage";
import { Role } from "@/types";
import { UserPlus, Check, AlertCircle } from "lucide-react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultDept?: string;
}

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  defaultDept,
}: AddEmployeeModalProps) {
  const [mounted, setMounted] = useState(false);
  const [allDepartments, setAllDepartments] = useState<string[]>([]);
  const [newManv, setNewManv] = useState("");
  const [newName, setNewName] = useState("");
  const [newDept, setNewDept] = useState("VẬN TẢI");
  const [newTitle, setNewTitle] = useState("NHÂN VIÊN");
  const [newRole, setNewRole] = useState<Role>("User");
  const [newPassword, setNewPassword] = useState("123");
  const [addEmpError, setAddEmpError] = useState("");
  const [addEmpSuccess, setAddEmpSuccess] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const depts = getDepartments();
      setAllDepartments(depts);
      if (defaultDept && depts.includes(defaultDept)) {
        setNewDept(defaultDept);
      } else if (depts.length > 0) {
        setNewDept(depts[0]);
      }
      setNewManv("");
      setNewName("");
      setNewTitle("NHÂN VIÊN");
      setNewRole("User");
      setNewPassword("123");
      setAddEmpError("");
      setAddEmpSuccess("");
    }
  }, [isOpen, defaultDept]);

  if (!isOpen || !mounted || typeof document === "undefined") {
    return null;
  }

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    setAddEmpError("");
    setAddEmpSuccess("");

    if (!newManv.trim() || !newName.trim()) {
      setAddEmpError("Vui lòng nhập đầy đủ Mã nhân viên và Họ tên.");
      return;
    }

    try {
      const created = addUser({
        manv: newManv.trim().toUpperCase(),
        name: newName.trim().toUpperCase(),
        dept: newDept.trim(),
        title: newTitle.trim(),
        password: newPassword.trim(),
        role: newRole,
      });

      setAddEmpSuccess(`Thêm nhân viên ${created.name} (${created.manv}) thành công!`);
      setNewManv("");
      setNewName("");
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setAddEmpSuccess("");
        onClose();
      }, 1200);
    } catch (err: any) {
      setAddEmpError(err.message || "Lỗi khi thêm nhân viên.");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Thêm Nhân Viên Mới
              </h3>
              <p className="text-xs text-slate-500">
                Tạo tài khoản và phân quyền nhân sự
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {addEmpError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{addEmpError}</span>
          </div>
        )}

        {addEmpSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{addEmpSuccess}</span>
          </div>
        )}

        <form onSubmit={handleAddEmployee} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Mã Số Nhân Viên (MANV) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: TKV45, TKV46..."
              value={newManv}
              onChange={(e) => setNewManv(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono uppercase text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Họ Và Tên <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Ví dụ: NGUYỄN VĂN AN"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 uppercase text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Bộ Phận / Phòng Ban <span className="text-rose-500">*</span>
            </label>
            <select
              value={newDept}
              onChange={(e) => setNewDept(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              {allDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
              {!allDepartments.includes("HÀNH CHÍNH") && (
                <option value="HÀNH CHÍNH">HÀNH CHÍNH</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Chức Vụ
              </label>
              <select
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="NHÂN VIÊN">NHÂN VIÊN</option>
                <option value="QUẢN LÝ">QUẢN LÝ</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Quyền Hạn (Role)
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as Role)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="User">User (Nhân viên)</option>
                <option value="Manager">Manager (Quản lý)</option>
                <option value="Admin">Admin (Quản trị)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Mật Khẩu Ban Đầu
            </label>
            <input
              type="text"
              placeholder="Mặc định: 123"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Nhân viên có thể đổi mật khẩu sau khi đăng nhập vào hệ thống.
            </p>
          </div>

          <div className="pt-3 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-md shadow-emerald-600/20"
            >
              Lưu Nhân Viên
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
