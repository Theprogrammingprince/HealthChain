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
        switch (status) {
            case 'Pending Hospital Review':
            case 'Pending':
                return {
                    color: 'text-amber-500',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    icon: Clock
                };
            case 'Pending Patient Approval':
                return {
                    color: 'text-blue-500',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                    icon: AlertCircle
                };
            case 'Approved':
            case 'Verified':
                return {
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    icon: CheckCircle2
                };
            case 'Rejected':
                return {
                    color: 'text-rose-500',
                    bg: 'bg-rose-500/10',
                    border: 'border-rose-500/20',
                    icon: XCircle
                };
            default:
                return {
                    color: 'text-gray-500',
                    bg: 'bg-gray-500/10',
                    border: 'border-gray-500/20',
                    icon: Clock
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
                {status}
            </span>
        </Badge>
    );
}
