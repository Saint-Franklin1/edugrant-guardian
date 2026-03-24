import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, AlertTriangle, CheckCircle, FileWarning } from 'lucide-react';
import { documentTypes } from '@/lib/kenya-data';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  const [validationError, setValidationError] = useState('');

  const validateFile = (f: File): string | null => {
    if (f.type !== 'application/pdf') {
      return 'Only PDF files are accepted. Please convert your document to PDF format.';
    }
    if (f.size > MAX_FILE_SIZE) {
      return `File size exceeds 5MB limit (${(f.size / 1024 / 1024).toFixed(1)}MB). Please compress your PDF.`;
    }
    if (f.size === 0) {
      return 'File appears to be empty. Please upload a valid PDF document.';
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setValidationError('');

    if (selected) {
      const error = validateFile(selected);
      if (error) {
        setValidationError(error);
        setFile(null);
        return;
      }
    }
    setFile(selected);
  };

  const handleUpload = async () => {
    if (!user || !file || !docType) {
      toast({ title: 'Missing info', description: 'Select document type and file.', variant: 'destructive' });
      return;
    }

    // Re-validate
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setUploading(true);

    try {
      // Deactivate previous active version of same type
      await supabase
        .from('documents')
        .update({ is_active: false } as any)
        .eq('student_id', studentId)
        .eq('type', docType as any)
        .eq('is_active', true);

      // Get next version number
      const { data: existing } = await supabase
        .from('documents')
        .select('version')
        .eq('student_id', studentId)
        .eq('type', docType as any)
        .order('version', { ascending: false })
        .limit(1);

      const nextVersion = (existing && existing.length > 0 ? existing[0].version : 0) + 1;

      // Generate standardized filename
      const timestamp = Date.now();
      const standardName = `${user.id}_${docType}_${timestamp}.pdf`;
      const filePath = `${user.id}/${studentId}/${docType}/v${nextVersion}_${standardName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file);
      if (uploadError) {
        toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
        setUploading(false);
        return;
      }

      // Basic fraud check - flag if filename doesn't match document type keywords
      let isFlagged = false;
      let flagReason = '';
      const originalName = file.name.toLowerCase();
      const typeKeywords: Record<string, string[]> = {
        birth_certificate: ['birth', 'certificate', 'bc'],
        student_id: ['student', 'id', 'card'],
        parent_id: ['parent', 'id', 'national'],
        admission_letter: ['admission', 'letter', 'accept'],
        school_id: ['school', 'id'],
        fee_structure: ['fee', 'structure'],
        fee_statement: ['fee', 'statement', 'balance'],
        vulnerability_proof: ['vulnerability', 'proof', 'disability', 'orphan'],
        residency_proof: ['residency', 'residence', 'proof', 'chief'],
      };

      // Only flag if name has no relevant keywords (soft check)
      const keywords = typeKeywords[docType] || [];
      const hasKeyword = keywords.some(k => originalName.includes(k));
      if (!hasKeyword && originalName !== 'document.pdf' && originalName.length > 4) {
        isFlagged = true;
        flagReason = `Filename "${file.name}" does not match expected document type "${docType}"`;
      }

      // Insert document record
      const { error: dbError } = await supabase.from('documents').insert({
        student_id: studentId,
        type: docType as any,
        file_url: filePath,
        version: nextVersion,
        file_name: file.name,
        is_active: true,
        is_flagged: isFlagged,
        flag_reason: isFlagged ? flagReason : null,
      } as any);

      if (dbError) {
        toast({ title: 'Error saving document', description: dbError.message, variant: 'destructive' });
      } else {
        // Create fraud flag record if flagged
        if (isFlagged) {
          await supabase.from('fraud_flags').insert({
            student_id: studentId,
            flag_type: 'filename_mismatch',
            details: flagReason,
          });
          toast({
            title: 'Document uploaded with warning',
            description: 'The document has been flagged for review due to filename mismatch.',
            variant: 'destructive',
          });
        } else {
          toast({ title: 'Document uploaded successfully!' });
        }

        setFile(null);
        setDocType('');
        setValidationError('');
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        onUploaded();
      }
    } catch (err) {
      toast({ title: 'Upload error', description: 'An unexpected error occurred.', variant: 'destructive' });
    }

    setUploading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" /> Upload Document
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Document Type</Label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {documentTypes.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>File (PDF only, max 5MB)</Label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:opacity-90 mt-1"
            onChange={handleFileChange}
          />
        </div>

        {validationError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <FileWarning className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {file && !validationError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm text-primary">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Uploading a new version will replace the previous active document of the same type.
        </p>

        <Button onClick={handleUpload} disabled={uploading || !file || !docType || !!validationError} className="w-full">
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UploadForm;
