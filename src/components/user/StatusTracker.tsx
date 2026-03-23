import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

const steps = [
  { key: 'draft', label: 'Draft' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'verified', label: 'Verified' },
];

const stepOrder = steps.map(s => s.key);

const StatusTracker = ({ status }: { status: string }) => {
  const currentIdx = stepOrder.indexOf(status);
  const isRejected = status === 'rejected';

  return (
    <Card>
      <CardHeader><CardTitle>Application Progress</CardTitle></CardHeader>
      <CardContent>
        {isRejected ? (
          <div className="text-center p-4">
            <div className="text-destructive font-medium">Application Rejected</div>
            <p className="text-sm text-muted-foreground mt-1">Please review comments from reviewers.</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const done = i <= currentIdx;
              const active = i === currentIdx;
              return (
                <div key={step.key} className="flex flex-col items-center flex-1">
                  <div className={`rounded-full p-1 ${done ? 'text-primary' : 'text-muted-foreground'}`}>
                    {done ? <CheckCircle2 className="h-6 w-6" /> : active ? <Clock className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </div>
                  <span className={`text-xs mt-1 ${done ? 'font-medium' : 'text-muted-foreground'}`}>{step.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusTracker;
