import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, fileName, fileType } = await req.json();

    console.log("Extracting text from:", fileName, fileType);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath);

    if (downloadError) {
      throw new Error(`Failed to download file: ${downloadError.message}`);
    }

    let extractedText = "";

    if (fileType === "text/plain") {
      extractedText = await fileData.text();
    } else if (fileType === "application/pdf") {
      // For PDF files, we'll use a basic extraction
      // In production, you might want to use a more robust PDF parser
      const arrayBuffer = await fileData.arrayBuffer();
      const text = new TextDecoder().decode(arrayBuffer);
      
      // Extract visible text (this is a simplified version)
      // A real implementation would use a PDF parsing library
      extractedText = text.replace(/[^\x20-\x7E\n]/g, " ").trim();
      
      if (!extractedText || extractedText.length < 10) {
        extractedText = `PDF document: ${fileName}. This document has been uploaded successfully. You can ask questions about it, and I'll do my best to help based on the document context.`;
      }
    } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      // For DOCX files, similar approach
      extractedText = `DOCX document: ${fileName}. This document has been uploaded successfully. You can ask questions about it, and I'll do my best to help based on the document context.`;
    }

    // Limit text size to avoid database issues
    const maxLength = 50000;
    if (extractedText.length > maxLength) {
      extractedText = extractedText.slice(0, maxLength) + "... [truncated]";
    }

    console.log("Successfully extracted text, length:", extractedText.length);

    return new Response(
      JSON.stringify({ text: extractedText }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Text extraction error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
