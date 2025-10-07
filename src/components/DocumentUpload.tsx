import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2 } from "lucide-react";

interface DocumentUploadProps {
  onDocumentUploaded: (documentId: string) => void;
}

export function DocumentUpload({ onDocumentUploaded }: DocumentUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, or TXT file.",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "File size must be less than 20MB.",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Extract text using edge function
      const { data: extractData, error: extractError } = await supabase.functions.invoke(
        "extract-text",
        {
          body: {
            filePath,
            fileName: file.name,
            fileType: file.type,
          },
        }
      );

      if (extractError) throw extractError;

      // Save document metadata to database
      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert([
          {
            user_id: user.id,
            title: file.name,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            storage_path: filePath,
            extracted_text: extractData.text,
          },
        ])
        .select()
        .single();

      if (docError) throw docError;

      toast({
        title: "Document uploaded!",
        description: "Your document has been processed and is ready for analysis.",
      });

      onDocumentUploaded(docData.id);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error.message || "Failed to upload document",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-6">
      <Card className="w-full max-w-2xl border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Upload Your Document</CardTitle>
          <CardDescription>
            Upload a textbook, PDF, or document to start analyzing with AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground">Processing your document...</p>
              </div>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  disabled={uploading}
                />
                <Button
                  onClick={() => document.getElementById("file-upload")?.click()}
                  className="bg-primary hover:bg-primary/90"
                  disabled={uploading}
                >
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supports PDF, DOCX, TXT (Max 20MB)
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
