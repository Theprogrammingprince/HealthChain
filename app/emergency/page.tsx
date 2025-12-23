import { EmergencyCard } from "@/components/features/EmergencyCard";

export default function EmergencyPage() {
    return (
        <div className="container min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-4">
            <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-red-500">Emergency Mode</h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                    Instant access to critical medical data for first responders.
                    <span className="block text-sm mt-2 opacity-50">Authorized personnel only. All access is audited.</span>
                </p>
            </div>
            <EmergencyCard />
        </div>
    );
}
