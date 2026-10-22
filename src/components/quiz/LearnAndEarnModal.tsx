import React, { useState, useEffect } from 'react';
import { quizService, QuizAttemptResult } from '../../services/quiz/quizService';
import { QuizQuestion, DailyAttemptRecord } from '../../content/quiz/quizTypes';
import { audioService } from '../../services/audio/audioService';
import {
  GraduationCap,
  X,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FastForward,
  ShieldAlert,
  Coins,
} from 'lucide-react';

export interface LearnAndEarnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearnAndEarnModal: React.FC<LearnAndEarnModalProps> = ({ isOpen, onClose }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResult | null>(null);
  const [dailyRecord, setDailyRecord] = useState<DailyAttemptRecord>(() => quizService.getDailyRecord());
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'mathematics' | 'gita'>('all');

  useEffect(() => {
    if (!isOpen) return;

    // Load questions based on category filter
    const all = quizService.getQuestions();
    const filtered =
      selectedCategory === 'all'
        ? all
        : all.filter((q) => q.category === selectedCategory);
    setQuestions(filtered);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAttemptResult(null);
    setDailyRecord(quizService.getDailyRecord());

    // Countdown to midnight
    const updateCountdown = () => {
      const ms = quizService.getTimeUntilMidnightMs();
      const hrs = Math.floor(ms / (1000 * 60 * 60));
      const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((ms % (1000 * 60)) / 1000);
      setTimeLeftStr(
        `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedCategory]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];
  const isDailyLimitReached = quizService.isDailyLimitReached();

  const handleSelectOption = (idx: number) => {
    if (attemptResult || isDailyLimitReached) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !currentQ || attemptResult) return;

    const res = quizService.submitAnswer(currentQ.id, selectedOption);
    setAttemptResult(res);
    setDailyRecord(quizService.getDailyRecord());

    if (res.isCorrect) {
      audioService.playSfx('quiz_correct');
      audioService.playSfx('coin_reward');
    } else {
      audioService.playSfx('quiz_incorrect');
    }
  };

  const handleSkip = () => {
    if (!currentQ || attemptResult) return;

    quizService.skipQuestion(currentQ.id);
    setDailyRecord(quizService.getDailyRecord());
    handleNext();
  };

  const handleNext = () => {
    setSelectedOption(null);
    setAttemptResult(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none overflow-y-auto"
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#1c140d] via-[#120d08] to-[#080503] border-2 border-[#d4af37]/60 shadow-2xl p-5 sm:p-7 text-[#e8ded1] my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#d4af37]/30">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#ffd700]" />
            <h3 id="quiz-modal-title" className="text-base sm:text-lg font-cinzel font-bold text-[#f5ecd8]">
              Learn & Earn: Wisdom of Bharat
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quiz dialog"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[#c8b69b] hover:text-[#ffd700] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Daily Limit & Reset Timing Banner */}
        <div className="my-3 p-3 rounded-2xl bg-[#090604] border border-[#d4af37]/25 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffd700] animate-pulse" />
            <div>
              <span className="text-[#c8b69b] block text-[10px] uppercase font-cinzel tracking-wider">
                Daily Quota (Max 10)
              </span>
              <strong className="text-white font-mono text-sm">
                {dailyRecord.attemptsCount} / 10 Attempted
              </strong>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[#c8b69b] block text-[10px] uppercase font-cinzel tracking-wider flex items-center gap-1 justify-end">
              <Clock className="w-3 h-3 text-[#f59e0b]" />
              Resets In
            </span>
            <span className="font-mono text-xs text-[#fef08a] font-semibold">{timeLeftStr}</span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-1.5 p-1 bg-[#140e08] rounded-xl border border-[#d4af37]/20 mb-3 text-xs">
          {(['all', 'gita', 'mathematics'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`flex-1 py-1.5 rounded-lg font-cinzel text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] shadow-sm'
                  : 'text-[#c8b69b] hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Wisdom' : cat === 'gita' ? 'Bhagavad Gita' : 'Mathematics'}
            </button>
          ))}
        </div>

        {/* Daily Limit Reached Notice */}
        {isDailyLimitReached ? (
          <div className="my-6 p-6 rounded-2xl bg-[#1f150d] border border-[#f59e0b]/50 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#ffd700] mx-auto animate-bounce" />
            <h4 className="text-base font-cinzel font-bold text-white">Daily Quota Fulfilled!</h4>
            <p className="text-xs text-[#dfd3c3] leading-relaxed">
              You have completed your 10 learning attempts for today and earned{' '}
              <strong className="text-[#ffd700]">{dailyRecord.coinsEarnedToday} Sacred Coins</strong>!
              Return after midnight for fresh challenges.
            </p>
          </div>
        ) : currentQ ? (
          /* Active Question Card */
          <div className="space-y-3.5">
            {/* Shloka Snippet for Gita Questions */}
            {currentQ.shlokaSnippet && (
              <div className="p-3 rounded-xl bg-[#0b121e] border border-[#38bdf8]/40 shadow-inner">
                <span className="text-[10px] text-[#38bdf8] font-cinzel tracking-wider uppercase font-bold block mb-1">
                  Sacred Shloka Snippet:
                </span>
                <p className="text-xs font-cinzel font-bold text-[#ffd700] italic leading-relaxed whitespace-pre-line text-center">
                  "{currentQ.shlokaSnippet}"
                </p>
              </div>
            )}

            {/* Question Text */}
            <p className="text-sm text-white font-medium text-left leading-relaxed">
              {currentQ.question}
            </p>

            {/* 4 Options Grid */}
            <div className="grid grid-cols-1 gap-2">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedOption === optIdx;
                const isCorrect = optIdx === currentQ.correctAnswerIndex;
                const showFeedback = attemptResult !== null;

                let btnStyle = 'bg-[#150f0a] border-[#d4af37]/25 text-[#dfd3c3] hover:bg-[#25180f]';

                if (showFeedback) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/90 border-emerald-500 text-emerald-200 font-bold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-200';
                  } else {
                    btnStyle = 'bg-[#150f0a]/50 border-gray-800 text-gray-500 opacity-60';
                  }
                } else if (isSelected) {
                  btnStyle = 'bg-[#d4af37]/20 border-[#ffd700] text-white font-semibold ring-1 ring-[#ffd700]';
                }

                return (
                  <button
                    key={`opt-${currentQ.id}-${optIdx}`}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    disabled={Boolean(attemptResult)}
                    className={`min-h-[44px] w-full text-left px-3.5 py-2.5 rounded-xl border text-xs leading-relaxed transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {showFeedback && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {showFeedback && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Post-Attempt Explanation Box */}
            {attemptResult && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed text-left animate-in fade-in duration-300 ${
                  attemptResult.isCorrect
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                    : 'bg-rose-950/40 border-rose-500/50 text-rose-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  {attemptResult.isCorrect ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                      <span>Correct! +{attemptResult.coinsEarned} Sacred Coins Awarded</span>
                    </>
                  ) : (
                    <>
                      <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
                      <span>Explanation:</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-[#dfd3c3]">{attemptResult.explanation}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              {!attemptResult ? (
                <>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="min-h-[44px] px-4 py-2 text-xs font-cinzel text-[#c8b69b] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={selectedOption === null}
                    className={`min-h-[44px] px-6 py-2 rounded-xl font-cinzel font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                      selectedOption !== null
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] cursor-pointer hover:brightness-110 active:scale-95'
                        : 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
                    }`}
                  >
                    Submit Answer
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="min-h-[44px] w-full px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#b45309] text-[#1c1510] font-cinzel font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="py-6 text-center text-xs text-[#c8b69b] italic">No questions available in this category.</p>
        )}

        {/* Security & Client-Storage Notice */}
        <div className="mt-4 pt-3 border-t border-[#d4af37]/20 flex items-start gap-2 text-[10px] text-[#c8b69b]/80 text-left leading-relaxed">
          <ShieldAlert className="w-3.5 h-3.5 text-[#f59e0b] shrink-0 mt-0.5" />
          <span>
            Prototype Notice: Daily quiz limits and coins are saved in client storage for offline demonstration. Production systems must enforce attempt quotas and coin verification server-side.
          </span>
        </div>
      </div>
    </div>
  );
};
