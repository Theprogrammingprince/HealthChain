"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Shield, Heart, Globe, User, Stethoscope, Building2 } from "lucide-react";

interface TestimonialSliderProps {
    role: 'Patient' | 'Doctor' | 'Hospital';
}

const roleContent = {
    Patient: {
        icon: User,
        iconColor: "text-blue-400",
        iconBg: "bg-blue-500/20",
        iconBorder: "border-blue-500/30",
        gradientFrom: "from-blue-400",
        gradientTo: "to-cyan-400",
        mainQuote: "Your health, your data, your control.",
        highlight1: "complete ownership",
        highlight2: "instant access",
        description: "HealthChain puts you in the driver's seat of your healthcare journey. Access your complete medical history anytime, anywhere. Share records with any provider instantly. No more paperwork, no more delays—just seamless, secure healthcare at your fingertips.",
        impact: "Empowering millions of patients worldwide to take control of their health data and make informed decisions about their care.",
        features: [
            { icon: Shield, label: "Your Data, Protected", color: "indigo" },
            { icon: Heart, label: "Always Accessible", color: "blue" },
            { icon: Globe, label: "Portable Records", color: "purple" }
        ]
    },
    Doctor: {
        icon: Stethoscope,
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-500/20",
        iconBorder: "border-emerald-500/30",
        gradientFrom: "from-emerald-400",
        gradientTo: "to-teal-400",
        mainQuote: "Deliver better care with complete patient insights.",
        highlight1: "comprehensive records",
        highlight2: "real-time collaboration",
        description: "HealthChain eliminates information silos and gives you instant access to complete patient histories. Make faster, more informed decisions. Collaborate seamlessly with specialists. Focus on what matters most—providing exceptional care.",
        impact: "Transforming how healthcare professionals deliver care by providing secure, instant access to patient data across institutions.",
        features: [
            { icon: Shield, label: "HIPAA Compliant", color: "emerald" },
            { icon: Heart, label: "Better Outcomes", color: "teal" },
            { icon: Globe, label: "Cross-Facility Access", color: "green" }
        ]
    },
    Hospital: {
        icon: Building2,
        iconColor: "text-purple-400",
        iconBg: "bg-purple-500/20",
        iconBorder: "border-purple-500/30",
        gradientFrom: "from-purple-400",
        gradientTo: "to-pink-400",
        mainQuote: "Streamline operations, elevate patient care.",
        highlight1: "operational efficiency",
        highlight2: "seamless interoperability",
        description: "HealthChain revolutionizes hospital operations with blockchain-powered record management. Reduce administrative overhead, eliminate data silos, and ensure compliance effortlessly. Connect with other facilities instantly while maintaining the highest security standards.",
        impact: "Enabling healthcare institutions to operate more efficiently while delivering superior patient outcomes through unified data systems.",
        features: [
            { icon: Shield, label: "Enterprise Security", color: "purple" },
            { icon: Heart, label: "Cost Reduction", color: "pink" },
            { icon: Globe, label: "Network Integration", color: "violet" }
        ]
    }
};

const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500/20 border-indigo-500/30",
    blue: "bg-blue-500/20 border-blue-500/30",
    purple: "bg-purple-500/20 border-purple-500/30",
    emerald: "bg-emerald-500/20 border-emerald-500/30",
    teal: "bg-teal-500/20 border-teal-500/30",
    green: "bg-green-500/20 border-green-500/30",
    pink: "bg-pink-500/20 border-pink-500/30",
    violet: "bg-violet-500/20 border-violet-500/30"
};

const iconColorMap: Record<string, string> = {
    indigo: "text-indigo-400",
    blue: "text-blue-400",
    purple: "text-purple-400",
    emerald: "text-emerald-400",
    teal: "text-teal-400",
    green: "text-green-400",
    pink: "text-pink-400",
    violet: "text-violet-400"
};

export function TestimonialSlider({ role }: TestimonialSliderProps) {
    const content = roleContent[role];
    const RoleIcon = content.icon;

    return (
        <div className="relative h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12 overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 sm:top-20 sm:left-20 w-32 h-32 sm:w-64 sm:h-64 bg-indigo-500 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 sm:bottom-20 sm:right-20 w-32 h-32 sm:w-64 sm:h-64 bg-blue-500 rounded-full blur-3xl" />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={role}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-2xl w-full relative z-10"
                >
                    {/* Role Icon */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-6 sm:mb-8 flex items-center gap-3 sm:gap-4"
                    >
                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl ${content.iconBg} flex items-center justify-center border ${content.iconBorder}`}>
                            <RoleIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${content.iconColor}`} />
                        </div>
                        <div>
                            <p className="text-gray-500 text-[10px] sm:text-xs uppercase tracking-widest font-semibold">For {role}s</p>
                            <p className="text-gray-400 text-xs sm:text-sm font-medium">Powered by HealthChain</p>
                        </div>
                    </motion.div>

                    {/* Main Quote */}
                    <motion.blockquote
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        <h2 className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight" style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif" }}>
                            {content.mainQuote}
                        </h2>

                        <p className="text-gray-300 text-base sm:text-lg md:text-xl leading-relaxed font-light" style={{ fontFamily: "'Inter', 'SF Pro Text', -apple-system, system-ui, sans-serif" }}>
                            {content.description}
                        </p>

                        <div className="pt-2 sm:pt-4">
                            <p className={`text-sm sm:text-base md:text-lg font-semibold italic bg-gradient-to-r ${content.gradientFrom} ${content.gradientTo} bg-clip-text text-transparent`} style={{ fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif" }}>
                                {content.impact}
                            </p>
                        </div>
                    </motion.blockquote>

                    {/* Feature Icons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-6"
                    >
                        {content.features.map((feature, index) => {
                            const FeatureIcon = feature.icon;
                            return (
                                <div key={index} className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${colorMap[feature.color]} flex items-center justify-center border`}>
                                        <FeatureIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${iconColorMap[feature.color]}`} />
                                    </div>
                                    <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider leading-tight">
                                        {feature.label}
                                    </p>
                                </div>
                            );
                        })}
                    </motion.div>

                    {/* Attribution */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.7 }}
                        className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-700/50"
                    >
                        <p className="text-gray-500 text-xs sm:text-sm font-medium" style={{ fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
                            The future of healthcare is decentralized, secure, and patient-owned.
                        </p>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
