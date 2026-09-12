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
      <div className="flex items-center justify-between p-5 rounded-3xl bg-white border border-[#E2E2D9] shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#118AB2]/10 text-[#118AB2] border border-[#118AB2]/30">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#464B71] flex items-center gap-2">
              FraudLens AI Advisor
              <span className="w-2 h-2 rounded-full bg-[#7CD5C7] animate-pulse" />
            </h2>
            <p className="text-xs text-slate-600">
              Conversational fraud prevention guidance & incident triage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-2 rounded-xl bg-[#F2F2ED] border border-[#E2E2D9] text-[#2A2E45] hover:bg-white hover:border-[#118AB2] text-xs flex items-center gap-1.5 transition-colors font-medium"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-white/90 rounded-3xl border border-[#E2E2D9] shadow-sm backdrop-blur-md p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div className={`p-2 rounded-xl h-fit shrink-0 ${
                isUser 
                  ? 'bg-[#118AB2] text-white' 
                  : 'bg-[#464B71]/10 text-[#464B71] border border-[#464B71]/20'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                isUser 
                  ? 'bg-[#118AB2] text-white rounded-tr-sm shadow-md' 
                  : 'bg-[#F9F9F6] border border-[#E2E2D9] text-[#2A2E45] rounded-tl-sm shadow-sm'
              }`}>
                {/* Advisor Mode Tag */}
                {!isUser && msg.advisorMode && msg.advisorMode !== 'system-intro' && (
                  <div className="mb-2 flex items-center gap-1.5">
                    {msg.isAiGenerated ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-purple-600" /> AI Advisor ({msg.model || 'LLM'})
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F2F2ED] text-[#464B71] border border-[#E2E2D9] flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#118AB2]" /> Local Safety Advisor (Knowledge Rules)
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
            <div className="p-2 rounded-xl bg-[#464B71]/10 text-[#464B71] border border-[#464B71]/20 h-fit">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-[#F9F9F6] border border-[#E2E2D9] text-xs text-slate-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#118AB2] animate-ping" />
              <span>Consulting advisor knowledge base...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[11px] text-[#464B71] font-semibold flex items-center gap-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#118AB2]" /> Topic:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2F2ED] text-slate-700 hover:text-[#118AB2] border border-[#E2E2D9] text-xs whitespace-nowrap transition-colors shadow-xs"
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
          className="flex-1 px-4 py-3.5 bg-white border border-[#E2E2D9] rounded-2xl text-xs text-[#2A2E45] placeholder:text-slate-400 focus:outline-none focus:border-[#118AB2] shadow-xs transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="px-6 py-3.5 bg-[#118AB2] hover:bg-[#0e7490] text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
}
