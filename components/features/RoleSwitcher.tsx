"use client";

import { motion } from "framer-motion";
import { User, Building2, Stethoscope } from "lucide-react";

interface RoleSwitcherProps {
    role: 'Patient' | 'Hospital' | 'Doctor';
    onRoleChange: (role: 'Patient' | 'Hospital' | 'Doctor') => void;
}

export function RoleSwitcher({ role, onRoleChange }: RoleSwitcherProps) {
    const roles = [
        { value: 'Patient', label: 'Patient', icon: User },
        { value: 'Doctor', label: 'Doctor', icon: Stethoscope },
        { value: 'Hospital', label: 'Hospital', icon: Building2 },
    ] as const;

    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-full">
                {roles.map((r) => {
                    const Icon = r.icon;
                    const isActive = role === r.value;

                    return (
                        <motion.button
                            key={r.value}
                            onClick={() => onRoleChange(r.value)}
                            className={`
                                relative flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition-all
                                ${isActive
                                    ? 'text-gray-900'
                                    : 'text-gray-600 hover:text-gray-900'
                                }
                            `}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeRole"
                                    className="absolute inset-0 bg-white rounded-md shadow-sm"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {r.label}
                            </span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
