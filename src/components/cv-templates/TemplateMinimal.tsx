import React from 'react';
import { CVData } from '../../types';

interface TemplateProps {
  data: CVData;
}

export const TemplateMinimal: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates } = data;

  return (
    <div id="cv-preview-minimal" className="bg-white text-slate-800 p-8 rounded-lg shadow-sm border border-slate-100 font-sans max-w-[850px] mx-auto min-h-[1050px]">
      {/* Top minimal header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-tight text-slate-900">
            <span className="font-semibold">{personalInfo.fullName?.split(' ')[0] || 'Ad'}</span>{' '}
            {personalInfo.fullName?.split(' ').slice(1).join(' ') || 'Soyad'}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-600 font-medium mt-1">
            <span>{personalInfo.jobTitle || 'Peşə'}</span>
            {personalInfo.address && <span className="text-slate-400">/ {personalInfo.address}</span>}
            {personalInfo.email && <span className="text-slate-600">/ {personalInfo.email}</span>}
            {personalInfo.phone && <span className="text-slate-600">/ {personalInfo.phone}</span>}
          </div>
        </div>
        {personalInfo.photoUrl && (
          <img
            src={personalInfo.photoUrl}
            alt={personalInfo.fullName || 'Namizəd'}
            className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0 bg-slate-50"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      <div className="h-px bg-slate-200 mb-6"></div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{personalInfo.summary}</p>
        </div>
      )}

      {/* Work experience */}
      {experiences && experiences.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Təcrübə</h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                <div className="text-slate-400 text-[11px]">
                  {exp.startDate} — {exp.current ? 'İndiyədək' : exp.endDate}
                </div>
                <div className="md:col-span-3">
                  <div className="font-semibold text-slate-900">{exp.position}</div>
                  <div className="text-slate-500 mb-1">{exp.company} {exp.location ? `, ${exp.location}` : ''}</div>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[11px]">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Təhsil</h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs">
                <div className="text-slate-400 text-[11px]">
                  {edu.startDate} — {edu.current ? 'Davam edir' : edu.endDate}
                </div>
                <div className="md:col-span-3">
                  <div className="font-semibold text-slate-900">{edu.institution}</div>
                  <div className="text-slate-500">{edu.degree} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</div>
                  {edu.gpa && <div className="text-slate-400 text-[10px]">GPA: {edu.gpa}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Bacarıqlar</h2>
            <div className="flex flex-wrap gap-1">
              {skills.map((s) => (
                <span key={s.id} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Dillər</h2>
            <div className="text-xs space-y-1">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between text-[11px]">
                  <span className="text-slate-700">{l.language}</span>
                  <span className="text-slate-400">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Layihələr</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((p) => (
              <div key={p.id} className="border-l-2 border-indigo-200 pl-2 text-xs">
                <div className="font-semibold text-slate-800">{p.title}</div>
                <p className="text-slate-600 text-[11px] mt-0.5">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
