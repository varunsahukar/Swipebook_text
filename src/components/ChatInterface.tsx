import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, User, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

interface ChatInterfaceProps {
  sessionId: string | null;
  documentId: string | null;
  onSessionCreated: (sessionId: string) => void;
}

export function ChatInterface({ sessionId, documentId, onSessionCreated }: ChatInterfaceProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId) {
      fetchMessages();
      fetchSessionTitle();
    } else {
      setMessages([]);
      setSessionTitle("");
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const fetchSessionTitle = async () => {
    if (!sessionId) return;
    
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("title")
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      setSessionTitle(data.title);
    } catch (error) {
      console.error("Error fetching session title:", error);
    }
  };

  const fetchMessages = async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const createSession = async (firstMessage: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");

      const { data, error } = await supabase
        .from("chat_sessions")
        .insert([
          {
            user_id: user.id,
            document_id: documentId,
            title,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      onSessionCreated(data.id);
      return data.id;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      let currentSessionId = sessionId;

      // Create session if it doesn't exist
      if (!currentSessionId) {
        currentSessionId = await createSession(userMessage);
        if (!currentSessionId) {
          setLoading(false);
          return;
        }
      }

      // Add user message to UI
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMessage]);

      // Save user message to database
      const { error: userMsgError } = await supabase
        .from("chat_messages")
        .insert([
          {
            session_id: currentSessionId,
            role: "user",
            content: userMessage,
          },
        ]);

      if (userMsgError) throw userMsgError;

      // Get document text if available
      let documentText = "";
      if (documentId) {
        const { data: docData } = await supabase
          .from("documents")
          .select("extracted_text")
          .eq("id", documentId)
          .single();

        documentText = docData?.extracted_text || "";
      }

      // Call AI function
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke("chat", {
        body: {
          message: userMessage,
          documentText,
          sessionId: currentSessionId,
        },
      });

      if (aiError) throw aiError;

      // Add assistant message to UI
      const assistantMessage: Message = {
        id: `temp-${Date.now()}-ai`,
        role: "assistant",
        content: aiResponse.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save assistant message to database
      await supabase
        .from("chat_messages")
        .insert([
          {
            session_id: currentSessionId,
            role: "assistant",
            content: aiResponse.response,
          },
        ]);

      // Refresh messages from DB
      fetchMessages();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to send message",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {sessionTitle && (
        <div className="px-6 py-3 border-b border-border/50">
          <h3 className="font-medium text-sm text-muted-foreground truncate">{sessionTitle}</h3>
        </div>
      )}
      
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
              <p className="text-muted-foreground">
                {documentId
                  ? "Ask me anything about your document"
                  : "Upload a document to get started"}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                )}
                <Card
                  className={`p-4 max-w-[80%] ${
                    message.role === "assistant"
                      ? "bg-card/50 border-border/50"
                      : "bg-primary text-primary-foreground border-primary"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </Card>
                {message.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <User className="h-5 w-5 text-accent-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <Card className="p-4 bg-card/50 border-border/50">
                <Loader2 className="h-5 w-5 animate-spin" />
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border/50 p-4 bg-card/50 backdrop-blur">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={documentId ? "Ask about your document..." : "Start typing..."}
            className="min-h-[60px] max-h-[200px] resize-none"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-primary hover:bg-primary/90 h-[60px] px-6"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
