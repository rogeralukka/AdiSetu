import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { cannedQuestions } from '../data/mockData';
import Modal from './Modal';
import { MessageCircle, Send, Bot, Sparkles, HelpCircle } from 'lucide-react';

export default function ChatSheet() {
  const { selectedSchemeIds, currentStudent } = useApp();
  // Questions about one student's own application are shown only to that student.
  const visibleQuestions = cannedQuestions.filter((q) => !q.studentId || q.studentId === currentStudent?.id);
  const ownsQuestion = (q) => !q.studentId || q.studentId === currentStudent?.id;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Johar! I am the AdiSetu Assistant (demo with sample answers). How can I help you with your tribal scholarship applications, DBT bank seeding, or document wallet today?",
      time: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [messagesScrolled, setMessagesScrolled] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setMessagesScrolled(false);
    }
  }, [isOpen]);

  // Hide FAB if batch apply action bar is visible to avoid overlapping
  if (selectedSchemeIds.length > 0 && !isOpen) {
    return null;
  }

  const handleSelectQuestion = (q) => {
    // Add user question
    const userMsg = {
      sender: 'user',
      text: q.question,
      time: 'Just now',
    };
    
    // Add canned bot response
    const botMsg = {
      sender: 'bot',
      text: q.answer,
      time: 'Just now',
      tags: q.tags,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const query = inputValue.trim();
    const userMsg = {
      sender: 'user',
      text: query,
      time: 'Just now',
    };

    // Find best match or fallback response
    const lower = query.toLowerCase();
    let replyText = "For specific scholarship eligibility or DBT status inquiries, you can check your Updates tab or verify your documents directly in the Document Wallet.";
    
    if (ownsQuestion(cannedQuestions[0]) && (lower.includes('action needed') || lower.includes('dbt') || lower.includes('aadhaar') || lower.includes('bank'))) {
      replyText = cannedQuestions[0].answer;
    } else if (ownsQuestion(cannedQuestions[1]) && (lower.includes('caste') || lower.includes('document') || lower.includes('reuse') || lower.includes('expire'))) {
      replyText = cannedQuestions[1].answer;
    } else if (lower.includes('batch') || lower.includes('multiple') || lower.includes('select')) {
      replyText = cannedQuestions[2].answer;
    } else if (lower.includes('top class') || lower.includes('income') || lower.includes('limit') || lower.includes('iit')) {
      replyText = cannedQuestions[3].answer;
    } else {
      replyText = `Thank you for your question. AdiSetu brings ST scholarships (Post-Matric, Pre-Matric, Top Class, NFST, NOS and other schemes) into one place. You can apply to one scheme, or select several, from your Schemes tab. A student can hold only one scholarship at a time.`;
    }

    const botMsg = {
      sender: 'bot',
      text: replyText,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputValue('');
  };

  return (
    <>
      {/* Floating Action Button (bottom-right) */}
      {!isOpen && (
        <button
          type="button"
          aria-label="Open Ask AdiSetu chat assistant"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-24 sm:bottom-[100px] right-3 sm:right-[max(0.75rem,calc((100vw-28rem)/2+0.75rem))] z-40 w-13 h-13 p-3.5 rounded-full bg-accent text-white shadow-card hover:opacity-95 active:scale-95 transition-all flex items-center justify-center group"
        >
          <MessageCircle size={22} className="stroke-[2.2]" />
          <span className="sr-only">Ask AdiSetu</span>
        </button>
      )}

      {/* Floating Centered Modal with borderless shadowed header */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Ask AdiSetu"
        subtitle="Tribal Scholarship & DBT Support"
        headerBorder={false}
        headerShadow={true}
        headerExtra={
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-soft text-accent-dark font-semibold">
            DEMO
          </span>
        }
        maxWidth="max-w-md"
      >
        {/* Chat Messages Body with scroll-aware top fade mask & floating bottom fade mask */}
        <div className="relative flex-1 flex flex-col min-h-0">
          {/* Pinned top gradient fade mask directly under modal header */}
          <div 
            className={`fade-mask ${messagesScrolled ? 'visible' : ''} absolute top-0 left-0 right-0 h-10 z-10 bg-gradient-to-b from-surface to-transparent`} 
            aria-hidden="true" 
          />

          <div 
            onScroll={(e) => setMessagesScrolled(e.target.scrollTop > 6)}
            className="flex-1 overflow-y-auto px-4 pt-4 pb-8 space-y-3.5 text-xs max-h-[54vh] custom-scrollbar"
            style={{
              maskImage: 'linear-gradient(to bottom, black 0px, black calc(100% - 52px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 0px, black calc(100% - 52px), transparent 100%)',
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-[14px] px-3.5 py-2.5 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-accent text-white rounded-br-none shadow-xs'
                      : 'bg-bg text-text rounded-bl-none border border-border/80'
                  }`}
                >
                  {msg.text}
                  {msg.tags && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {msg.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface text-muted border border-border"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted mt-1 px-1">
                  {msg.time}
                </span>
              </div>
            ))}

            {/* Quick Questions Suggestions */}
            <div className="pt-2">
              <div className="section-label mb-2 flex items-center gap-1 text-[10.5px]">
                <Sparkles size={12} className="text-accent" />
                <span>Frequently Asked Questions</span>
              </div>
              <div className="space-y-1.5">
                {visibleQuestions.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleSelectQuestion(q)}
                    className="w-full text-left p-2 rounded-lg bg-bg hover:bg-accent-soft/40 border border-border/60 text-xs text-text transition-colors flex items-center justify-between group"
                  >
                    <span className="line-clamp-1 group-hover:text-accent font-medium">
                      {q.question}
                    </span>
                    <HelpCircle size={14} className="text-muted flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AEGIS-Style Floating Input Card (Inset with margins, elevated background, soft shadow) */}
        <div className="px-3.5 pb-3.5 pt-1.5 bg-transparent relative z-20">
          <form 
            onSubmit={handleSend} 
            className="flex items-center gap-2 p-1.5 pl-3.5 bg-surface dark:bg-[#252525] border border-border/80 dark:border-white/[0.08] rounded-xl shadow-[0_4px_20px_rgba(20,20,15,0.08),0_1px_4px_rgba(20,20,15,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-all focus-within:border-accent/70 focus-within:ring-1 focus-within:ring-accent/20"
          >
            <input
              type="text"
              placeholder="Ask about scholarships, documents, DBT..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent py-1.5 text-xs text-text placeholder-muted focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all flex-shrink-0 shadow-xs"
              disabled={!inputValue.trim()}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}
