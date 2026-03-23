import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="text-center">
      <CardHeader><CardTitle className="text-primary">Education ID</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="inline-block p-4 bg-card rounded-xl border">
          <QRCodeSVG value={qrData} size={180} level="M" />
        </div>
        <div className="text-sm space-y-1">
          <p className="font-heading font-bold text-lg">{student.education_id}</p>
          <p>{student.student_name}</p>
          <p className="text-muted-foreground">{ward}, {constituency}</p>
          <p className="text-xs text-muted-foreground">Verified: {new Date(student.updated_at).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRDisplay;
