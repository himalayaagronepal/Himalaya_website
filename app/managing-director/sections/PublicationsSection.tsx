import { publications } from "../../../lib/data/sharma";

export default function PublicationsSection() {
  return (
    <section id="publications" className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h3 className="text-2xl font-bold mb-6">Publications</h3>
        <div className="space-y-4">
          {publications.map((p, i) => (
            <div key={i} className="group border-l-4 border-green-400 bg-white p-4 rounded-2xl shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-green-300 hover:shadow-[0_16px_40px_rgba(28,43,20,0.08)]">
              <div className="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-[#1C2B14]">{p.title}</div>
              <div className="text-base text-gray-600 transition-colors duration-300 group-hover:text-gray-700">{p.venue} {p.year ? `• ${p.year}` : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
