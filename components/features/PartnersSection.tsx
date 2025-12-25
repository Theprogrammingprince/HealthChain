"use client";

import React, { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { motion, AnimatePresence } from "framer-motion";
import {
    Building2, Globe2, Handshake, Users, ArrowRight,
    Stethoscope, Heart, Activity, BadgeCheck, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Types ---
type Partner = {
    id: string;
    name: string;
    type: string;
    status: "Pilot Partner" | "In Discussions";
    description: string;
    patients: string;
    icon: React.ReactNode;
    color: string;
};

// --- Data ---
const partners: Partner[] = [
    {
        id: "luth",
        name: "Lagos University Teaching Hospital",
        type: "Teaching Hospital",
        status: "Pilot Partner",
        description: "The largest teaching hospital in Nigeria, leading medical research and emergency care.",
        patients: "500K+ Annual Patients",
        icon: <Building2 className="w-8 h-8" />,
        color: "text-blue-500"
    },
    {
        id: "reddington",
        name: "Reddington Hospital",
        type: "Multi-specialty",
        status: "Pilot Partner",
        description: "Award-winning private healthcare provider specialized in cardiac and trauma care.",
        patients: "International Accreditation",
        icon: <Activity className="w-8 h-8" />,
        color: "text-red-500"
    },
    {
        id: "mayo",
        name: "Mayo Clinic",
        type: "Global Partner",
        status: "In Discussions",
        description: "World-renowned medical center exploring decentralized records for international patients.",
        patients: "Research Collaboration",
        icon: <Globe2 className="w-8 h-8" />,
        color: "text-indigo-500"
    },
    {
        id: "st_nicholas",
        name: "St. Nicholas Hospital",
        type: "Private Care",
        status: "Pilot Partner",
        description: "Leading kidney transplant and specialist center in Lagos.",
        patients: "Premium Care",
        icon: <Heart className="w-8 h-8" />,
        color: "text-emerald-500"
    },
    {
        id: "evercare",
        name: "Evercare Hospital",
        type: "Private Hospital",
        status: "In Discussions",
        description: "State-of-the-art facility delivering accessible, high-quality healthcare.",
        patients: "Smart Hospital",
        icon: <Stethoscope className="w-8 h-8" />,
        color: "text-orange-500"
    },
    {
        id: "first_cardio",
        name: "First Cardiology",
        type: "Specialist",
        status: "Pilot Partner",
        description: "Premier cardiac center dedicated to comprehensive heart health.",
        patients: "Heart Focus",
        icon: <Users className="w-8 h-8" />,
        color: "text-rose-500"
    },
    {
        id: "cedar",
        name: "Cedar Group",
        type: "Network",
        status: "In Discussions",
        description: "Integrated healthcare delivery system with strong community reach.",
        patients: "Community Health",
        icon: <Handshake className="w-8 h-8" />,
        color: "text-cyan-500"
    },
];

export function PartnersSection() {
    const [emblaRef] = useEmblaCarousel({
        loop: true,
        align: "start",
        skipSnaps: false,
        dragFree: true
    }, [
        AutoScroll({
            playOnInit: true,
            speed: 0.8, // Slow continuous scroll
            stopOnInteraction: false,
            stopOnMouseEnter: true
        })
    ]);

    const [isHovered, setIsHovered] = useState<string | null>(null);

    return (
        <section className="relative w-full py-24 px-4 overflow-hidden bg-background">
            {/* Subtle Gradient BG */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-900/10 via-background to-background pointer-events-none" />

            <div className="container relative mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-6 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                            Trusted by Leading
                            <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 relative">
                                Healthcare Providers
                                {/* Glow under text */}
                                <span className="absolute -inset-1 bg-blue-500/20 blur-2xl rounded-full -z-10 opacity-50" />
                            </span>
                        </h2>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-muted-foreground max-w-2xl"
                    >
                        Pilots starting in Nigeria – joining forces to make emergency care faster and safer.
                    </motion.p>
                </div>

                {/* Carousel */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="relative px-4 md:px-0"
                >
                    {/* Fade overlay edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />

                    <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
                        <div className="flex gap-4 md:gap-8 py-12 items-center">
                            {partners.map((partner) => (
                                <div key={partner.id} className="flex-[0_0_85%] md:flex-[0_0_40%] lg:flex-[0_0_25%] min-w-0 pl-4 relative group perspective-1000">
                                    <PartnerCard
                                        partner={partner}
                                        isHovered={isHovered === partner.id}
                                        onHover={setIsHovered}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center mt-12"
                >
                    <Button
                        size="lg"
                        className="h-14 px-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all font-semibold text-lg"
                    >
                        Become a Partner <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}

function PartnerCard({ partner, isHovered, onHover }: { partner: Partner, isHovered: boolean, onHover: (id: string | null) => void }) {
    return (
        <div
            className="relative h-40 flex items-center justify-center"
            onMouseEnter={() => onHover(partner.id)}
            onMouseLeave={() => onHover(null)}
        >
            {/* Logo Display */}
            <div className={cn(
                "p-8 w-full h-32 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm flex items-center justify-center transition-all duration-500",
                isHovered ? "opacity-0 scale-95" : "opacity-100 grayscale hover:grayscale-0"
            )}>
                <div className={cn("transition-colors duration-300", isHovered ? partner.color : "text-white/40")}>
                    {partner.icon}
                </div>
                <span className={cn("ml-3 font-semibold text-lg transition-colors duration-300", isHovered ? "text-white" : "text-white/40")}>
                    {partner.name}
                </span>
            </div>

            {/* Hover Popover Card */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, rotateX: 20, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
                        exit={{ opacity: 0, rotateX: -20, y: 10, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="absolute inset-0 z-30 w-[110%] -left-[5%]"
                        style={{ perspective: 1000 }}
                    >
                        <div className="h-full w-full p-5 rounded-2xl bg-[#0f1115] border border-blue-500/30 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex flex-col justify-between">
                            <div className="flex items-start justify-between">
                                <div className={cn("p-2 rounded-lg bg-white/5", partner.color)}>
                                    {partner.icon}
                                </div>
                                <Badge
                                    className={cn(
                                        "text-[10px] uppercase tracking-wider font-bold border-0",
                                        partner.status === "Pilot Partner"
                                            ? "bg-blue-500/20 text-blue-400"
                                            : "bg-zinc-800 text-zinc-400"
                                    )}
                                >
                                    {partner.status === "Pilot Partner" ? <BadgeCheck className="w-3 h-3 mr-1" /> : <Loader2 className="w-3 h-3 mr-1" />}
                                    {partner.status === "Pilot Partner" ? "Partner" : "Talks"}
                                </Badge>
                            </div>

                            <div>
                                <h4 className="font-bold text-white text-base leading-tight mb-1">{partner.name}</h4>
                                <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">{partner.description}</p>
                            </div>

                            <div className="w-full h-px bg-white/5 mt-2" />

                            <div className="flex items-center justify-between text-[10px] font-medium text-zinc-500">
                                <span>{partner.type}</span>
                                <span className={partner.color}>{partner.patients}</span>
                            </div>
                        </div>

                        {/* Glow effect specific to card */}
                        <div className={cn("absolute -inset-[1px] rounded-2xl -z-10 opacity-50 blur-sm transition-colors duration-500", partner.color.replace("text-", "bg-"))} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
