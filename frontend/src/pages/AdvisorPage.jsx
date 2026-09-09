import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { askAdvisor } from '../services/api';

export default function AdvisorPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      advisorMode: 'system-intro',
      content: `### 👋 ScamShield Cybersecurity Safety Advisor
Ask questions regarding suspicious communications, emergency containment, or verification steps.

**Common Topics**:
- **Suspicious SMS messages** and unknown sender numbers
- **Containment steps** if you accidentally clicked a suspicious link or entered credentials
- **How to verify legitimate bank alerts** vs phishing scams
- **UPI safety rules** and remote screen-sharing risks (AnyDesk/TeamViewer)`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState('Checking mode...');
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    "What should I do if I clicked a phishing link?",
    "Someone asked me to scan a QR to receive payment",
    "How can I verify a bank KYC message?",
    "A caller wants me to install AnyDesk for support"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (customPrompt) => {
    const promptToSend = customPrompt || inputText;
    if (!promptToSend.trim() || loading) return;

    const newMessages = [
      ...messages,
      { role: 'user', content: promptToSend }
    ];

    setMessages(newMessages);
    setInputText('');
    setLoading(true);

    try {
      const historyContext = newMessages.slice(-5).map(m => ({ role: m.role, content: m.content }));
      const response = await askAdvisor(promptToSend, historyContext);
      
      setCurrentMode(response.advisorMode === 'ai-advisor' ? 'AI Advisor' : 'Local Safety Advisor');

      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: response.reply,
          advisorMode: response.advisorMode,
          isAiGenerated: response.isAiGenerated,
          model: response.model
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          advisorMode: 'local-safety-advisor',
          content: "⚠️ **Safety Notice**: Unable to consult advisor services right now. If experiencing an active financial emergency, please immediately freeze cards in your banking app and call the National Cyber Crime Helpline at 1930."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Advisor Header */}
      <div className="flex items-center justify-between p-5 rounded-3xl bg-cyber-900/80 border border-cyber-700/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              ScamShield Advisor
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400">
              Conversational fraud prevention guidance & incident triage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-2 rounded-xl bg-cyber-950 border border-cyber-800 text-slate-400 hover:text-white hover:border-cyan-400 text-xs flex items-center gap-1.5 transition-colors"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-cyber-900/60 rounded-3xl border border-cyber-700/80 backdrop-blur-md p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`p-2 rounded-xl h-fit shrink-0 ${
                isUser 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                  : 'bg-cyber-800 text-cyan-400 border border-cyber-700'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                isUser 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm shadow-md' 
                  : 'bg-cyber-950/80 border border-cyber-800 text-slate-200 rounded-tl-sm shadow-inner'
              }`}>
                {/* Advisor Mode Tag */}
                {!isUser && msg.advisorMode && msg.advisorMode !== 'system-intro' && (
                  <div className="mb-2 flex items-center gap-1.5">
                    {msg.isAiGenerated ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> AI Advisor ({msg.model || 'LLM'})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-cyber-800 text-slate-300 border border-cyber-700 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-cyan-400" /> Local Safety Advisor (Knowledge Rules)
                      </span>
                    )}
                  </div>
                )}

                <div className="prose prose-invert prose-xs max-w-none space-y-2 whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="p-2 rounded-xl bg-cyber-800 text-cyan-400 border border-cyber-700 h-fit">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-cyber-950/80 border border-cyber-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Consulting advisor knowledge base...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Topic:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl bg-cyber-900 hover:bg-cyber-800 text-slate-300 hover:text-cyan-300 border border-cyber-700 text-xs whitespace-nowrap transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask a question about a suspicious message, phone call, or incident..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 px-4 py-3.5 bg-cyber-900 border border-cyber-700 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
}
