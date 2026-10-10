export interface CompanyConfig {
  companyName: string;
  parentOrg?: string;
  shortName: string;
  address: string;
  signatureLocation: string;
  logoUrl?: string;
}

const STORAGE_KEY_COMPANY = "tkv_kpi_company_config";

export const DEFAULT_COMPANY_CONFIG: CompanyConfig = {
  companyName: "CÔNG TY TNHH TM THẾ KỶ VÀNG",
  parentOrg: "",
  shortName: "THẾ KỶ VÀNG",
  address: "Quảng Ninh",
  signatureLocation: "Quảng Ninh",
  logoUrl: "",
};

export function getCompanyConfig(): CompanyConfig {
  if (typeof window === "undefined") return DEFAULT_COMPANY_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPANY);
    if (!raw) return DEFAULT_COMPANY_CONFIG;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_COMPANY_CONFIG, ...parsed };
  } catch {
    return DEFAULT_COMPANY_CONFIG;
  }
}

export function saveCompanyConfig(config: Partial<CompanyConfig>): CompanyConfig {
  if (typeof window === "undefined") return DEFAULT_COMPANY_CONFIG;
  try {
    const current = getCompanyConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(updated));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("company-config-changed", { detail: updated }));
    }
    return updated;
  } catch (err) {
    console.error("Failed to save company config:", err);
    return DEFAULT_COMPANY_CONFIG;
  }
}
