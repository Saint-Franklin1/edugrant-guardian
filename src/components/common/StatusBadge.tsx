interface StatusBadgeProps {
  status: string;
}

const labels: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  verified: 'Verified',
  rejected: 'Rejected',
  approved_for_funding: 'Approved for Funding',
  allocated: 'Allocated',
  disbursed: 'Disbursed',
  completed: 'Completed',
};

const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`status-badge status-${status}`}>
    {labels[status] || status}
  </span>
);

export default StatusBadge;
