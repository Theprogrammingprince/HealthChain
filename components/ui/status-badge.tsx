import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

export type WorkflowStatus =
    | 'Pending Hospital Review'
    | 'Pending Patient Approval'
    | 'Approved'
    | 'Rejected'
    | 'Verified'
    | 'Pending';

interface StatusBadgeProps {
    status: WorkflowStatus | string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const getStatusConfig = (status: string) => {
        // Normalize status to handle both formats (snake_case and Title Case)
        const normalizedStatus = status.toLowerCase().replace(/_/g, ' ');

        switch (normalizedStatus) {
            case 'pending hospital review':
            case 'pending':
            case 'draft':
                return {
                    color: 'text-amber-500',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    icon: Clock,
                    label: 'Pending Review'
                };
            case 'pending patient approval':
                return {
                    color: 'text-blue-500',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                    icon: AlertCircle,
                    label: 'Awaiting Patient'
                };
            case 'approved':
            case 'verified':
                return {
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    icon: CheckCircle2,
                    label: 'Approved'
                };
            case 'rejected':
                return {
                    color: 'text-rose-500',
                    bg: 'bg-rose-500/10',
                    border: 'border-rose-500/20',
                    icon: XCircle,
                    label: 'Rejected'
                };
            case 'archived':
                return {
                    color: 'text-gray-500',
                    bg: 'bg-gray-500/10',
                    border: 'border-gray-500/20',
                    icon: Clock,
                    label: 'Archived'
                };
            default:
                return {
                    color: 'text-gray-500',
                    bg: 'bg-gray-500/10',
                    border: 'border-gray-500/20',
                    icon: Clock,
                    label: status
                };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <Badge
            variant="outline"
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${config.bg} ${config.border} ${className}`}
        >
            <Icon className={`w-3.5 h-3.5 ${config.color}`} />
            <span className={`text-[10px] uppercase font-bold tracking-wider ${config.color}`}>
                {config.label}
            </span>
        </Badge>
    );
}
