import { Button } from "@/components/ui/button";

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <h1 className="text-5xl font-bold mb-6">Join Our Team</h1>
                <p className="text-xl text-gray-400 mb-12">
                    Help us rebuild the healthcare infrastructure of the internet.
                </p>
            </div>

            <div className="max-w-4xl mx-auto px-6 grid gap-6">
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-blue-500/50 transition-colors cursor-pointer">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Senior Smart Contract Engineer</h3>
                        <p className="text-gray-400 text-sm">Remote • Engineering • Full-time</p>
                    </div>
                    <Button variant="outline" className="border-white/20 hover:bg-white hover:text-black">View Role</Button>
                </div>

                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-blue-500/50 transition-colors cursor-pointer">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Full Stack Developer (Next.js)</h3>
                        <p className="text-gray-400 text-sm">Remote • Engineering • Full-time</p>
                    </div>
                    <Button variant="outline" className="border-white/20 hover:bg-white hover:text-black">View Role</Button>
                </div>

                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-blue-500/50 transition-colors cursor-pointer">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Product Designer</h3>
                        <p className="text-gray-400 text-sm">New York / Remote • Design • Full-time</p>
                    </div>
                    <Button variant="outline" className="border-white/20 hover:bg-white hover:text-black">View Role</Button>
                </div>
            </div>

            <div className="text-center mt-12">
                <p className="text-gray-500">Don't see a role for you?</p>
                <a href="#" className="text-blue-400 hover:underline">Email us your resume</a>
            </div>
        </div>
    )
}
