import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type StudentProfile = Database['public']['Tables']['student_profiles']['Row'];

interface QRDisplayProps {
  student: StudentProfile;
  ward: string;
  constituency: string;
}

const QRDisplay = ({ student, ward, constituency }: QRDisplayProps) => {
  const qrData = JSON.stringify({
    educationId: student.education_id,
    name: student.student_name,
    status: student.status,
    ward,
    constituency,
    verifiedAt: student.updated_at,
  });

  return (
    <Card className="border-0 shadow-md overflow-hidden">
      <div className="bg-primary p-4 text-center">
        <div className="flex items-center justify-center gap-2 text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-heading font-bold">Education ID</span>
        </div>
      </div>
      <CardContent className="pt-6 text-center space-y-4">
        <div className="inline-block p-3 bg-card rounded-xl border-2 border-primary/10">
          <QRCodeSVG value={qrData} size={160} level="M" />
        </div>
        <div className="space-y-2">
          <p className="font-heading font-bold text-xl text-primary">{student.education_id}</p>
          <p className="font-medium">{student.student_name}</p>
          <p className="text-sm text-muted-foreground">{ward}, {constituency}</p>
          <Badge variant="outline" className="text-xs">
            Verified {new Date(student.updated_at).toLocaleDateString()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRDisplay;
