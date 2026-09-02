import React from 'react';
import { CVData, CVTemplateType } from '../../types';
import { TemplateEmerald } from './TemplateEmerald';
import { TemplateClassic } from './TemplateClassic';
import { TemplateMinimal } from './TemplateMinimal';
import { TemplateTech } from './TemplateTech';

interface CVRendererProps {
  data: CVData;
  template: CVTemplateType;
  id?: string;
}

export const CVRenderer: React.FC<CVRendererProps> = ({ 
  data, 
  template,
  id = 'cv-document-export'
}) => {
  const renderTemplate = () => {
    switch (template) {
      case 'classic-corporate':
        return <TemplateClassic data={data} />;
      case 'minimal-indigo':
        return <TemplateMinimal data={data} />;
      case 'slate-tech':
        return <TemplateTech data={data} />;
      case 'modern-emerald':
      default:
        return <TemplateEmerald data={data} />;
    }
  };

  return (
    <div id={id} className="w-full bg-white print:p-0">
      {renderTemplate()}
    </div>
  );
};
