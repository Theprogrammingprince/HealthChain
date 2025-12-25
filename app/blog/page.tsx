import { Button } from "@/components/ui/button";
import Image from "next/image";

const posts = [
    {
        title: "Why Healthcare needs Blockchain",
        date: "Dec 24, 2025",
        category: "Thought Leadership",
        excerpt: "The current siloed data model is failing patients. Here is how we fix it."
    },
    {
        title: "Introducing HealthChain v1.0",
        date: "Dec 10, 2025",
        category: "Product Update",
        excerpt: "We are live on Polygon Amoy! Check out the new dashboard features."
    },
    {
        title: "Security Deep Dive: AES-256 & IPFS",
        date: "Nov 28, 2025",
        category: "Engineering",
        excerpt: "How we ensure your data remains confidential even on a public ledger."
    }
]

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-5xl font-bold mb-12 text-center">Latest Updates</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post, i) => (
                        <div key={i} className="group cursor-pointer">
                            <div className="aspect-video bg-gray-900 rounded-2xl mb-6 overflow-hidden border border-white/10">
                                {/* Placeholder for blog image */}
                                <div className="w-full h-full bg-gradient-to-br from-blue-900/20 to-purple-900/20 group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <div className="flex items-center gap-4 text-xs font-medium text-blue-400 mb-3">
                                <span>{post.category}</span>
                                <span className="text-gray-600">•</span>
                                <span className="text-gray-500">{post.date}</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{post.title}</h3>
                            <p className="text-gray-400 leading-relaxed mb-4">{post.excerpt}</p>
                            <span className="text-sm font-medium underline decoration-blue-500/50 underline-offset-4 group-hover:decoration-blue-500 transition-all">Read more</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
