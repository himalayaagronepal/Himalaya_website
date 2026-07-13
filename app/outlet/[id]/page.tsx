import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Users } from "lucide-react";
import connectToDatabase from "../../../lib/mongodb";
import Outlet from "../../../models/Outlet";
import Employee from "../../../models/Employee";
import OutletAdmin from "../../../models/OutletAdmin";
import { serialize, serializeMany } from "../../../lib/serialize";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/auth";

async function fetchData(id: string) {
  await connectToDatabase();
  const outlet = await Outlet.findById(id).lean();
  if (!outlet) return null;
  const employees = await Employee.find({ outlet: id }).limit(6).lean();
  const admins = await OutletAdmin.find({ outlet: id }).select("username name").limit(2).lean();
  return { outlet: serialize(outlet), employees: serializeMany(employees as any[]), admins: serializeMany(admins as any[]) };
}

function extractGoogleMapsSrc(address?: string) {
  if (!address) return null;
  const srcMatch = address.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*><\/iframe>/i);
  if (srcMatch?.[1]) return srcMatch[1];
  const openTagMatch = address.match(/<iframe[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (openTagMatch?.[1]) return openTagMatch[1];
  return null;
}

export default async function OutletPage({ params }: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const resolved = params instanceof Promise ? await params : params;
  const { id } = resolved;

  const data = await fetchData(id);
  if (!data) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Outlet Not Found</h1>
          <p className="text-slate-600 mb-6">We couldn't find the outlet you're looking for.</p>
          <Link href="/outlet" className="inline-flex items-center px-6 py-3 rounded-lg bg-[#0891b2] text-white font-semibold hover:bg-[#0b78be] transition-colors">
            Back to Outlets
          </Link>
        </div>
      </main>
    );
  }

  const session = (await getServerSession(authOptions as any)) as any;
  const canEdit = session && session.user && (session.user.role === "admin" || (session.user.role === "outlet-admin" && session.user.outletId === id));

  const { outlet, employees, admins } = data;

  const mapSrc = extractGoogleMapsSrc(outlet.address) || `https://www.google.com/maps?q=${encodeURIComponent(outlet.address || outlet.name || "")}&output=embed`;
  const showAddressText = !extractGoogleMapsSrc(outlet.address) && !!outlet.address;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header with Hero Image */}
      <div className="relative h-56 sm:h-80 lg:h-96 bg-slate-200 overflow-hidden">
        {outlet.profileImage ? (
          <Image
            src={outlet.profileImage}
            alt={outlet.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0891b2] to-[#059669] flex items-center justify-center">
            <div className="text-6xl text-white opacity-20">🏪</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-6 sm:mb-8">
          <Link href="/outlet" className="hover:text-[#0891b2] transition-colors">Outlets</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{outlet.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 min-w-0">
            {/* Title & Description */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-slate-900 mb-3 break-words">{outlet.name}</h1>
                  {outlet.description && (
                    <p className="text-base lg:text-lg text-slate-600 leading-relaxed">{outlet.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {outlet.contactPhone && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-[#0891b2]" />
                    <span className="text-sm font-medium text-slate-500">Phone</span>
                  </div>
                  <a href={`tel:${outlet.contactPhone}`} className="text-lg font-semibold text-slate-900 hover:text-[#0891b2] transition-colors">
                    {outlet.contactPhone}
                  </a>
                </div>
              )}
              {outlet.contactEmail && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-[#0891b2]" />
                    <span className="text-sm font-medium text-slate-500">Email</span>
                  </div>
                  <a href={`mailto:${outlet.contactEmail}`} className="text-lg font-semibold text-slate-900 hover:text-[#0891b2] transition-colors break-all">
                    {outlet.contactEmail}
                  </a>
                </div>
              )}
            </div>

            {/* Address */}
            {showAddressText && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-[#0891b2]" />
                  <h2 className="text-xl font-bold text-slate-900">Address</h2>
                </div>
                <p className="text-slate-700 leading-relaxed">{outlet.address}</p>
              </div>
            )}

            {/* Location Map */}
            {outlet.address && (
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="h-56 sm:h-72 lg:h-80 w-full">
                  <iframe 
                    src={mapSrc} 
                    width="100%" 
                    height="100%" 
                    loading="lazy"
                    className="border-0"
                    title="Outlet Location Map"
                  />
                </div>
              </div>
            )}

            {/* Gallery */}
            {Array.isArray(outlet.galleryImages) && outlet.galleryImages.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {outlet.galleryImages.map((src: string, i: number) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group cursor-pointer">
                      <Image
                        src={src}
                        alt={`Gallery ${i + 1}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staff Section */}
            {employees && employees.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-[#0891b2]" />
                  <h2 className="text-2xl font-bold text-slate-900">Our Team</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {employees.map((emp: any) => (
                    <div key={emp._id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                      {emp.profileImage && (
                        <Image
                          src={emp.profileImage}
                          alt={emp.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{emp.name}</p>
                        {emp.designation && (
                          <p className="text-sm text-slate-600 truncate">{emp.designation}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Quick Actions */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/shop"
                    className="block w-full text-center px-4 py-3 rounded-lg bg-[#0891b2] text-white font-semibold hover:bg-[#0b78be] transition-colors"
                  >
                    Shop Products
                  </Link>
                  {outlet.contactPhone && (
                    <a
                      href={`tel:${outlet.contactPhone}`}
                      className="block w-full text-center px-4 py-3 rounded-lg border-2 border-[#0891b2] text-[#0891b2] font-semibold hover:bg-[#0891b2] hover:text-white transition-colors"
                    >
                      Call Now
                    </a>
                  )}
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-[#0891b2]" />
                  <h3 className="font-bold text-slate-900">Hours</h3>
                </div>
                <p className="text-sm text-slate-600">Monday - Sunday</p>
                <p className="text-sm font-semibold text-slate-900">9:00 AM - 6:00 PM</p>
              </div>

              {/* Edit Link for Admins */}
              {canEdit && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                  <Link
                    href={`/admin/outlet-${outlet.slug}/settings`}
                    className="block w-full text-center px-4 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    Edit Outlet
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
