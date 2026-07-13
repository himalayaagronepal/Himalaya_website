import React from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export type TeamMember = {
  name: string;
  role: string;
  image: string;
  phone: string;
  email: string;
  address: string;
};

type TeamMemberCardProps = {
  member: TeamMember;
};

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <article
      className="group relative overflow-hidden rounded-3xl bg-white shadow-[0_16px_34px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_46px_rgba(15,23,42,0.12)] focus-within:-translate-y-1 focus-within:shadow-[0_22px_46px_rgba(15,23,42,0.12)] focus-within:ring-2 focus-within:ring-[#0d837f] focus-within:ring-offset-2"
      tabIndex={0}
      aria-label={`${member.name}, ${member.role}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
        <img
          src={member.image}
          alt={`${member.name} portrait`}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-focus-within:scale-105 group-hover:brightness-90 group-focus-within:brightness-90"
        />
      </div>

      <div className="relative z-10 border-t border-slate-100 bg-white p-5 sm:p-4 text-center transition-opacity duration-300 group-hover:opacity-0 group-focus-within:opacity-0">
        <h3 className="text-2xl sm:text-xl font-bold text-slate-800">{member.name}</h3>
        <p className="text-lg sm:text-base font-medium text-slate-500">{member.role}</p>
      </div>

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-2 bg-linear-to-t from-slate-900/80 via-slate-900/60 to-transparent p-5 sm:p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
        <p className="text-lg sm:text-base font-bold uppercase tracking-[0.2em] text-white">Contact</p>
        <div className="mt-2 flex flex-col items-start gap-2 text-left">
          <div className="flex items-center gap-2 text-base sm:text-sm font-semibold">
            <Phone className="h-5 w-5 text-white" />
            <span>{member.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-base sm:text-sm">
            <Mail className="h-5 w-5 text-white" />
            <span>{member.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm sm:text-xs text-white/80">
            <MapPin className="h-4 w-4 text-white/80" />
            <span>{member.address}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
