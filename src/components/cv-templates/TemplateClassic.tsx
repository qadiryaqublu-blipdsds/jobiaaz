import React from 'react';
import { CVData } from '../../types';

interface TemplateProps {
  data: CVData;
}

export const TemplateClassic: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates } = data;

  return (
    <div id="cv-preview-classic" className="bg-white text-slate-900 p-8 rounded-lg shadow-sm border border-slate-300 font-serif max-w-[850px] mx-auto min-h-[1050px]">
      {/* Centered Classic Header */}
      <div className="text-center border-b border-slate-400 pb-4 mb-6">
        {personalInfo.photoUrl && (
          <div className="flex justify-center mb-3">
            <img
              src={personalInfo.photoUrl}
              alt={personalInfo.fullName || 'Namizəd'}
              className="w-20 h-20 rounded-full object-cover border border-slate-300 shadow-2xs bg-slate-50"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-normal uppercase text-slate-900">{personalInfo.fullName || 'Ad Soyad'}</h1>
        <p className="text-base italic text-slate-700 mt-1 font-sans">{personalInfo.jobTitle || 'Vəzifə'}</p>

        {/* Contact line */}
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-slate-700 mt-3 font-sans">
          {personalInfo.address && <span>{personalInfo.address}</span>}
          {personalInfo.phone && (
            <>
              <span className="text-slate-400">•</span>
              <span>{personalInfo.phone}</span>
            </>
          )}
          {personalInfo.email && (
            <>
              <span className="text-slate-400">•</span>
              <span>{personalInfo.email}</span>
            </>
          )}
          {personalInfo.linkedin && (
            <>
              <span className="text-slate-400">•</span>
              <span>{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
            </>
          )}
          {personalInfo.portfolio && (
            <>
              <span className="text-slate-400">•</span>
              <span>{personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
            Peşəkar Xülasə
          </h2>
          <p className="text-xs text-slate-800 leading-relaxed text-justify">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experiences && experiences.length > 0 && (
        <div className="mb-6 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3 font-serif">
            İş Təcrübəsi
          </h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline">
                  <div className="text-xs font-bold text-slate-900">
                    {exp.position} <span className="font-normal text-slate-600">| {exp.company}</span>
                  </div>
                  <span className="text-xs text-slate-600 italic">
                    {exp.startDate} – {exp.current ? 'Hal-hazırda' : exp.endDate}
                  </span>
                </div>
                {exp.location && <div className="text-[11px] text-slate-500">{exp.location}</div>}
                {exp.description && (
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mt-1.5 pl-2">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className="mb-6 font-sans">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-3 font-serif">
            Təhsil
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-900">{edu.institution}</span>
                  <span className="text-slate-700"> — {edu.degree} {edu.fieldOfStudy ? `(${edu.fieldOfStudy})` : ''}</span>
                  {edu.gpa && <span className="text-slate-500 text-[11px] block">GPA: {edu.gpa}</span>}
                </div>
                <span className="text-slate-600 italic text-[11px]">
                  {edu.startDate} – {edu.current ? 'Davam edir' : edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills & Languages in classic clean rows */}
      <div className="grid grid-cols-2 gap-6 mb-6 font-sans">
        {skills && skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
              Bacarıqlar
            </h2>
            <p className="text-xs text-slate-800 leading-relaxed">
              {skills.map((s) => s.name).join(' • ')}
            </p>
          </div>
        )}

        {languages && languages.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
              Xarici Dillər
            </h2>
            <div className="text-xs text-slate-800 space-y-1">
              {languages.map((l) => (
                <div key={l.id} className="flex justify-between">
                  <span className="font-medium">{l.language}</span>
                  <span className="text-slate-600">{l.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projects & Certificates */}
      {(projects?.length > 0 || certificates?.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {projects && projects.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
                Əsas Layihələr
              </h2>
              <div className="space-y-2">
                {projects.map((p) => (
                  <div key={p.id} className="text-xs">
                    <span className="font-bold text-slate-900">{p.title}:</span>
                    <span className="text-slate-700 ml-1">{p.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {certificates && certificates.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1 mb-2 font-serif">
                Sertifikatlar
              </h2>
              <div className="space-y-1 text-xs">
                {certificates.map((c) => (
                  <div key={c.id} className="text-slate-800">
                    <span className="font-medium">{c.name}</span> — <span className="text-slate-600">{c.issuer}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
