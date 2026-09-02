import React, { useState, useEffect } from 'react';
import { Vacancy, InterviewQuestion } from '../../types';
import { 
  X, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  MessageSquareQuote,
  RefreshCw
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface InterviewPrepModalProps {
  vacancy: Vacancy | null;
  onClose: () => void;
}

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({ vacancy, onClose }) => {
  if (!vacancy) return null;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Hamısı');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  useEffect(() => {
    fetchInterviewData();
  }, [vacancy]);

  const fetchInterviewData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vacancyTitle: vacancy.title,
          companyName: vacancy.companyName,
          requirements: vacancy.requirements,
        }),
      });
      const data = await res.json();
      setQuestions(data.questions || []);
      setTips(data.tips || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter(
    (q) => activeCategory === 'Hamısı' || q.category === activeCategory
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Müsahibə Kouçu</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{vacancy.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {vacancy.companyName} üçün gözlənilən suallar, cavablandırma taktikası və nümunə cavablar
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="font-bold text-slate-800 text-sm">Süni İntellekt Vakansiya Üzrə Müsahibə Bələdçisi Hazırlayır...</p>
              <p className="text-slate-400 text-xs">Şirkət tələbləri və texniki bacarıqlar analiz olunur</p>
            </div>
          ) : (
            <>
              {/* General Tips */}
              {tips.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Uğurlu Müsahibə Üçün Əsas Tövsiyələr</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                    {tips.map((t, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="font-bold text-blue-600">•</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-3">
                {['Hamısı', 'Texniki', 'Davranış və Situasiya', 'Şirkət Uyğunluğu'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeCategory === cat
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Questions Accordion */}
              <div className="space-y-3">
                {filteredQuestions.map((q, idx) => {
                  const isOpen = expandedIndex === idx;

                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs transition-all"
                    >
                      {/* Question bar */}
                      <button
                        onClick={() => setExpandedIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {q.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">{q.question}</h4>
                        </div>
                        <div className="p-1 text-slate-400 shrink-0">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isOpen && (
                        <div className="p-4 bg-slate-50/60 border-t border-slate-100 space-y-3 animate-fade-in">
                          {/* Why asked */}
                          <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <span className="font-bold text-slate-800 text-[11px] block mb-0.5">
                              🧐 İşəgötürən bu sualla nəyi yoxlayır?
                            </span>
                            <p className="text-slate-600 leading-relaxed text-[11px]">{q.whyAsked}</p>
                          </div>

                          {/* Suggested Answer Tip */}
                          <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200">
                            <span className="font-bold text-blue-900 text-[11px] block mb-0.5">
                              💡 Cavablandırma Taktikası (STAR Metodu):
                            </span>
                            <p className="text-blue-800 leading-relaxed text-[11px]">{q.suggestedAnswerTip}</p>
                          </div>

                          {/* Sample Azerbaijani Answer */}
                          <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg space-y-1">
                            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                              <MessageSquareQuote className="w-3.5 h-3.5" />
                              <span>Nümunəvi Güclü Cavab (Azərbaycan dilində):</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px] italic font-sans">
                              "{q.sampleAnswerAz}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Dynamic moving Jobia Logo at bottom */}
        <ModalBottomLogo
          tagline="Jobia.az AI Müsahibə Hazırlığı və Simulyasiyası"
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
