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
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-4 w-4" /> Uploaded Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {docs.map(d => (
              <div key={d.id} className={`flex items-center justify-between p-3 rounded-xl ${d.is_flagged ? 'bg-destructive/5 border border-destructive/10' : 'bg-secondary/60'}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  {d.is_flagged && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{getLabel(d.type)}</p>
                    <p className="text-xs text-muted-foreground">
                      v{d.version} · {new Date(d.created_at).toLocaleDateString()}
                      {d.file_name && ` · ${d.file_name}`}
                    </p>
                    {d.is_flagged && d.flag_reason && (
                      <p className="text-xs text-destructive mt-0.5">⚠ {d.flag_reason}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!d.is_active && <Badge variant="outline" className="text-xs rounded-full">Superseded</Badge>}
                  {d.is_flagged && <Badge variant="destructive" className="text-xs rounded-full">Flagged</Badge>}
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
