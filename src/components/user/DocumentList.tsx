import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { documentTypes } from '@/lib/kenya-data';
import type { Database } from '@/integrations/supabase/types';

type Document = Database['public']['Tables']['documents']['Row'];

const DocumentList = ({ studentId }: { studentId: string }) => {
  const [docs, setDocs] = useState<Document[]>([]);

  useEffect(() => {
    supabase.from('documents').select('*').eq('student_id', studentId).order('created_at', { ascending: false })
      .then(({ data }) => setDocs(data || []));
  }, [studentId]);

  const getLabel = (type: string) => documentTypes.find(d => d.value === type)?.label || type;

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Uploaded Documents</CardTitle></CardHeader>
      <CardContent>
        {docs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {docs.map(d => (
              <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium">{getLabel(d.type)}</p>
                  <p className="text-xs text-muted-foreground">Version {d.version} • {new Date(d.created_at).toLocaleDateString()}</p>
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
