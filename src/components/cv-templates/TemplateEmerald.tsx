import React from 'react';
import { CVData } from '../../types';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Calendar, Award } from 'lucide-react';

interface TemplateProps {
  data: CVData;
}

export const TemplateEmerald: React.FC<TemplateProps> = ({ data }) => {
  const { personalInfo, experiences, education, skills, languages, projects, certificates } = data;

  return (
    <div id="cv-preview-emerald" className="bg-white text-slate-800 p-8 rounded-lg shadow-sm border border-slate-200 font-sans max-w-[850px] mx-auto min-h-[1050px]">
      {/* Header */}
      <div className="border-b-2 border-emerald-600 pb-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {personalInfo.photoUrl && (
              <img
                src={personalInfo.photoUrl}
                alt={personalInfo.fullName || 'Namizəd'}
                className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500 shadow-sm shrink-0 bg-slate-50"
                referrerPolicy="no-referrer"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{personalInfo.fullName || 'Ad Soyad'}</h1>
              <p className="text-lg font-semibold text-emerald-700 mt-1">{personalInfo.jobTitle || 'Vəzifə / İxtisas'}</p>
            </div>
          </div>
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap gap-y-2 gap-x-5 mt-4 text-xs text-slate-600">
          {personalInfo.email && (
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-600" />
              <span>{personalInfo.email}</span>
            </div>
          )}
          {personalInfo.phone && (
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{personalInfo.phone}</span>
            </div>
          )}
          {personalInfo.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>{personalInfo.address}</span>
            </div>
          )}
          {personalInfo.linkedin && (
            <div className="flex items-center gap-1.5">
              <Linkedin className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[180px]">{personalInfo.linkedin.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
          {personalInfo.github && (
            <div className="flex items-center gap-1.5">
              <Github className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[180px]">{personalInfo.github.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
          {personalInfo.portfolio && (
            <div className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span className="truncate max-w-[180px]">{personalInfo.portfolio.replace(/^https?:\/\//, '')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1 mb-2">
            Haqqımda
          </h2>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{personalInfo.summary}</p>
        </div>
      )}

      {/* 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column (Main: Experience, Projects) */}
        <div className="md:col-span-2 space-y-6">
          {/* Experience */}
          {experiences && experiences.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1 mb-3">
                İş Təcrübəsi
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-3 border-l-2 border-emerald-200">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-900">{exp.position}</h3>
                      <span className="text-[11px] font-medium text-emerald-700 whitespace-nowrap">
                        {exp.startDate} - {exp.current ? 'İndiyədək' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-600 mb-1">
                      {exp.company} {exp.location ? `• ${exp.location}` : ''}
                    </div>
                    {exp.description && (
                      <p className="text-[11px] text-slate-700 leading-relaxed whitespace-pre-line mt-1">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects && projects.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1 mb-3">
                Layihələr
              </h2>
              <div className="space-y-3">
                {projects.map((prj) => (
                  <div key={prj.id} className="bg-slate-50 p-3 rounded border border-slate-100">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-slate-900">{prj.title}</h3>
                      {prj.link && (
                        <span className="text-[10px] text-emerald-600 hover:underline truncate max-w-[140px]">
                          {prj.link.replace(/^https?:\/\//, '')}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{prj.description}</p>
                    {prj.technologies && prj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {prj.technologies.map((t, idx) => (
                          <span key={idx} className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column (Skills, Education, Languages, Certificates) */}
        <div className="space-y-6">
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1 mb-3">
                Bacarıqlar
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="text-[10px] font-medium bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education && education.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1 mb-3">
                Təhsil
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <h3 className="font-bold text-slate-900">{edu.institution}</h3>
                    <p className="text-emerald-700 font-medium">{edu.degree} {edu.fieldOfStudy ? `• ${edu.fieldOfStudy}` : ''}</p>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-0.5">
                      <span>{edu.startDate} - {edu.current ? 'Davam edir' : edu.endDate}</span>
                      {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1 mb-3">
                Dillər
              </h2>
              <div className="space-y-1.5">
                {languages.map((lng) => (
                  <div key={lng.id} className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800">{lng.language}</span>
                    <span className="text-slate-500 text-[11px]">{lng.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {certificates && certificates.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-200 pb-1 mb-3">
                Sertifikatlar
              </h2>
              <div className="space-y-2">
                {certificates.map((cert) => (
                  <div key={cert.id} className="text-xs">
                    <p className="font-bold text-slate-900">{cert.name}</p>
                    <p className="text-[11px] text-slate-500">{cert.issuer} {cert.issueDate ? `(${cert.issueDate})` : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
