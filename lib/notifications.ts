export async function notifyOrderStatusChange(order: any) {
  // Lightweight, environment-driven notification helper.
  // - If ORDER_STATUS_WEBHOOK is set, POST payload
  // - If SMTP_* envs are set we could send email (placeholder)
  try {
    const payload = {
      id: String(order._id),
      user: order.user,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      items: order.items,
      updatedAt: order.updatedAt || new Date().toISOString(),
    };

    if (process.env.ORDER_STATUS_WEBHOOK && typeof globalThis.fetch === "function") {
      // best-effort; do not block caller on webhook failure
      globalThis.fetch(process.env.ORDER_STATUS_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "order.status_changed", data: payload }),
      }).catch((err: any) => console.warn("webhook failed", err));
    } else if (process.env.ORDER_STATUS_WEBHOOK) {
      console.warn("ORDER_STATUS_WEBHOOK is set but global fetch is not available");
    }

    // Email: placeholder implementation (integrate SendGrid / SMTP in prod)
    if (process.env.NOTIFICATIONS_EMAIL_FROM && (order.user?.email || order.user?._doc?.email)) {
      // In production, send email via transactional provider. Here we log for visibility.
      console.info(`Notify email to ${order.user?.email || order.user?._doc?.email}: status=${order.orderStatus}`);
    }

    return true;
  } catch (err) {
    console.warn("notifyOrderStatusChange error", err);
    return false;
  }
}

export default { notifyOrderStatusChange };