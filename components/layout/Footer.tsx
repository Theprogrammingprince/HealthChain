'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Github } from 'lucide-react';

export function Footer() {
    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 }
        }
    };

    const pathname = usePathname();

    const dashboardPaths = ["/patient/dashboard", "/clinical/dashboard", "/admin/dashboard", "/clinical/verify", "/clinical/rejected", "/doctor"];
    if (dashboardPaths.some(path => pathname?.startsWith(path))) return null;

    return (
        <footer className="bg-black/95 border-t border-white/10 overflow-hidden relative">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                {/* Top Section - Tagline and Links */}
                <motion.div
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    {/* Tagline */}
                    <div className="max-w-md">
                        <div className="flex items-center gap-3 mb-3">
                            <Image src="/logo.svg" alt="HealthChain" width={32} height={32} className="w-8 h-8" />
                            <span className="text-lg font-bold text-white tracking-tight">Health<span className="text-blue-400">Chain</span></span>
                        </div>
                        <p className="text-gray-400 text-base leading-relaxed">
                            HealthChain secures your medical history on-chain. {' '}
                            <span className="italic font-medium text-blue-400">Save lives. Own your data.</span>
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex items-center gap-5">
                        <Link href="/" className="text-white font-medium hover:text-blue-400 hover:translate-x-0.5 transition-all duration-300" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>
                            Home
                        </Link>
                        <Link href="/emergency" className="text-white font-medium hover:text-blue-400 hover:translate-x-0.5 transition-all duration-300" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>
                            Emergency Access
                        </Link>
                        <Link href="/about" className="text-white font-medium hover:text-blue-400 hover:translate-x-0.5 transition-all duration-300" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>
                            About Us
                        </Link>
                        <Link href="/faq" className="text-white font-medium hover:text-blue-400 hover:translate-x-0.5 transition-all duration-300" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>
                            FAQ
                        </Link>
                    </div>
                </motion.div>

                {/* Join Button */}
                <motion.div
                    className="mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <Link href="/signup">
                        <motion.button
                            className="px-8 py-3 border border-blue-500/30 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Get Started Now →
                        </motion.button>
                    </Link>
                </motion.div>

                {/* Middle Section - Large Brand Name */}
                <motion.div
                    className="mb-16 select-none"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <h2 className="text-6xl sm:text-8xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent">
                        HealthChain<span className="italic font-light text-blue-500/20">.</span>
                    </h2>
                </motion.div>

                {/* Bottom Section - Social Links */}
                <motion.div
                    className="flex justify-end"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <div className="flex flex-col gap-3 text-sm">
                        <Link
                            href="https://x.com/healthchainorg"
                            target="_blank"
                            className="flex items-center justify-between gap-8 text-white font-medium hover:text-blue-400 transition-all duration-300 group hover:translate-x-0.5"
                            style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}
                        >
                            <span>X (Twitter)</span>
                            <Twitter className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                        {/* <Link
                            href="https://github.com"
                            target="_blank"
                            className="flex items-center justify-between gap-8 text-white font-medium hover:text-blue-400 transition-all duration-300 group hover:translate-x-0.5"
                            style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}
                        >
                            <span>GitHub</span>
                            <Github className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link> */}
                        <Link
                            href="https://linkedin.com"
                            target="_blank"
                            className="flex items-center justify-between gap-8 text-white font-medium hover:text-blue-400 transition-all duration-300 group hover:translate-x-0.5"
                            style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}
                        >
                            <span>LinkedIn</span>
                            <Linkedin className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                    </div>
                </motion.div>

                {/* Additional Footer Links */}
                <motion.div
                    className="mt-12 pt-8 border-t border-white/5"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-white mb-4" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>Platform</h3>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/emergency" className="text-white font-medium hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>Emergency Access</Link></li>
                                <li><Link href="/" className="text-white font-medium hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>Home</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-4" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>Support</h3>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/support" className="text-white font-medium hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>Support Center</Link></li>
                                <li><Link href="/faq" className="text-white font-medium hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>FAQ</Link></li>
                                <li><Link href="/contact" className="text-white font-medium hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>Contact Us</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-4" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>Company</h3>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="/about" className="text-white font-medium hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>About Us</Link></li>
                                <li><Link href="/privacy" className="text-white font-medium hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>Privacy Policy</Link></li>
                                <li><Link href="/terms" className="text-white font-medium hover:text-blue-400 hover:translate-x-1 inline-block transition-all duration-300" style={{ textShadow: '0 0 8px rgba(255,255,255,0.15)' }}>Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-600 border-t border-white/5 pt-8">
                        <p>
                            © 2026 HealthChain. Built on Polygon. Encrypted & Patient-Owned.
                        </p>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>All Systems Operational</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
