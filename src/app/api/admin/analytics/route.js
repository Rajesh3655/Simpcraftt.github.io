import { adminStats, marketplaceRows, supportTickets, warrantyClaims } from "@/app/data/admin";

export async function GET() {
  return Response.json({
    success: true,
    stats: adminStats,
    marketplaceClicks: marketplaceRows.reduce((total, row) => total + row.clicks, 0),
    warrantyClaims: warrantyClaims.length,
    supportTickets: supportTickets.length,
    placeholders: {
      orders: "Disabled until direct checkout launches",
      payments: "Disabled until payment gateway launches",
      revenue: "Marketplace attribution only",
    },
  });
}
