import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-4">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                {/* Contact Info */}
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in touch</h1>
                    <p className="text-gray-400 text-lg mb-12">
                        Have questions about enterprise integration or need patient support? We're here to help.
                    </p>

                    <div className="space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Email us</h3>
                                <p className="text-gray-400">support@healthchain.io</p>
                                <p className="text-gray-400">enterprise@healthchain.io</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Call us</h3>
                                <p className="text-gray-400">+1 (555) 123-4567</p>
                                <p className="text-sm text-gray-500 mt-1">Mon-Fri from 8am to 5pm EST</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Visit us</h3>
                                <p className="text-gray-400">123 Blockchain Blvd</p>
                                <p className="text-gray-400">New York, NY 10001</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

                    <form className="relative z-10 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">First name</label>
                                <Input placeholder="John" className="bg-black/50 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Last name</label>
                                <Input placeholder="Doe" className="bg-black/50 border-white/10" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Email</label>
                            <Input placeholder="john@example.com" type="email" className="bg-black/50 border-white/10" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Message</label>
                            <Textarea placeholder="How can we help you?" className="min-h-[150px] bg-black/50 border-white/10" />
                        </div>

                        <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-lg font-medium">
                            Send Message
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
