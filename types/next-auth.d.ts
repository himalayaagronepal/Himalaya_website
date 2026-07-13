import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: "user" | "admin" | "admin-employee" | "employee" | "outlet-admin" | "distributor";
      employeeRole?: "accountant" | "shopkeeper" | string;
      outletId?: string;
      outletName?: string;
      outletSlug?: string;
      permissions?: string[];
      distributorStatus?: "none" | "pending" | "approved" | "rejected";
      creditLimitNpr?: number;
      creditUsedNpr?: number;
    };
  }
  interface User {
    id?: string;
    role?: "user" | "admin" | "admin-employee" | "employee" | "outlet-admin" | "distributor";
    employeeRole?: "accountant" | "shopkeeper" | string;
    outletId?: string;
    outletName?: string;
    outletSlug?: string;
    permissions?: string[];
    distributorStatus?: "none" | "pending" | "approved" | "rejected";
    creditLimitNpr?: number;
    creditUsedNpr?: number;
  }
}