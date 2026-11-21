import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, ChevronRight, Send, Sparkles, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import type { SimulatorMeta } from '../types/simulator';
import type { TutorialStep } from '../types/tutorial';
import { answerTutorialQuestion } from '../utils/tutorialHelper';

interface SimulatorVirtualAssistantProps {
  meta: SimulatorMeta;
  steps: TutorialStep[];
  isTutorialOpen: boolean;
  onJumpToTutorialStep?: (stepIndex: number) => void;
}

interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestedStepIndex?: number;
  suggestedStepTitle?: string;
}

export function SimulatorVirtualAssistant({
  meta,
  steps,
  isTutorialOpen,
  onJumpToTutorialStep,
}: SimulatorVirtualAssistantProps) {
  const { language, pick } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [prevSimId, setPrevSimId] = useState(meta.id);
  const listRef = useRef<HTMLDivElement | null>(null);

  if (prevSimId !== meta.id) {
    setPrevSimId(meta.id);
    setIsOpen(false);
    setInput('');
    setMessages([]);
  }

  const quickQuestions = useMemo(() => {
    const collected: string[] = [];
    for (const step of steps) {
      if (!step.faqs) continue;
      for (const faq of step.faqs) {
        const qText = faq.q[language] || faq.q.en;
        if (!collected.includes(qText)) {
          collected.push(qText);
        }
        if (collected.length >= 3) break;
      }
      if (collected.length >= 3) break;
    }

    const fallbacks = [
      pick(
        'How do I use this simulator?',
        'Bagaimana cara menggunakan simulator ini?',
        'このシミュレータの使い方は？'
      ),
      pick(
        'How do I troubleshoot errors?',
        'Bagaimana cara troubleshoot kesalahan?',
        'エラーのトラブル対策は？'
      ),
    ];

    for (const fb of fallbacks) {
      if (collected.length < 4 && !collected.includes(fb)) {
        collected.push(fb);
      }
    }
    return collected;
  }, [language, pick, steps]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleAsk = useCallback(
    (rawQuestion: string) => {
      const trimmed = rawQuestion.trim();
      if (!trimmed) return;

      const fallbackStep: TutorialStep = steps[0] ?? {
        id: `${meta.id}-overview`,
        badge: { en: 'Overview', id: 'Ikhtisar', ja: '概要' },
        title: { en: meta.title, id: meta.title, ja: meta.title },
        description: {
          en: meta.description,
          id: meta.description,
          ja: meta.description,
        },
      };

      const reply = answerTutorialQuestion({
        question: trimmed,
        language,
        meta,
        currentStep: fallbackStep,
        currentStepIndex: 0,
        allSteps: steps,
      });

      const ts = Date.now();
      setInput('');
      setMessages((prev) => [
        ...prev,
        { id: `u-${ts}`, role: 'user', text: trimmed },
        {
          id: `a-${ts}`,
          role: 'assistant',
          text: reply.text,
          suggestedStepIndex: reply.suggestedStepIndex,
          suggestedStepTitle: reply.suggestedStepTitle,
        },
      ]);

      window.requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: 'smooth',
        });
      });
    },
    [language, meta, steps]
  );

  if (isTutorialOpen) {
    return null;
  }

  return (
    <div className="print:hidden">
      {/* Floating Chat Panel anchored bottom-left */}
      {isOpen && (
        <div
          role="dialog"
          aria-label={pick(
            'Virtual Lab Assistant',
            'Asisten Lab Virtual',
            'バーチャル実習アシスタント'
          )}
          className="animate-modal-enter fixed bottom-20 right-5 z-40 flex max-h-[min(520px,calc(100vh-7rem))] w-[min(370px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[26px] border border-[var(--md-outline-variant)]/75 bg-[var(--md-surface-container-low)] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5 border-b border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-extrabold text-[var(--md-on-surface)]">
                    {pick(
                      'Virtual Lab Assistant',
                      'Asisten Lab Virtual',
                      'バーチャルアシスタント'
                    )}
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--md-secondary-container)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--md-on-secondary-container)]">
                    <Sparkles className="h-2.5 w-2.5" />
                    {pick('Help', 'Bantu', 'ヘルプ')}
                  </span>
                </div>
                <p className="truncate text-[11px] text-[var(--md-on-surface-variant)]">
                  {meta.title}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={pick('Close assistant', 'Tutup asisten', 'アシスタントを閉じる')}
              className="glass-pill inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Body: Welcome + Quick Chips + Chat Thread */}
          <div
            ref={listRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            <div className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
                <Bot className="h-3.5 w-3.5" />
              </span>
              <div className="rounded-2xl border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] px-3 py-2 text-[var(--md-on-surface)]">
                <p className="text-[11px]">
                  {pick(
                    `Confused about any control or reading in ${meta.title}? Ask me anything, or tap a topic below!`,
                    `Bingung dengan kontrol atau pembacaan di ${meta.title}? Tanyakan apa saja, atau pilih topik di bawah!`,
                    `${meta.title}の操作や数値の読み方で迷ったら、下のボタンか入力欄から質問してください！`
                  )}
                </p>
              </div>
            </div>

            {/* Quick-ask chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleAsk(q)}
                  className="rounded-full border border-[var(--md-outline-variant)]/65 bg-[var(--md-surface-container)] px-2.5 py-1 text-left text-[11px] font-semibold text-[var(--md-on-surface-variant)] transition-colors hover:border-[var(--md-primary)]/50 hover:text-[var(--md-primary)]"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Conversation Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]">
                    <Bot className="h-3.5 w-3.5" />
                  </span>
                )}
                <div
                  className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3 py-2 text-[11px] ${
                    msg.role === 'user'
                      ? 'bg-[var(--md-primary)] text-[var(--md-on-primary)]'
                      : 'border border-[var(--md-outline-variant)]/55 bg-[var(--md-surface-container)] text-[var(--md-on-surface)]'
                  }`}
                >
                  <p>{msg.text}</p>
                  {typeof msg.suggestedStepIndex === 'number' &&
                    onJumpToTutorialStep && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          onJumpToTutorialStep(msg.suggestedStepIndex!);
                        }}
                        className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--md-secondary-container)] px-2.5 py-1 text-[10px] font-bold text-[var(--md-on-secondary-container)] transition-opacity hover:opacity-90"
                      >
                        {pick(
                          'Show feature on screen',
                          'Tunjukkan fitur di layar',
                          '画面でこの機能を表示'
                        )}
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk(input);
            }}
            className="flex items-center gap-2 border-t border-[var(--md-outline-variant)]/50 bg-[var(--md-surface-container)] px-3 py-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={pick(
                'Ask about a feature or error...',
                'Tanya fitur atau troubleshoot...',
                '機能やエラーについて質問...'
              )}
              className="min-w-0 flex-1 rounded-full border border-[var(--md-outline-variant)]/70 bg-[var(--md-surface-container-highest)] px-3.5 py-2 text-xs text-[var(--md-on-surface)] placeholder:text-[var(--md-on-surface-variant)]/70 focus:border-[var(--md-primary)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label={pick('Send question', 'Kirim pertanyaan', '質問を送信')}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--md-primary)] text-[var(--md-on-primary)] transition-opacity disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Bottom-Left Floating Assistant Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={pick(
          'Open Virtual Lab Assistant',
          'Buka Asisten Lab Virtual',
          'バーチャル実習アシスタントを開く'
        )}
        aria-expanded={isOpen}
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full border border-[var(--md-primary)]/35 bg-[var(--md-primary)] px-3.5 py-2.5 text-xs font-bold text-[var(--md-on-primary)] shadow-lg transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
      >
        <Bot className="h-4.5 w-4.5" />
        <span className="hidden sm:inline">
          {pick('Virtual Assistant', 'Asisten Virtual', 'アシスタント')}
        </span>
      </button>
    </div>
  );
}
