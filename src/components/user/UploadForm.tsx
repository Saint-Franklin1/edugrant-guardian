import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { documentTypes } from '@/lib/kenya-data';

interface UploadFormProps {
  studentId: string;
  onUploaded: () => void;
}

const UploadForm = ({ studentId, onUploaded }: UploadFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [docType, setDocType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!user || !file || !docType) {
      toast({ title: 'Missing info', description: 'Select document type and file.', variant: 'destructive' });
      return;
    }
    setUploading(true);

    // Get current version
    const { data: existing } = await supabase.from('documents').select('version').eq('student_id', studentId).eq('type', docType as any).order('version', { ascending: false }).limit(1);
    const nextVersion = (existing && existing.length > 0 ? existing[0].version : 0) + 1;

    const filePath = `${user.id}/${studentId}/${docType}/v${nextVersion}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
    if (uploadError) {
      toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from('documents').insert({
      student_id: studentId,
      type: docType as any,
      file_url: filePath,
      version: nextVersion,
    });

    setUploading(false);
    if (dbError) {
      toast({ title: 'Error saving document', description: dbError.message, variant: 'destructive' });
    } else {
      toast({ title: 'Document uploaded!' });
      setFile(null);
      setDocType('');
      onUploaded();
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Upload Document</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Document Type</Label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {documentTypes.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>File</Label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:opacity-90 mt-1"
            onChange={e => setFile(e.target.files?.[0] || null)} />
        </div>
        <Button onClick={handleUpload} disabled={uploading || !file || !docType}>
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UploadForm;
