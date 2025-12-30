"use client";

import { useAppStore } from "@/lib/store";
import { Fuel, TrendingUp, AlertTriangle, Zap, Coins } from "lucide-react";

export function PaymasterMonitor() {
    const { paymasterBalance, topUpPaymaster } = useAppStore();

    // Mock calculations for demo
    const gasPrice = 35; // Gwei
    const dailyBurn = 120.5; // $HC
    const projectedRunway = Math.floor(paymasterBalance / dailyBurn);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Balance Card */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-[#121212] border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Fuel size={80} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-indigo-400">
                        <Coins size={18} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Paymaster Reserves</h3>
                    </div>
                    <div className="text-4xl font-black text-white mb-1">
                        {paymasterBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </div>
                    <p className="text-xs text-indigo-300/60 mb-6">Available for subsidized gas fees</p>

                    <button
                        onClick={() => topUpPaymaster(100)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Zap size={14} />
                        Inject Liquidity (+100)
                    </button>
                    <p className="text-[10px] text-center text-gray-500 mt-2">Simulates bridging assets to Paymaster Vault</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <MetricCard
                    label="Current Gas Price"
                    value={`${gasPrice} Gwei`}
                    trend="+12% vs avg"
                    trendColor="text-red-400"
                    icon={<Fuel size={14} />}
                />
                <MetricCard
                    label="24h Burn Rate"
                    value={`$${dailyBurn.toFixed(2)}`}
                    trend="Normal Load"
                    trendColor="text-emerald-400"
                    icon={<TrendingUp size={14} />}
                />
                <MetricCard
                    label="Projected Runway"
                    value={`${projectedRunway} Days`}
                    trend={projectedRunway < 7 ? "Critical Low" : "Healthy"}
                    trendColor={projectedRunway < 7 ? "text-red-400" : "text-emerald-400"}
                    icon={<AlertTriangle size={14} />}
                />
                <div className="bg-[#121212] border border-white/5 p-4 rounded-2xl flex flex-col justify-center items-center text-center">
                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Network Status</div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm font-bold text-white">Operational</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, trend, trendColor, icon }: any) {
    return (
        <div className="bg-[#121212] border border-white/5 p-4 rounded-2xl flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-gray-500 uppercase font-bold">{label}</span>
                <span className="text-gray-600">{icon}</span>
            </div>
            <div>
                <div className="text-lg font-bold text-white">{value}</div>
                <div className={`text-[10px] font-bold ${trendColor}`}>{trend}</div>
            </div>
        </div>
    );
}
