import { Button } from "@/components/ui/button";
import { Activity, Shield, Globe, Users } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
                        <Activity className="w-4 h-4" />
                        <span>Revolutionizing Healthcare</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                        About HealthChain
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        We are building the world's first truly decentralized, patient-owned medical record system.
                        Secure, instant, and borderless.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 px-6 bg-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            In a world where data breaches are common and patient history is fragmented, efficient healthcare delivery is compromised.
                            HealthChain exists to solve this by putting patients back in control.
                        </p>
                        <p className="text-gray-400 leading-relaxed mb-8">
                            By leveraging the Polygon blockchain, we ensure that your medical records are immutable, encrypted, and accessible only by you and the providers you frankly trust.
                            No more silos. No more lost records.
                        </p>
                        <Link href="/signup">
                            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 py-6 text-lg">
                                Join the Revolution
                            </Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl bg-black border border-white/10 flex flex-col items-center text-center">
                            <Shield className="w-10 h-10 text-blue-400 mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Security First</h3>
                            <p className="text-sm text-gray-500">AES-256 encryption meets blockchain immutability.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-black border border-white/10 flex flex-col items-center text-center mt-8">
                            <Globe className="w-10 h-10 text-green-400 mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Global Access</h3>
                            <p className="text-sm text-gray-500">Your records travel with you, anywhere on Earth.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-black border border-white/10 flex flex-col items-center text-center">
                            <Users className="w-10 h-10 text-purple-400 mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Patient Control</h3>
                            <p className="text-sm text-gray-500">You decide who sees what, and for how long.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-black border border-white/10 flex flex-col items-center text-center mt-8">
                            <Activity className="w-10 h-10 text-red-400 mb-4" />
                            <h3 className="font-semibold text-lg mb-2">Emergency Ready</h3>
                            <p className="text-sm text-gray-500">Vital info available to first responders instantly.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
