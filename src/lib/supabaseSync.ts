import { supabase } from "./supabase";
import { User, EvaluationRecord, KpiPeriod } from "@/types";
import type { CompanyConfig } from "./companyConfig";

export async function syncFromSupabase(): Promise<{
  usersCount: number;
  evaluationsCount: number;
  periodsCount: number;
}> {
  try {
    // 1. Fetch Users
    const { data: usersData, error: usersErr } = await supabase
      .from("users")
      .select("*");

    if (!usersErr && usersData && usersData.length > 0) {
      const mappedUsers: User[] = usersData.map((u: any) => ({
        manv: u.manv,
        name: u.name,
        dept: u.dept,
        title: u.title || "NHÂN VIÊN",
        password: u.password,
        role: u.role || "User",
      }));
      if (typeof window !== "undefined") {
        localStorage.setItem("tkv_kpi_users", JSON.stringify(mappedUsers));
      }
    }

    // 2. Fetch Periods
    const { data: periodsData, error: periodsErr } = await supabase
      .from("kpi_periods")
      .select("*")
      .order("created_at", { ascending: false });

    if (!periodsErr && periodsData && periodsData.length > 0) {
      const mappedPeriods: KpiPeriod[] = periodsData.map((p: any) => ({
        id: p.id,
        monthYear: p.month_year,
        name: p.name,
        isOpen: p.is_open,
        startDate: p.start_date || "2026-10-01",
        endDate: p.end_date || "2026-10-31",
      }));
      // Sắp xếp kỳ từ cao xuống thấp (10-2026, 09-2026, ...)
      mappedPeriods.sort((a, b) => {
        const [mA, yA] = (a.monthYear || "").split("-").map(Number);
        const [mB, yB] = (b.monthYear || "").split("-").map(Number);
        if (yA !== yB) return (yB || 0) - (yA || 0);
        return (mB || 0) - (mA || 0);
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("tkv_kpi_periods", JSON.stringify(mappedPeriods));
      }
    }

    // 3. Fetch Evaluations
    const { data: evalData, error: evalErr } = await supabase
      .from("evaluations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!evalErr && evalData && evalData.length > 0) {
      const mappedEvals: EvaluationRecord[] = evalData.map((e: any) => ({
        id: e.id,
        period: e.period,
        evaluationType: (e.evaluation_type as any) || "STAFF",
        evaluatorManv: e.evaluator_manv,
        evaluatorName: e.evaluator_name,
        evaluatorDept: e.evaluator_dept,
        targetManv: e.target_manv || e.evaluator_manv,
        targetName: e.target_name,
        targetDept: e.target_dept || e.evaluator_dept,
        scores: {
          q1: Number(e.q1) || 0,
          q2: Number(e.q2) || 0,
          q3: Number(e.q3) || 0,
          q4: Number(e.q4) || 0,
          q5: Number(e.q5) || 0,
          q6: Number(e.q6) || 0,
          q7: Number(e.q7) || 0,
          q8: Number(e.q8) || 0,
          q9: Number(e.q9) || 0,
          q10: Number(e.q10) || 0,
        },
        selfTotalScore: Number(e.self_total_score) || 0,
        selfClassification: e.self_classification || "Khá",
        selfFeedback: e.self_feedback || "",
        managerScore: e.manager_score !== null ? Number(e.manager_score) : null,
        managerClassification: e.manager_classification || null,
        managerFeedback: e.manager_feedback || null,
        councilScore: e.council_score !== null ? Number(e.council_score) : null,
        councilClassification: e.council_classification || null,
        councilFeedback: e.council_feedback || null,
        councilApprovedAt: e.council_approved_at || null,
        status: e.status || "SUBMITTED",
        createdAt: e.created_at || new Date().toISOString(),
        updatedAt: e.updated_at || new Date().toISOString(),
      }));
      if (typeof window !== "undefined") {
        localStorage.setItem("tkv_kpi_evaluations", JSON.stringify(mappedEvals));
      }
    }

    // 4. Fetch Company Config
    try {
      const { data: configData, error: configErr } = await supabase
        .from("company_config")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (!configErr && configData) {
        const mappedConfig: CompanyConfig = {
          companyName: configData.company_name || "CÔNG TY TNHH TM THẾ KỶ VÀNG",
          parentOrg: configData.parent_org || "",
          shortName: configData.short_name || "THẾ KỶ VÀNG",
          address: configData.address || "Tây Ninh",
          signatureLocation: configData.signature_location || "Tây Ninh",
          logoUrl: configData.logo_url || "/logo.png",
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("tkv_kpi_company_config", JSON.stringify(mappedConfig));
          window.dispatchEvent(new CustomEvent("company-config-changed", { detail: mappedConfig }));
        }
      }
    } catch (cfgErr) {
      console.error("Error fetching company_config:", cfgErr);
    }

    return {
      usersCount: usersData?.length || 0,
      evaluationsCount: evalData?.length || 0,
      periodsCount: periodsData?.length || 0,
    };
  } catch (error) {
    console.error("Error syncing from Supabase:", error);
    return { usersCount: 0, evaluationsCount: 0, periodsCount: 0 };
  }
}

export async function pushEvaluationToSupabase(e: EvaluationRecord): Promise<void> {
  try {
    await supabase.from("evaluations").upsert({
      id: e.id,
      period: e.period,
      evaluation_type: e.evaluationType || "STAFF",
      evaluator_manv: e.evaluatorManv,
      evaluator_name: e.evaluatorName,
      evaluator_dept: e.evaluatorDept,
      target_manv: e.targetManv,
      target_name: e.targetName,
      target_dept: e.targetDept,
      q1: e.scores?.q1 || 0,
      q2: e.scores?.q2 || 0,
      q3: e.scores?.q3 || 0,
      q4: e.scores?.q4 || 0,
      q5: e.scores?.q5 || 0,
      q6: e.scores?.q6 || 0,
      q7: e.scores?.q7 || 0,
      q8: e.scores?.q8 || 0,
      q9: e.scores?.q9 || 0,
      q10: e.scores?.q10 || 0,
      self_total_score: e.selfTotalScore,
      self_classification: e.selfClassification,
      self_feedback: e.selfFeedback || "",
      manager_score: e.managerScore,
      manager_classification: e.managerClassification,
      manager_feedback: e.managerFeedback,
      council_score: e.councilScore,
      council_classification: e.councilClassification,
      council_feedback: e.councilFeedback,
      council_approved_at: e.councilApprovedAt,
      status: e.status,
      created_at: e.createdAt,
      updated_at: e.updatedAt,
    });
  } catch (err) {
    console.error("Failed to push evaluation to Supabase:", err);
  }
}

export async function pushUserToSupabase(u: User): Promise<void> {
  try {
    await supabase.from("users").upsert({
      manv: u.manv,
      name: u.name,
      dept: u.dept,
      title: u.title,
      password: u.password,
      role: u.role,
    });
  } catch (err) {
    console.error("Failed to push user to Supabase:", err);
  }
}

export async function pushCompanyConfigToSupabase(cfg: CompanyConfig): Promise<void> {
  try {
    await supabase.from("company_config").upsert({
      id: "default",
      company_name: cfg.companyName,
      parent_org: cfg.parentOrg || "",
      short_name: cfg.shortName || "THẾ KỶ VÀNG",
      address: cfg.address || "",
      signature_location: cfg.signatureLocation || "",
      logo_url: cfg.logoUrl || "",
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to push company config to Supabase:", err);
  }
}
