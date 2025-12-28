"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    FileText,
    FlaskConical,
    Activity,
    FileDigit,
    Share2,
    Eye,
    ExternalLink
} from "lucide-react";
import { PatientRecord } from "@/lib/store";
import { motion } from "framer-motion";

const typeIcons = {
    Lab: FlaskConical,
    Scan: Activity,
    Prescription: FileDigit,
    PDF: FileText,
    Image: FileDigit
};

const typeColors = {
    Lab: "text-blue-400 bg-blue-400/10",
    Scan: "text-purple-400 bg-purple-400/10",
    Prescription: "text-emerald-400 bg-emerald-400/10",
    PDF: "text-orange-400 bg-orange-400/10",
    Image: "text-pink-400 bg-pink-400/10"
};

export function RecordCard({ record }: { record: PatientRecord }) {
    const Icon = typeIcons[record.type as keyof typeof typeIcons] || FileText;
    const colorClass = typeColors[record.type as keyof typeof typeColors] || "text-gray-400 bg-gray-400/10";

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="p-5 bg-white/5 border-white/10 hover:border-indigo-500/30 transition-all group backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colorClass}`}>
                        <Icon size={24} />
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase border-white/10 bg-white/5 text-gray-400">
                        {record.type}
                    </Badge>
                </div>

                <div className="mb-6">
                    <h4 className="text-white font-semibold mb-1 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                        {record.name}
                    </h4>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                        {record.date} • {record.facility || "Private Record"}
                    </p>
                    {record.doctor && (
                        <p className="text-gray-600 text-[10px] mt-1 italic">
                            Attending: {record.doctor}
                        </p>
                    )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/5">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-xs text-gray-400 hover:text-white hover:bg-white/10"
                    >
                        <Eye className="w-3 h-3 mr-2" />
                        View
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-8 text-xs text-gray-400 hover:text-white hover:bg-white/10"
                    >
                        <Share2 className="w-3 h-3 mr-2" />
                        Share
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-gray-500 hover:text-indigo-400"
                        title="View on IPFS"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
