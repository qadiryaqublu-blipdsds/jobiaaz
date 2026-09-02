import React, { useState } from 'react';
import { JobOfferTemplate } from '../../types';
import { DEFAULT_OFFER_TEMPLATES, saveOfferTemplates } from '../../services/offerTemplateService';
import { X, Plus, Trash2, Edit3, Check, RotateCcw, FileText, Sparkles } from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface JobOfferTemplatesModalProps {
  templates: JobOfferTemplate[];
  onUpdateTemplates: (templates: JobOfferTemplate[]) => void;
  onClose: () => void;
}

export const JobOfferTemplatesModal: React.FC<JobOfferTemplatesModalProps> = ({
  templates,
  onUpdateTemplates,
  onClose,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<JobOfferTemplate>(
    templates[0] || DEFAULT_OFFER_TEMPLATES[0]
  );
  const [isEditing, setIsEditing] = useState(false);
  const [templateName, setTemplateName] = useState(selectedTemplate?.name || '');
  const [templateDesc, setTemplateDesc] = useState(selectedTemplate?.description || '');
  const [templateLang, setTemplateLang] = useState<'az' | 'en'>(selectedTemplate?.language || 'az');
  const [templateContent, setTemplateContent] = useState(selectedTemplate?.content || '');

  const handleSelect = (t: JobOfferTemplate) => {
    setSelectedTemplate(t);
    setTemplateName(t.name);
    setTemplateDesc(t.description);
    setTemplateLang(t.language);
    setTemplateContent(t.content);
    setIsEditing(false);
  };

  const handleSave = () => {
    const updated = templates.map((t) =>
      t.id === selectedTemplate.id
        ? {
            ...t,
            name: templateName,
            description: templateDesc,
            language: templateLang,
            content: templateContent,
            updatedAt: new Date().toISOString(),
          }
        : t
    );
    onUpdateTemplates(updated);
    saveOfferTemplates(updated);
    setSelectedTemplate({
      ...selectedTemplate,
      name: templateName,
      description: templateDesc,
      language: templateLang,
      content: templateContent,
    });
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    const newT: JobOfferTemplate = {
      id: `template-${Date.now()}`,
      name: 'Yeni Fərdi İş Təklifi Şablonu',
      description: 'Şirkətinizin xüsusi tələblərinə uyğunlaşdırılmış şablon.',
      language: 'az',
      content: DEFAULT_OFFER_TEMPLATES[0].content,
      isDefault: false,
    };
    const updated = [...templates, newT];
    onUpdateTemplates(updated);
    saveOfferTemplates(updated);
    handleSelect(newT);
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (templates.length <= 1) {
      alert('Ən azı 1 şablon qalmalıdır.');
      return;
    }
    const updated = templates.filter((t) => t.id !== id);
    onUpdateTemplates(updated);
    saveOfferTemplates(updated);
    handleSelect(updated[0]);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Bütün şablonları ilkin standart vəziyyətə qaytarmaq istədiyinizdən əminsiniz?')) {
      onUpdateTemplates(DEFAULT_OFFER_TEMPLATES);
      saveOfferTemplates(DEFAULT_OFFER_TEMPLATES);
      handleSelect(DEFAULT_OFFER_TEMPLATES[0]);
    }
  };

  const insertPlaceholder = (tag: string) => {
    setTemplateContent((prev) => prev + ` ${tag} `);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in text-xs">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                İş Təklifi Şablonlarının İdarə Edilməsi
              </h3>
              <p className="text-[11px] text-slate-500">
                AI və HR üçün rəsmi korporativ şablonlar, dəyişənlər və dillər
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar List + Editor */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 p-4 space-y-3 bg-slate-50 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider">Şablonlar</span>
              <button
                type="button"
                onClick={handleCreateNew}
                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Yeni</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {templates.map((t) => (
                <div
                  key={t.id}
                  onClick={() => handleSelect(t)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate.id === t.id
                      ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{t.name}</span>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-200 font-bold">
                      {t.language}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>İlkin vəziyyətə sıfırla</span>
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h4 className="text-sm font-bold text-slate-900">{templateName}</h4>
                <p className="text-slate-500">{templateDesc}</p>
              </div>

              <div className="flex items-center gap-2">
                {!selectedTemplate.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedTemplate.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title="Şablonu sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Dəyişiklikləri Yadda Saxla</span>
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Şablonun Adı</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sənədin Dili</label>
                <select
                  value={templateLang}
                  onChange={(e) => setTemplateLang(e.target.value as 'az' | 'en')}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                >
                  <option value="az">Azərbaycan Dili</option>
                  <option value="en">English (İngilis Dili)</option>
                </select>
              </div>
            </div>

            {/* Placeholder Pills Helper */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Dinamik Dəyişənlər (Klikləyərək mətndə yerləşdirin):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '{{candidate_name}}',
                  '{{position}}',
                  '{{department}}',
                  '{{company_name}}',
                  '{{start_date}}',
                  '{{gross_salary}}',
                  '{{net_salary}}',
                  '{{probation_period}}',
                  '{{work_location}}',
                  '{{working_schedule}}',
                  '{{annual_leave}}',
                  '{{bonus}}',
                  '{{benefits}}',
                  '{{additional_terms}}',
                  '{{hr_name}}',
                  '{{hr_position}}',
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertPlaceholder(tag)}
                    className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[10px] hover:bg-blue-100 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Body */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Şablonun Mətni</label>
              <textarea
                rows={12}
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl leading-relaxed outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Dynamic moving Jobia Logo at bottom */}
        <ModalBottomLogo
          tagline="Jobia.az Korporativ Təklif Şablonları Sistemi"
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
