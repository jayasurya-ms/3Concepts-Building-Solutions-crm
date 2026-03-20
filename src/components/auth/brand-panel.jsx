import { motion } from "framer-motion";
import { CheckCircle2, Award, Zap, Clock } from "lucide-react";
import { useSelector } from "react-redux";

const highlights = [
  {
    icon: Award,
    title: "40+ Years Experience",
    description: "Collective industry expertise",
  },
  {
    icon: Zap,
    title: "Value Engineering",
    description: "Technical & commercial solutions",
  },
  {
    icon: CheckCircle2,
    title: "Process Oriented",
    description: "Advanced technologies & processes",
  },
  {
    icon: Clock,
    title: "Timely Delivery",
    description: "On time and within budget",
  },
];

export default function BrandPanel() {
  const companyDetails = useSelector((state) => state.company.companyDetails);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="hidden lg:flex lg:col-span-3 flex-col justify-center p-12 relative overflow-hidden text-white"
    >
      {/* Background with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 space-y-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium tracking-wider uppercase mb-4 inline-block">
            Established 2020
          </span>
          <h2 className="text-5xl font-bold leading-tight">
            {companyDetails?.company_name?.split(" ")[0] || "3Concepts"} <br />
            <span className="italic font-light tracking-tighter">
              {companyDetails?.company_name?.split(" ").slice(1).join(" ") ||
                "Building Solutions"}
            </span>
          </h2>
          <p className="text-blue-100/70 text-lg mt-4 max-w-md leading-relaxed">
            {companyDetails?.company_short === "3CBS"
              ? "Personalized service during every step of the project. We design, install, maintain and service your every operational need."
              : "Connecting design and comfort for your workspace needs."}
          </p>
        </motion.div>

        {/* Highlight Grid */}
        <div className="grid grid-cols-2 gap-6 mt-12">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default"
            >
              <div className="p-2 rounded-lg bg-primary/20">
                <item.icon size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-blue-100/50 mt-1">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="pt-8 border-t border-white/10 mt-12 flex items-center justify-between"
        >
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-white">3CBS</span>
            <span className="text-[10px] text-blue-100/40 uppercase tracking-[0.2em]">
              Collective Excellence
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-100/60 leading-tight">
              Bengaluru, Karnataka <br />
              India
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
