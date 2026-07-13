import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/auth";
import { hasPermission } from "../../../lib/permissions";
import AdminContactClient from "../../components/admin/AdminContactClient";

export const metadata = { title: "Admin – Contact" };

export default async function AdminContactPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "contact")) {
    return <div className="p-12">Unauthorized</div>;
  }
  return (
    <main className="pb-16">
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <AdminContactClient />
      </div>
    </main>
  );
}
