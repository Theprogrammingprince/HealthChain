"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientRecord } from "@/lib/store";
import { FileText, Image as ImageIcon, FileClock, Share2, Eye } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface RecordCardProps {
    record: PatientRecord;
    index: number;
}

export function RecordCard({ record, index }: RecordCardProps) {
    const getIcon = (type: string) => {
        switch (type) {
            case "Image": return <ImageIcon className="h-8 w-8 text-blue-400" />;
            case "PDF": return <FileText className="h-8 w-8 text-red-400" />;
            default: return <FileClock className="h-8 w-8 text-green-400" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
        >
            <Card className="bg-card/50 border-primary/20 backdrop-blur-sm hover:border-primary/60 transition-colors cursor-pointer group shadow-lg shadow-black/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="p-2 bg-muted/20 rounded-lg group-hover:bg-primary/20 transition-colors">
                        {getIcon(record.type)}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                        {record.type}
                    </div>
                </CardHeader>
                <CardContent>
                    <CardTitle className="text-lg font-bold truncate pr-4">{record.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Crypto-Encrypted • {record.date ? format(new Date(record.date), "MMM d, yyyy") : "Unknown Date"}
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-2">
                    <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[100px]">
                        {record.ipfsHash}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-primary">
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:text-blue-500">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
