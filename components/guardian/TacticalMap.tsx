"use client";

import { useState } from "react";
import { motion } from "framer-motion";
// Add missing import for X
import { MapPin, Navigation, Building2, Zap, Radio, X } from "lucide-react";

// ... (Interface and MOCK_LOCATIONS remain unchanged)
interface Location {
    id: string;
    type: "patient" | "guardian" | "clinic-partner" | "clinic-standard";
    x: number; // percentage 0-100
    y: number; // percentage 0-100
    name: string;
    distance?: string;
    address?: string;
}

const MOCK_LOCATIONS: Location[] = [
    { id: "p1", type: "patient", x: 50, y: 50, name: "Kenzy S. (Patient)", address: "Trauma Wing B, St. Mary's" },
    { id: "g1", type: "guardian", x: 80, y: 80, name: "You (Guardian)", distance: "2.4 km" },
    { id: "c1", type: "clinic-partner", x: 30, y: 40, name: "HealthChain Prime Center", distance: "1.2 km", address: "124 Innovation Blvd" },
    { id: "c2", type: "clinic-standard", x: 60, y: 20, name: "City General", distance: "3.1 km", address: "88 Old York Rd" },
    { id: "c3", type: "clinic-partner", x: 20, y: 70, name: "Rapid Response Unit", distance: "0.8 km", address: "45 Emergency Way" },
    { id: "c4", type: "clinic-standard", x: 85, y: 45, name: "Westside Clinic", distance: "4.5 km", address: "909 West Ave" },
];

