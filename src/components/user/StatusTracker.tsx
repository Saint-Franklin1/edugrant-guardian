import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';

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
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Application Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {isRejected ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
            <XCircle className="h-5 w-5 text-red-600 shrink-0" />
            <div>
              <p className="font-medium text-sm text-red-700">Application Rejected</p>
              <p className="text-xs text-red-600/80 mt-0.5">Please review comments from reviewers and re-submit if applicable.</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute top-4 left-8 right-8 h-px bg-border">
              <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }} />
            </div>
            <div className="relative flex items-start justify-between">
              {steps.map((step, i) => {
                const done = i <= currentIdx;
                return (
                  <div key={step.key} className="flex flex-col items-center z-10" style={{ width: '25%' }}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                      done ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground'
                    }`}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                    </div>
                    <span className={`text-xs mt-2 text-center ${done ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusTracker;
