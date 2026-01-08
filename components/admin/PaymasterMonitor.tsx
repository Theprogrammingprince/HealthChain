"use client";

import { useState } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Fuel, RefreshCw, AlertTriangle, Plus, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

const CHART_DATA = [
    { name: 'LUTH', gas: 420 },
    { name: 'Reddington', gas: 350 },
    { name: 'Gen. Hosp.', gas: 210 },
    { name: 'Lagoon', gas: 180 },
    { name: 'Eko Hosp.', gas: 120 },
];

export function PaymasterMonitor() {
    const { paymasterBalance, topUpPaymaster } = useAppStore();
    const [isToppingUp, setIsToppingUp] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState("");
    const maxBalance = 2000;
    const percentage = Math.min((paymasterBalance / maxBalance) * 100, 100);

    const handleTopUp = async () => {
        const amount = parseFloat(topUpAmount);
        if (isNaN(amount) || amount <= 0) return;

        setIsToppingUp(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            topUpPaymaster(amount);
            toast.success(`Successfully added $${amount} to Paymaster reserves`);
            setTopUpAmount("");
        } catch (error) {
            toast.error("Failed to process transaction");
        } finally {
            setIsToppingUp(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fuel Gauge */}
            <Card className="bg-[#0A0A0A] border-white/5 md:col-span-1 overflow-hidden relative group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 bg-white/[0.01]">
                    <CardTitle className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Fuel className="h-3.5 w-3.5 text-blue-500" />
                        Gas Reserves
                    </CardTitle>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/5">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white rounded-3xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-emerald-500 text-xl font-black uppercase">
                                    <Plus className="h-6 w-6" />
                                    Replenish Reserves
                                </DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Add funds to the Paymaster contract to continue subsidizing patient transactions.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount to Deposit (USD)</label>
                                    <Input
                                        type="number"
                                        value={topUpAmount}
                                        onChange={(e) => setTopUpAmount(e.target.value)}
                                        placeholder="e.g. 500"
                                        className="bg-white/5 border-white/10 text-white rounded-xl h-12"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleTopUp}
                                    disabled={!topUpAmount || isToppingUp}
                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-xl"
                                >
                                    {isToppingUp ? "PROCESSING..." : "CONFIRM DEPOSIT"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-8">
                    <div className="relative w-48 h-48 group-hover:scale-105 transition-transform duration-500">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { value: percentage },
                                        { value: 100 - percentage }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    startAngle={225}
                                    endAngle={-45}
                                    paddingAngle={0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell
                                        fill={percentage < 20 ? "#FF5252" : "#2563EB"}
                                        className="drop-shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                                    />
                                    <Cell fill="rgba(255,255,255,0.03)" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Available</span>
                            <span className={`text-4xl font-black tracking-tighter ${percentage < 20 ? 'text-red-500' : 'text-white'}`}>
                                ${paymasterBalance.toLocaleString()}
                            </span>
                            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-gray-500">
                                <ArrowUpRight size={10} className="text-emerald-500" />
                                <span>+2.4%</span>
                            </div>
                        </div>
                    </div>

                    {percentage < 20 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20 mt-6"
                        >
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Critical: Low Fuel</span>
                        </motion.div>
                    )}
                </CardContent>
            </Card>

            {/* Usage Sidebar */}
            <Card className="bg-[#0A0A0A] border-white/5 md:col-span-2 overflow-hidden flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 bg-white/[0.01]">
                    <CardTitle className="text-xs font-black text-gray-500 uppercase tracking-[0.2em]">Usage Analytics</CardTitle>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Real-time Load</span>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col">
                    <div className="p-6 grid grid-cols-2 gap-4 border-b border-white/5">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Burn Rate</span>
                            <p className="text-xl font-bold text-white">$42.50 / hr</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Est. Uptime</span>
                            <p className="text-xl font-bold text-white">12.4 Days</p>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Heavy Consumers (Top 3 Nodes)</span>
                        <div className="space-y-3">
                            {CHART_DATA.slice(0, 3).map((node, i) => (
                                <div key={node.name} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-colors">
                                            0{i + 1}
                                        </div>
                                        <span className="text-xs font-bold text-gray-300">{node.name}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-600 rounded-full group-hover:bg-blue-500 transition-all duration-1000"
                                                style={{ width: `${(node.gas / 500) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] font-mono font-bold text-gray-500">{node.gas} TX</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

import { motion } from "framer-motion";
