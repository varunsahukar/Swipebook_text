import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { DocumentUpload } from "@/components/DocumentUpload";
import { Loader2 } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setCurrentDocumentId(null);
  };

  const handleSelectSession = (sessionId: string, documentId: string | null) => {
    setCurrentSessionId(sessionId);
    setCurrentDocumentId(documentId);
  };

  const handleDocumentUploaded = (documentId: string) => {
    setCurrentDocumentId(documentId);
    setCurrentSessionId(null);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSessionCreated = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          currentSessionId={currentSessionId}
          refreshTrigger={refreshTrigger}
        />
        <main className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border/50 flex items-center px-4 bg-card/50 backdrop-blur">
            <SidebarTrigger className="mr-2" />
            <h2 className="text-lg font-semibold">swipeBook AI</h2>
          </header>
          
          <div className="flex-1 overflow-hidden">
            {!currentSessionId && !currentDocumentId ? (
              <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
            ) : (
              <ChatInterface
                sessionId={currentSessionId}
                documentId={currentDocumentId}
                onSessionCreated={handleSessionCreated}
              />
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
