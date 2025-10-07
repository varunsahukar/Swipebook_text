import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, FileText, MessageSquare, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg animate-glow">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              swipeBook
            </span>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary/90"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Learning</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Analyze Textbooks with AI
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your textbooks and get instant summaries, explanations, and answers to your questions powered by advanced AI
          </p>

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-lg px-8"
            >
              Start Analyzing
            </Button>
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              variant="outline"
              className="text-lg px-8"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur animate-fade-in">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Documents</h3>
            <p className="text-muted-foreground">
              Support for PDF, DOCX, and TXT files. Upload your textbooks and study materials easily.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Ask Questions</h3>
            <p className="text-muted-foreground">
              Chat with AI about your documents. Get explanations, summaries, and insights instantly.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border/50 bg-card/30 backdrop-blur animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Analysis</h3>
            <p className="text-muted-foreground">
              Powered by advanced AI to understand context and provide accurate, relevant answers.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center p-12 rounded-2xl border border-primary/20 bg-gradient-accent animate-fade-in">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your learning?</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Join thousands of students using AI to understand their textbooks better
          </p>
          <Button
            onClick={() => navigate("/auth")}
            size="lg"
            className="bg-background text-foreground hover:bg-background/90 text-lg px-8"
          >
            Get Started for Free
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <BookOpen className="h-5 w-5" />
            <span>© 2025 swipeBook. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
