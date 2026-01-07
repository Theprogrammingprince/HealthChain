"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Label, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Fuel, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const GAUGE_DATA = [
    { name: 'Used', value: 75, color: '#00BFFF' },
    { name: 'Remaining', value: 25, color: '#333' },
];

const CHART_DATA = [
    { name: 'LUTH', gas: 420 },
    { name: 'Reddington', gas: 350 },
    { name: 'Gen. Hosp.', gas: 210 },
    { name: 'Lagoon', gas: 180 },
    { name: 'Eko Hosp.', gas: 120 },
];

export default function PaymasterMonitor() {
    const balance = 145; // Mock MATIC balance
    const maxBalance = 200;
    const percentage = (balance / maxBalance) * 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fuel Gauge */}
            <Card className="bg-gray-900 border-gray-800 md:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                        <Fuel className="h-5 w-5 text-[#00BFFF]" />
                        Gas Tank Level
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="relative w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[{ value: percentage }, { value: 100 - percentage }]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    startAngle={180}
                                    endAngle={0}
                                    paddingAngle={0}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    <Cell fill={percentage < 30 ? "#FF5252" : "#00BFFF"} />
                                    <Cell fill="#1f2937" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
                            <span className={`text-4xl font-bold ${percentage < 30 ? 'text-[#FF5252]' : 'text-white'}`}>
                                {balance}
                            </span>
                            <span className="text-xs text-gray-500 uppercase">MATIC</span>
                        </div>
                    </div>
                    <div className="text-center mt-[-40px]">
                        {percentage < 30 && (
                            <div className="flex items-center gap-2 text-[#FF5252] bg-[#FF5252]/10 px-3 py-2 rounded-md border border-[#FF5252]/20 mt-4">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="text-xs font-medium">Low Balance Warning</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Usage Chart */}
            <Card className="bg-gray-900 border-gray-800 md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-lg font-medium text-white">Top Gas Consumers (24h)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={CHART_DATA} barSize={40}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', color: '#fff' }}
                                cursor={{ fill: '#1f2937' }}
                            />
                            <Bar dataKey="gas" fill="#00BFFF" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
