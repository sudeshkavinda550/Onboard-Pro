import { useState, useRef, useEffect } from 'react';
import { useAIAgent } from '../../hooks/useAIAgent';
import { TOOL_META }  from '../../tools/onboardingTools';

const QUICK_PROMPTS = [
  "Who is overdue or behind?",
  "Company-wide progress stats",
  "List all employees",
  "Department analytics",
  "Who hasn't started yet?",
  "Show pending documents",
];

function RenderText({ text }) {
  if (!text) return null;
  return (
    <div className="space-y-1">
      {text.split('\n').map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i} className="leading-relaxed">
            {parts.map((part, j) =>
              j % 2 === 1
                ? <strong key={j} className="font-semibold">{part}</strong>
                : part
            )}
          </p>
        );
      })}
    </div>
  );
}

function ToolStep({ step }) {
  const [open, setOpen] = useState(false);
  const meta = TOOL_META[step.tool] || { icon: '🔧', label: step.tool, color: '#6366f1' };

  return (
    <div className="mt-1 rounded-lg border border-white/10 bg-white/5 text-xs overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-white/5 transition-colors"
      >
        <span>{meta.icon}</span>
        <span className="font-medium" style={{ color: meta.color }}>{meta.label}</span>
        <span className="ml-auto text-white/30 text-[10px]">{open ? '▲ hide' : '▼ show data'}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 border-t border-white/10 space-y-1">
          <p className="text-white/40 font-mono mt-2">Input: {JSON.stringify(step.input)}</p>
          <pre className="text-emerald-400 whitespace-pre-wrap font-mono leading-relaxed">{step.result}</pre>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg, userInitial }) {
  const isAI = msg.role === 'ai';
  return (
    <div className={`flex gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1 ${
        isAI
          ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30'
          : 'bg-gradient-to-br from-slate-600 to-slate-700 text-white'
      }`}>
        {isAI ? '✦' : userInitial}
      </div>

      <div className={`max-w-[80%] ${isAI ? '' : 'items-end flex flex-col'}`}>
        {isAI && msg.steps?.length > 0 && (
          <div className="mb-2 space-y-1 w-full">
            {msg.steps.map((step, i) => <ToolStep key={i} step={step} />)}
          </div>
        )}
        {msg.text && (
          <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isAI
              ? 'bg-white/8 text-slate-200 rounded-tl-sm border border-white/10'
              : 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white rounded-tr-sm shadow-lg shadow-violet-500/20'
          }`}>
            <RenderText text={msg.text} />
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm flex-shrink-0">✦</div>
      <div className="bg-white/8 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
        {[0,1,2].map(i => (
          <span key={i} className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}

const AIAssistant = () => {
  const { messages, thinking, sendMessage, clearChat } = useAIAgent();
  const [input, setInput] = useState('');
  const bottomRef         = useRef(null);
  const textareaRef       = useRef(null);

  const user        = JSON.parse(localStorage.getItem('user') || '{}');
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'H';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  function handleSend() {
    if (!input.trim() || thinking) return;
    sendMessage(input.trim());
    setInput('');
    textareaRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-center p-4">
      {/* Centered chat box with max width */}
      <div className="w-full max-w-4xl bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden flex flex-col"
           style={{ height: 'calc(100vh - 100px)' }}>

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-slate-300">AI Onboarding Assistant</span>
          </div>
          <button onClick={clearChat}
            className="text-xs text-slate-500 hover:text-slate-300 px-3 py-1 rounded-lg border border-white/10 hover:border-white/20 transition-all">
            Clear
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} userInitial={userInitial} />
          ))}
          {thinking && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2 border-t border-white/5">
          {QUICK_PROMPTS.map(p => (
            <button key={p}
              onClick={() => { setInput(p); textareaRef.current?.focus(); }}
              className="text-xs px-3 py-1.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/20 hover:bg-violet-500/25 transition-all whitespace-nowrap">
              {p}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4">
          <div className="flex gap-3 items-end bg-white/8 rounded-xl border border-white/10 px-4 py-3 focus-within:border-violet-500/50 focus-within:shadow-lg focus-within:shadow-violet-500/10 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about employees, tasks, analytics, send reminders…"
              className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 resize-none outline-none leading-relaxed"
              style={{ maxHeight: 120 }}
            />
            <button onClick={handleSend} disabled={thinking || !input.trim()}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/30">
              {thinking
                ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                : '↑'}
            </button>
          </div>
          <p className="text-center text-xs text-slate-600 mt-2">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
