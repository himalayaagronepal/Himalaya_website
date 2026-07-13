import { patronages } from "../../../lib/data/sharma";

export default function PatronagesSection() {
  return (
    <section id="patronages" className="py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h3 className="text-2xl font-bold mb-6">Patronages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patronages.map((p, i) => (
            <div key={i} className="group bg-white p-4 rounded-2xl shadow-sm border-l-4 border-amber-400 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-amber-300 hover:shadow-[0_16px_40px_rgba(120,84,17,0.08)]">
              <div className="text-lg font-semibold text-gray-900 transition-colors duration-300 group-hover:text-[#7c5a12]">{p.title}</div>
              <div className="text-base text-gray-600 transition-colors duration-300 group-hover:text-gray-700">{p.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
