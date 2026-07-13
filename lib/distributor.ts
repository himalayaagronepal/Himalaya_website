import User from "../models/User";

export type DistributorValidationResult = {
  ok: boolean;
  status: number;
  message: string;
  user?: any;
};

export async function validateApprovedDistributor(sessionUser: any): Promise<DistributorValidationResult> {
  if (!sessionUser) {
    return { ok: false, status: 401, message: "Authentication required" };
  }

  if (sessionUser.role !== "distributor") {
    return {
      ok: false,
      status: 403,
      message: "Only approved distributors can place online orders. Please visit an outlet for retail purchases.",
    };
  }

  const distributor = await User.findById(sessionUser.id).lean();
  if (!distributor || distributor.isActive === false) {
    return { ok: false, status: 403, message: "Distributor account is inactive" };
  }

  if (distributor.distributorStatus !== "approved") {
    return {
      ok: false,
      status: 403,
      message: "Your distributor account is pending approval by super admin.",
    };
  }

  return { ok: true, status: 200, message: "ok", user: distributor };
}

export function availableDistributorCredit(user: any): number {
  const limit = Number(user?.creditLimitNpr || 0);
  const used = Number(user?.creditUsedNpr || 0);
  return Math.max(0, limit - used);
}

export async function releaseDistributorCreditForCancelledOrder(order: any) {
  if (!order?.distributorCreditApplied || !order?.distributorCreditAmount) return;

  await User.findByIdAndUpdate(order.user, {
    $inc: { creditUsedNpr: -Math.abs(Number(order.distributorCreditAmount || 0)) },
  });
}
