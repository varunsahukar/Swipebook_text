import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, LogOut, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  document_id: string | null;
}

interface AppSidebarProps {
  onNewChat: () => void;
  onSelectSession: (sessionId: string, documentId: string | null) => void;
  currentSessionId: string | null;
  refreshTrigger: number;
}

export function AppSidebar({ onNewChat, onSelectSession, currentSessionId, refreshTrigger }: AppSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { open: sidebarOpen } = useSidebar();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, [refreshTrigger]);

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <Sidebar className={sidebarOpen ? "w-60" : "w-14"}>
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                swipeBook
              </span>
            )}
          </div>
          
          <Button
            onClick={onNewChat}
            className="w-full bg-accent hover:bg-accent/90 mb-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            {sidebarOpen && "New Chat"}
          </Button>
        </div>

        <SidebarGroup>
          {sidebarOpen && <SidebarGroupLabel>Chat History</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : sessions.length === 0 ? (
                sidebarOpen && (
                  <div className="px-4 py-2 text-sm text-muted-foreground">
                    No chats yet
                  </div>
                )
              ) : (
                sessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectSession(session.id, session.document_id)}
                      isActive={currentSessionId === session.id}
                      className="w-full"
                    >
                      <MessageSquare className="h-4 w-4 mr-2 flex-shrink-0" />
                      {sidebarOpen && (
                        <span className="truncate">{session.title}</span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {sidebarOpen && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
