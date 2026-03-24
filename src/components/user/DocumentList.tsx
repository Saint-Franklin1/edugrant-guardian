import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle } from 'lucide-react';
import { documentTypes } from '@/lib/kenya-data';

const DocumentList = ({ studentId }: { studentId: string }) => {
  const [docs, setDocs] = useState<any[]>([]);

  useEffect(() => {
    supabase.from('documents').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
      .then(({ data }) => setDocs(data || []));
  }, [studentId]);

  const getLabel = (type: string) => documentTypes.find(d => d.value === type)?.label || type;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" /> Uploaded Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {docs.map(d => (
              <div key={d.id} className={`flex items-center justify-between p-3 rounded-lg ${d.is_flagged ? 'bg-destructive/5 border border-destructive/20' : 'bg-muted'}`}>
                <div className="flex items-center gap-2">
                  {d.is_flagged && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                  <div>
                    <p className="text-sm font-medium">{getLabel(d.type)}</p>
                    <p className="text-xs text-muted-foreground">
                      Version {d.version} • {new Date(d.created_at).toLocaleDateString()}
                      {d.file_name && ` • ${d.file_name}`}
                    </p>
                    {d.is_flagged && d.flag_reason && (
                      <p className="text-xs text-destructive mt-1">⚠ {d.flag_reason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!d.is_active && <Badge variant="outline" className="text-xs">Superseded</Badge>}
                  {d.is_flagged && <Badge variant="destructive" className="text-xs">Flagged</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentList;
