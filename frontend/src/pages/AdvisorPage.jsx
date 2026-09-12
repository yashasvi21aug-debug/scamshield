import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw,
  BookOpen,
  MessageSquare,
  Shield,
  HelpCircle
} from 'lucide-react';
import { askAdvisor } from '../services/api';

export default function AdvisorPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      advisorMode: 'system-intro',
      content: `### 👋 FraudLens AI Cybersecurity Safety Advisor
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
  const [currentMode, setCurrentMode] = useState('AI Advisor');
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Advisor Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-[#464B71] text-white shadow-md">
            <Bot className="w-6 h-6 text-[#7CD5C7]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#464B71] tracking-tight">
                FraudLens AI Advisor
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#7CD5C7]/20 text-[#0F766E] border border-[#7CD5C7]/40">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse" />
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Conversational fraud prevention guidance & incident triage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setMessages([messages[0]])}
            className="px-3 py-2 rounded-xl bg-[#F2F2ED] border border-[#E2E2D9] text-[#2A2E45] hover:bg-white hover:border-[#118AB2] text-xs flex items-center gap-1.5 transition-colors font-medium shadow-xs"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="bg-white rounded-3xl border border-[#E2E2D9] shadow-sm flex flex-col h-[640px] overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-[#FBFBFA]/50">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                <div className={`p-2.5 rounded-2xl h-fit shrink-0 shadow-xs ${
                  isUser 
                    ? 'bg-[#118AB2] text-white' 
                    : 'bg-[#464B71] text-white'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Shield className="w-4 h-4 text-[#7CD5C7]" />}
                </div>

                {/* Message Bubble */}
                <div className={`p-4 sm:p-5 rounded-2xl text-xs leading-relaxed ${
                  isUser 
                    ? 'bg-[#118AB2] text-white rounded-tr-sm shadow-md' 
                    : 'bg-white border border-[#E2E2D9] text-[#2A2E45] rounded-tl-sm shadow-sm'
                }`}>
                  {/* Advisor Mode Tag */}
                  {!isUser && msg.advisorMode && msg.advisorMode !== 'system-intro' && (
                    <div className="mb-2.5 flex items-center gap-1.5">
                      {msg.isAiGenerated ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-600" /> AI Advisor ({msg.model || 'Gemini 3.6 Flash'})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F2F2ED] text-[#464B71] border border-[#E2E2D9] flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-[#118AB2]" /> Safety Knowledge Base
                        </span>
                      )}
                    </div>
                  )}

                  <div className={`prose prose-xs max-w-none space-y-2 whitespace-pre-wrap ${
                    isUser ? 'prose-invert text-white' : 'text-[#2A2E45]'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="p-2.5 rounded-2xl bg-[#464B71] text-white h-fit shrink-0">
                <Bot className="w-4 h-4 text-[#7CD5C7] animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E2E2D9] text-xs text-slate-600 flex items-center gap-2.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#118AB2] animate-ping" />
                <span className="font-medium">Synthesizing cybersecurity advisory analysis...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Shelf */}
        <div className="px-6 py-3 bg-[#F2F2ED]/70 border-t border-[#E2E2D9] flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-[11px] text-[#464B71] font-bold flex items-center gap-1 shrink-0 font-mono">
            <Sparkles className="w-3 h-3 text-[#118AB2]" /> TOPICS:
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2F2ED] text-slate-700 hover:text-[#118AB2] border border-[#E2E2D9] hover:border-[#118AB2]/40 text-xs whitespace-nowrap transition-all shadow-xs font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form Bar */}
        <div className="p-4 bg-white border-t border-[#E2E2D9]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2.5"
          >
            <input
              type="text"
              placeholder="Ask a question about a suspicious message, phone call, or incident..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 bg-[#F9F9F6] border border-[#E2E2D9] rounded-2xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-6 py-3 bg-[#118AB2] hover:bg-[#0E7490] text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#118AB2]/20 transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