export function TacticalMap({ isActive }: { isActive: boolean }) {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    return (
        <div className="relative w-full h-[400px] lg:h-full min-h-[400px] bg-[#050505] overflow-hidden rounded-3xl border border-white/10 group">
            {/* Grid Background */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    transform: 'perspective(1000px) rotateX(20deg) scale(1.2)'
                }}
            />

            {/* Scanning Effect (Only Active) */}
            {isActive && (
                <motion.div
                    animate={{ top: ["0%", "100%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.5)] z-0"
                />
            )}

            {/* Map Plotting Area */}
            <div className="absolute inset-0 p-8 transform-gpu" style={{ transform: 'perspective(1000px) rotateX(10deg)' }}>
                {MOCK_LOCATIONS.map((loc) => (
                    <MapMarker
                        key={loc.id}
                        location={loc}
                        isActive={isActive}
                        onClick={() => setSelectedLocation(loc)}
                    />
                ))}
            </div>

            {/* Details Overlay Panel */}
            {selectedLocation && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 p-4 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <button
                        onClick={() => setSelectedLocation(null)}
                        className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X size={14} className="text-gray-400" />
                    </button>
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedLocation.type.includes('partner') ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-gray-400'
                            }`}>
                            {selectedLocation.type.includes('partner') ? <Zap size={24} /> : <Building2 size={24} />}
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-lg leading-tight pr-6">{selectedLocation.name}</h4>
                            <div className="flex items-center gap-2 mt-1 mb-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${selectedLocation.type.includes('partner')
                                    ? 'bg-purple-900/30 text-purple-300 border-purple-500/30'
                                    : 'bg-gray-800 text-gray-400 border-white/10'
                                    }`}>
                                    {selectedLocation.type === 'clinic-partner' ? 'VERIFIED PARTNER' : 'STANDARD FACILITY'}
                                </span>
                                <span className="text-xs text-gray-500 font-mono">{selectedLocation.distance}</span>
                            </div>
                            <p className="text-gray-400 text-xs flex items-center gap-1.5">
                                <MapPin size={12} />
                                {selectedLocation.address || "Address not public"}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* HUD Overlays - modified to hide when details open */}
            {!selectedLocation && (
                <div className="absolute bottom-4 left-4 p-4 bg-black/80 backdrop-blur-md rounded-xl border border-white/10 text-xs font-mono space-y-1 z-20 pointer-events-none">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Navigation size={12} />
                        <span>TRIANGULATION ACTIVE</span>
                    </div>
                    <div className="text-white font-bold">
                        LAT: 40.7128° N <br />
                        LNG: 74.0060° W
                    </div>
                </div>
            )}

            <div className={`absolute top-4 right-4 z-20 space-y-2 transition-opacity ${selectedLocation ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <LegendItem color="bg-red-500" label="PATIENT SIGNAL" />
                <LegendItem color="bg-purple-500" label="PARTNER CLINIC (Verified)" />
                <LegendItem color="bg-gray-500" label="STANDARD FACILITY" />
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
        </div>
    );
}

function MapMarker({ location, isActive, onClick }: { location: Location; isActive: boolean; onClick: () => void }) {
    // Determine styles based on type
    const isPatient = location.type === "patient";
    const isGuardian = location.type === "guardian";
    const isPartner = location.type === "clinic-partner";

    let color = "bg-gray-500";
    let glow = "shadow-none";
    let icon = <Building2 size={16} />;

    if (isPatient) {
        color = isActive ? "bg-red-500" : "bg-emerald-500";
        glow = isActive ? "shadow-[0_0_30px_rgba(239,68,68,0.8)]" : "shadow-[0_0_20px_rgba(16,185,129,0.5)]";
        icon = <Radio size={16} className={isActive ? "animate-ping" : ""} />;
    } else if (isGuardian) {
        color = "bg-blue-500";
        glow = "shadow-[0_0_20px_rgba(59,130,246,0.5)]";
        icon = <Navigation size={16} className="-rotate-45" />;
    } else if (isPartner) {
        color = "bg-purple-500";
        glow = "shadow-[0_0_20px_rgba(168,85,247,0.5)]";
        icon = <Zap size={16} />;
    }

    return (
        <motion.div
            className="absolute flex flex-col items-center group cursor-pointer z-10 hover:z-30"
            style={{ left: `${location.x}%`, top: `${location.y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => {
                e.stopPropagation(); // Prevent issues if map has click handlers later
                onClick();
            }}
        >
            {/* The Dot/Icon */}
            <div className={`relative w-8 h-8 rounded-full ${color} ${glow} flex items-center justify-center text-white z-10 border-2 border-white/20 transition-all duration-300 group-hover:scale-125`}>
                {icon}
                {/* Pulse ring for key entities */}
                {(isPatient || isPartner) && (
                    <div className={`absolute inset-0 rounded-full ${color} opacity-40 animate-ping`} />
                )}
            </div>

            {/* Connecting Line to Patient (only if Active and not patient) */}
            {isActive && !isPatient && (
                <svg className="absolute top-4 left-4 w-[500px] h-[500px] pointer-events-none opacity-20 overflow-visible z-0">
                    {/* This is a simplified visual; proper SVG lines require calculating relative coordinates. 
                       For this simulated component, we use a CSS approach or just skip the complex line for now 
                       to avoid clutter without precise math. 
                   */}
                </svg>
            )}

            {/* Label Tooltip - Hidden if this marker is clicked/selected (handled by parent overlay, but good to keep hover) */}
            <div className={`mt-2 px-3 py-1 rounded-lg bg-black/80 backdrop-blur border border-white/10 text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none
                ${isPatient ? "opacity-100 bg-red-950/80 border-red-500/30 text-red-200 lg:text-xs lg:px-4 lg:py-2" : ""}
            `}>
                {location.name}
            </div>

            {/* Address Pill for Patient (Always visible if active) */}
            {isPatient && isActive && (
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg flex items-center gap-1 z-30"
                >
                    <MapPin size={10} />
                    {location.address}
                </motion.div>
            )}
        </motion.div>
    );
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-2 justify-end">
            <span className="text-[10px] font-bold text-gray-400">{label}</span>
            <div className={`w-2 h-2 rounded-full ${color} shadow-[0_0_10px_currentColor]`} />
        </div>
    );
}
