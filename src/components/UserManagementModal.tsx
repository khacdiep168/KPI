"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, Role } from "@/types";
import { 
  getUsers, 
  updateUser, 
  deleteUser, 
  resetUserPasswordToDefault, 
  resetUserPasswordToDefaultAsync,
  toggleUserStatus, 
  getDepartments,
  getManagedDepartments,
  canUserManageAll
} from "@/lib/storage";
import { 
  Users, 
  Search, 
  UserPlus, 
  Edit, 
  KeyRound, 
  Lock, 
  Unlock, 
  Trash2, 
  Check, 
  AlertCircle, 
  FileSpreadsheet, 
  X,
  ShieldCheck,
  Briefcase,
  UserCheck
} from "lucide-react";
import * as XLSX from "xlsx";
import AddEmployeeModal from "./AddEmployeeModal";

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onDataChanged?: () => void;
}

export default function UserManagementModal({
  isOpen,
  onClose,
  currentUser,
  onDataChanged,
}: UserManagementModalProps) {
  const [mounted, setMounted] = useState(false);
  const [userList, setUserList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  
  // Modals inside
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetConfirmUser, setResetConfirmUser] = useState<User | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editRole, setEditRole] = useState<Role>("User");

  // Notification message
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const isAdmin = currentUser.role === "Admin";
  const managedScope = getManagedDepartments(currentUser);
  const allDepts = getDepartments();
  const permittedDepts = managedScope === "ALL" ? allDepts : managedScope;

  const loadUsers = () => {
    const list = getUsers();
    setUserList(list);
  };

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      loadUsers();
      setSearchQuery("");
      setDeptFilter("ALL");
      setStatusFilter("ALL");
      setNotification(null);
    }
  }, [isOpen]);

  if (!isOpen || !mounted || typeof document === "undefined") {
    return null;
  }

  // Filter accessible users based on permissions
  const accessibleUsers = userList.filter((u) => {
    if (isAdmin) return true;
    if (managedScope === "ALL") return true;
    const scopeDepts = managedScope.map((d) => d.trim().toUpperCase());
    return scopeDepts.includes((u.dept || "").trim().toUpperCase());
  });

  // Filter based on search & dropdowns
  const displayedUsers = accessibleUsers.filter((u) => {
    if (deptFilter !== "ALL" && (u.dept || "").trim().toUpperCase() !== deptFilter.toUpperCase()) {
      return false;
    }
    if (statusFilter !== "ALL") {
      const isInactive = u.status === "INACTIVE";
      if (statusFilter === "ACTIVE" && isInactive) return false;
      if (statusFilter === "INACTIVE" && !isInactive) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (u.name || "").toLowerCase().includes(q);
      const matchManv = (u.manv || "").toLowerCase().includes(q);
      const matchTitle = (u.title || "").toLowerCase().includes(q);
      if (!matchName && !matchManv && !matchTitle) return false;
    }
    return true;
  });

  const activeCount = accessibleUsers.filter((u) => u.status !== "INACTIVE").length;
  const inactiveCount = accessibleUsers.filter((u) => u.status === "INACTIVE").length;

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditDept(user.dept);
    setEditTitle(user.title || "NHÂN VIÊN");
    setEditRole(user.role);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      updateUser(editingUser.manv, {
        name: editName.trim(),
        dept: editDept.trim(),
        title: editTitle.trim(),
        role: editRole,
      });
      loadUsers();
      if (onDataChanged) onDataChanged();
      setEditingUser(null);
      showToast("success", `Cập nhật thông tin nhân viên ${editName} (${editingUser.manv}) thành công!`);
    } catch (err: any) {
      showToast("error", err.message || "Lỗi khi cập nhật nhân viên");
    }
  };

  const handleConfirmResetPassword = async () => {
    if (!resetConfirmUser) return;
    try {
      const res = await resetUserPasswordToDefaultAsync(
        resetConfirmUser.manv,
        currentUser.manv
      );
      if (!res.success) {
        showToast("error", res.message);
        return;
      }
      loadUsers();
      showToast("success", `Đã đặt lại mật khẩu cho ${resetConfirmUser.name} (${resetConfirmUser.manv}) về "123"!`);
      setResetConfirmUser(null);
    } catch (err: any) {
      showToast("error", err.message || "Lỗi khi đặt lại mật khẩu");
    }
  };

  const handleToggleStatus = (user: User) => {
    if (user.manv.trim().toUpperCase() === currentUser.manv.trim().toUpperCase()) {
      showToast("error", "Bạn không thể tự khóa tài khoản của chính mình!");
      return;
    }
    try {
      const updated = toggleUserStatus(user.manv);
      loadUsers();
      if (onDataChanged) onDataChanged();
      const st = updated?.status === "INACTIVE" ? "Đã khóa" : "Đã mở khóa";
      showToast("success", `${st} tài khoản ${user.name} (${user.manv}) thành công!`);
    } catch (err: any) {
      showToast("error", err.message || "Lỗi khi cập nhật trạng thái");
    }
  };

  const handleDeleteUser = () => {
    if (!deleteConfirmUser) return;
    if (deleteConfirmUser.manv.trim().toUpperCase() === currentUser.manv.trim().toUpperCase()) {
      showToast("error", "Bạn không thể xóa tài khoản của chính mình!");
      return;
    }
    try {
      deleteUser(deleteConfirmUser.manv);
      loadUsers();
      if (onDataChanged) onDataChanged();
      showToast("success", `Đã xóa nhân viên ${deleteConfirmUser.name} (${deleteConfirmUser.manv}) khỏi hệ thống!`);
      setDeleteConfirmUser(null);
    } catch (err: any) {
      showToast("error", err.message || "Lỗi khi xóa nhân viên");
    }
  };

  const handleExportUsersExcel = () => {
    const aoa: any[][] = [
      ["DANH SÁCH CÁN BỘ CÔNG NHÂN VIÊN HỆ THỐNG KPI"],
      [`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`],
      [],
      ["STT", "Mã Số NV", "Họ Và Tên", "Phòng Ban / Phân Xưởng", "Chức Vụ", "Quyền Hạn", "Trạng Thái"],
    ];

    displayedUsers.forEach((u, i) => {
      aoa.push([
        i + 1,
        u.manv,
        u.name,
        u.dept,
        u.title || "NHÂN VIÊN",
        u.role === "Admin" ? "Quản trị viên (Admin)" : u.role === "Manager" ? "Quản lý (Manager)" : "Nhân viên (User)",
        u.status === "INACTIVE" ? "Đã nghỉ việc / Khóa" : "Đang làm việc",
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 28 },
      { wch: 25 },
      { wch: 22 },
      { wch: 24 },
      { wch: 20 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Danh_Sach_Nhan_Su");
    const dStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Danh_Sach_Nhan_Su_${dStr}.xlsx`);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Quản Lý Nhân Sự & Danh Sách Nhân Viên
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {displayedUsers.length} nhân sự
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Xem danh sách, phân quyền, đặt lại mật khẩu về "123" và cập nhật thông tin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Notification Alert Banner */}
        {notification && (
          <div
            className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between transition-all ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200"
                : "bg-rose-50 text-rose-800 border-b border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 text-xs ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter and Action Bar */}
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm họ tên, MANV, chức vụ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Tất cả bộ phận ({accessibleUsers.length})</option>
              {permittedDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Mọi trạng thái ({accessibleUsers.length})</option>
              <option value="ACTIVE">Đang làm việc ({activeCount})</option>
              <option value="INACTIVE">Đã khóa / Nghỉ việc ({inactiveCount})</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportUsersExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer active:scale-95"
              title="Xuất danh sách nhân viên ra Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Nhân Viên</span>
            </button>
          </div>
        </div>

        {/* Content Body: User List Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          {displayedUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-600 text-sm">Không tìm thấy nhân viên phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc phòng ban</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 text-slate-700 font-bold uppercase text-[11px] border-b border-slate-200">
                    <th className="p-3 w-12 text-center">STT</th>
                    <th className="p-3">Mã NV</th>
                    <th className="p-3">Họ Và Tên</th>
                    <th className="p-3">Phòng Ban / Bộ Phận</th>
                    <th className="p-3">Chức Vụ</th>
                    <th className="p-3 text-center">Vai Trò</th>
                    <th className="p-3 text-center">Trạng Thái</th>
                    <th className="p-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedUsers.map((u, idx) => {
                    const isInactive = u.status === "INACTIVE";
                    const isCurrent = u.manv.trim().toUpperCase() === currentUser.manv.trim().toUpperCase();

                    return (
                      <tr
                        key={u.manv}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isInactive ? "bg-slate-50/50 text-slate-400" : ""
                        }`}
                      >
                        <td className="p-3 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {u.manv}
                          {isCurrent && (
                            <span className="ml-1 text-[10px] text-blue-600 font-bold">(Bạn)</span>
                          )}
                        </td>
                        <td className="p-3 font-extrabold text-slate-900 uppercase">
                          {u.name}
                        </td>
                        <td className="p-3 font-medium text-slate-600">
                          {u.dept}
                        </td>
                        <td className="p-3 text-slate-600">
                          {u.title || "NHÂN VIÊN"}
                        </td>
                        <td className="p-3 text-center">
                          {u.role === "Admin" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                              <ShieldCheck className="w-3 h-3 text-purple-600" />
                              Admin
                            </span>
                          ) : u.role === "Manager" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                              <Briefcase className="w-3 h-3 text-blue-600" />
                              Quản Lý
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <UserCheck className="w-3 h-3 text-slate-500" />
                              Nhân Viên
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {isInactive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              <Lock className="w-3 h-3 text-rose-500" />
                              Đã Khóa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              <Unlock className="w-3 h-3 text-emerald-500" />
                              Hoạt Động
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Nút Sửa */}
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors"
                              title="Chỉnh sửa thông tin nhân viên"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Nút Reset Mật Khẩu */}
                            <button
                              type="button"
                              onClick={() => setResetConfirmUser(u)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 transition-colors"
                              title="Đặt lại mật khẩu về mặc định (123)"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {/* Nút Khóa / Mở Khóa */}
                            {!isCurrent && (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(u)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isInactive
                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700"
                                }`}
                                title={isInactive ? "Mở khóa tài khoản" : "Khóa tài khoản nhân viên"}
                              >
                                {isInactive ? (
                                  <Unlock className="w-3.5 h-3.5" />
                                ) : (
                                  <Lock className="w-3.5 h-3.5" />
                                )}
                              </button>
                            )}

                            {/* Nút Xóa (chỉ Admin) */}
                            {isAdmin && !isCurrent && (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmUser(u)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 transition-colors"
                                title="Xóa nhân viên khỏi hệ thống"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>
            Tài khoản bị khóa sẽ không thể đăng nhập và không hiển thị trong danh sách người được đánh giá.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Edit User Modal Dialog */}
      {editingUser && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Sửa Thông Tin: {editingUser.name} ({editingUser.manv})
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Họ Và Tên
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-bold uppercase text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Bộ Phận / Phòng Ban
                </label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  {allDepts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Chức Vụ
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 uppercase text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Chỉ Admin mới được đổi Role thành Admin */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Vai Trò / Quyền Hạn
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  disabled={!isAdmin && editingUser.role === "Admin"}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="User">Nhân Viên (User)</option>
                  <option value="Manager">Quản Lý Bộ Phận (Manager)</option>
                  {isAdmin && <option value="Admin">Hội Đồng / Quản Trị Viên (Admin)</option>}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition-colors"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Confirmation Dialog */}
      {resetConfirmUser && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Đặt Lại Mật Khẩu?
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Bạn có chắc chắn muốn đặt lại mật khẩu của nhân viên{" "}
              <span className="font-bold text-slate-900 uppercase">{resetConfirmUser.name}</span> ({resetConfirmUser.manv}) về mật khẩu mặc định là:
            </p>
            <div className="my-3 py-2 px-3 bg-amber-50 rounded-xl border border-amber-200 font-mono font-bold text-amber-800 text-sm">
              123
            </div>
            <p className="text-[11px] text-slate-400">
              Nhân viên có thể tự đổi lại mật khẩu sau khi đăng nhập.
            </p>
            <div className="flex items-center justify-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setResetConfirmUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmResetPassword}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-colors"
              >
                Xác Nhận Đặt Lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Xác Nhận Xóa Nhân Viên?
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Bạn có chắc chắn muốn xóa tài khoản nhân viên{" "}
              <span className="font-bold text-rose-600 uppercase">{deleteConfirmUser.name}</span> ({deleteConfirmUser.manv}) khỏi hệ thống?
            </p>
            <p className="text-[11px] text-rose-500 font-semibold mt-1">
              Hành động này không thể hoàn tác!
            </p>
            <div className="flex items-center justify-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-colors"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nested Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadUsers();
          if (onDataChanged) onDataChanged();
          showToast("success", "Đã thêm nhân viên mới thành công!");
        }}
        defaultDept={currentUser.dept}
      />
    </div>,
    document.body
  );
}
