"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/lib/store";
import { RecordCard } from "@/components/features/RecordCard";
import { FileUpload } from "@/components/features/FileUpload";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, ShieldAlert, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
    const { records } = useAppStore();

    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
                    <p className="text-muted-foreground">Manage your encrypted medical records and access permissions.</p>
                </div>
            </div>

            <Tabs defaultValue="records" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="records">My Records</TabsTrigger>
                    <TabsTrigger value="providers">Linked Providers</TabsTrigger>
                </TabsList>

                <TabsContent value="records" className="space-y-6 mt-6">
                    {/* Upload Section */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Upload New Record</h2>
                        <FileUpload />
                    </section>

                    {/* Records Grid */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>
                        {records.length === 0 ? (
                            <div className="text-center py-12 border border-dashed rounded-lg">
                                <p className="text-muted-foreground">No records found. Upload your first document.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {records.map((record, index) => (
                                    <RecordCard key={record.id} record={record} index={index} />
                                ))}
                            </div>
                        )}
                    </section>
                </TabsContent>

                <TabsContent value="providers" className="mt-6">
                    <div className="grid gap-6">
                        {[
                            { name: "City General Hospital", access: "Emergency Access", status: "Active" },
                            { name: "Dr. Sarah Smith (Cardiology)", access: "Read Only", status: "Active" },
                            { name: "Metro Labs Inc.", access: "One-Time Upload", status: "Expired" }
                        ].map((provider, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base">{provider.name}</CardTitle>
                                                <CardDescription>{provider.access}</CardDescription>
                                            </div>
                                        </div>
                                        <Button variant="destructive" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="h-4 w-4 mr-2" /> Revoke
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className={`h-2 w-2 rounded-full ${provider.status === "Active" ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
                                            <span className="text-xs text-muted-foreground uppercase tracking-wider">{provider.status}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
