import { CheckCircle2, Clock, AlertCircle, FileCheck, Banknote, Send, Circle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

const config: Record<string, { label: string; className: string; icon: typeof Circle }> = {
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground', icon: Circle },
  submitted: { label: 'Submitted', className: 'bg-blue-50 text-blue-700 border border-blue-200', icon: Send },
  under_review: { label: 'Under Review', className: 'bg-amber-50 text-amber-700 border border-amber-200', icon: Clock },
  verified: { label: 'Verified', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700 border border-red-200', icon: AlertCircle },
  approved_for_funding: { label: 'Approved', className: 'bg-indigo-50 text-indigo-700 border border-indigo-200', icon: FileCheck },
  allocated: { label: 'Allocated', className: 'bg-purple-50 text-purple-700 border border-purple-200', icon: Banknote },
  disbursed: { label: 'Disbursed', className: 'bg-teal-50 text-teal-700 border border-teal-200', icon: Banknote },
  completed: { label: 'Completed', className: 'bg-green-50 text-green-700 border border-green-200', icon: CheckCircle2 },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const c = config[status] || { label: status, className: 'bg-muted text-muted-foreground', icon: Circle };
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.className}`}>
      <Icon className="h-3 w-3" />
      {c.label}
    </span>
  );
};

export default StatusBadge;
