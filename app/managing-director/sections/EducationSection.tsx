import { educationList } from "../../../lib/data/sharma";

export default function EducationSection() {
  return (
    <section id="education" className="py-10 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h3 className="text-2xl font-bold mb-6">Education</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {educationList.map((e, i) => (
            <div key={i} className="group border-t-4 border-green-400 bg-white p-4 rounded-2xl shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-green-300 hover:shadow-[0_16px_40px_rgba(28,43,20,0.08)]">
              <div className="text-2xl font-semibold text-gray-900 transition-colors duration-300 group-hover:text-[#1C2B14]">{e.degree}</div>
              <div className="text-base text-gray-600 transition-colors duration-300 group-hover:text-gray-700">{e.field}</div>
              <div className="mt-2 text-base text-gray-500 transition-colors duration-300 group-hover:text-gray-600">{e.institution} • {e.year}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
