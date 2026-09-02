import React from 'react';
import { JobOffer } from '../../types';
import { Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface OfferDocumentViewProps {
  id?: string;
  offer: Partial<JobOffer>;
  customContent?: string;
  showSignatureSection?: boolean;
}

export const OfferDocumentView: React.FC<OfferDocumentViewProps> = ({
  id = 'job-offer-document-render',
  offer,
  customContent,
  showSignatureSection = true,
}) => {
  const contentToDisplay = customContent || offer.generatedContent || '';
  const isAz = offer.language !== 'en';

  return (
    <div
      id={id}
      className="bg-white text-slate-900 font-sans p-8 sm:p-12 max-w-[820px] mx-auto border border-slate-200 shadow-sm print:border-none print:shadow-none print:p-6"
      style={{ minHeight: '1050px' }}
    >
      {/* Official Header */}
      <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6 mb-8 gap-4">
        <div className="flex items-center gap-4">
          {offer.companyLogo ? (
            <img
              src={offer.companyLogo}
              alt={offer.companyName}
              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl">
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
              {offer.companyName || 'ŞİRKƏT'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {offer.companyAddress || 'Bakı şəhəri, Azərbaycan Respublikası'}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {offer.companyEmail || 'hr@company.az'} • {offer.companyPhone || '+994 (12) 000-00-00'}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white text-[11px] font-bold rounded tracking-wider uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>{isAz ? 'RƏSMİ İŞ TƏKLİFİ' : 'EMPLOYMENT OFFER'}</span>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-2">
            Ref: <span className="text-slate-800 font-mono">JB-OFF-{offer.id ? offer.id.slice(-6).toUpperCase() : '2026-X'}</span>
          </p>
          <p className="text-xs text-slate-500">
            Tarix: <span className="text-slate-800 font-medium">{offer.createdAt ? new Date(offer.createdAt).toLocaleDateString('az-AZ') : new Date().toLocaleDateString('az-AZ')}</span>
          </p>
        </div>
      </div>

      {/* Recipient / Candidate Profile Card */}
      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            {isAz ? 'ÜNVANLANAN NAMİZƏD' : 'ADDRESSED CANDIDATE'}
          </span>
          <div className="text-base font-bold text-slate-900">{offer.candidateName || 'Namizəd'}</div>
          <div className="text-slate-600 mt-0.5 font-medium">{offer.candidateEmail}</div>
          <div className="text-slate-600 font-medium">{offer.candidatePhone}</div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
            {isAz ? 'TƏKLİF EDİLƏN VƏZİFƏ' : 'OFFERED POSITION'}
          </span>
          <div className="text-base font-bold text-blue-700">{offer.position || 'Mütəxəssis'}</div>
          <div className="text-slate-700 font-semibold mt-0.5">{offer.department || 'Departament'}</div>
          <div className="text-slate-500">Məşğulluq: {offer.employmentType || 'Tam ştat'}</div>
        </div>
      </div>

      {/* Structured Key Terms Matrix */}
      <div className="mb-8 border border-slate-200 rounded-xl overflow-hidden text-xs">
        <div className="bg-slate-900 text-white px-4 py-2.5 font-bold uppercase text-[11px] tracking-wider flex items-center justify-between">
          <span>{isAz ? 'Əməkdaşlığın Əsas Şərtləri' : 'Key Employment Terms & Remuneration'}</span>
          <span className="text-blue-300 text-[10px]">hireme.az Certified</span>
        </div>
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-200">
            <tr className="bg-white">
              <td className="py-2.5 px-4 font-semibold text-slate-600 w-1/3 bg-slate-50">
                {isAz ? 'Vəzifə və Şöbə' : 'Position & Dept'}
              </td>
              <td className="py-2.5 px-4 font-bold text-slate-900">
                {offer.position} — {offer.department}
              </td>
            </tr>
            <tr className="bg-white">
              <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50">
                {isAz ? 'İşə Başlama Tarixi' : 'Effective Start Date'}
              </td>
              <td className="py-2.5 px-4 font-bold text-slate-900">
                {offer.startDate || 'Razılaşma ilə'}
              </td>
            </tr>
            <tr className="bg-white">
              <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50">
                {isAz ? 'Aylıq Məcmu Əməkhaqqı (Gross)' : 'Monthly Gross Salary'}
              </td>
              <td className="py-2.5 px-4 font-bold text-slate-900">
                <span className="text-sm text-blue-700 font-extrabold">
                  {offer.grossSalary ? `${offer.grossSalary.toLocaleString('az-AZ')} AZN` : '0 AZN'}
                </span>
                <span className="text-[11px] text-slate-500 font-normal ml-2">
                  (Xalis Net: təxminən {offer.netSalary ? `${offer.netSalary.toLocaleString('az-AZ')} AZN` : '0 AZN'})
                </span>
              </td>
            </tr>
            <tr className="bg-white">
              <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50">
                {isAz ? 'Sınaq Müddəti' : 'Probationary Period'}
              </td>
              <td className="py-2.5 px-4 text-slate-800 font-medium">
                {offer.probationPeriod || '3 ay'}
              </td>
            </tr>
            <tr className="bg-white">
              <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50">
                {isAz ? 'İş Rejimi və Qrafik' : 'Working Schedule'}
              </td>
              <td className="py-2.5 px-4 text-slate-800 font-medium">
                {offer.workingSchedule || '09:00 - 18:00, 5/2'} ({offer.workLocation || 'Ofis'})
              </td>
            </tr>
            <tr className="bg-white">
              <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50">
                {isAz ? 'Əmək Məzuniyyəti' : 'Paid Annual Leave'}
              </td>
              <td className="py-2.5 px-4 text-slate-800 font-medium">
                {offer.annualLeave || '21 təqvim günü'}
              </td>
            </tr>
            {offer.bonus && (
              <tr className="bg-white">
                <td className="py-2.5 px-4 font-semibold text-slate-600 bg-slate-50">
                  {isAz ? 'Bonus / Mükafat' : 'Bonus / Incentives'}
                </td>
                <td className="py-2.5 px-4 text-slate-800 font-medium">
                  {offer.bonus}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Benefits pills */}
      {offer.benefits && offer.benefits.length > 0 && (
        <div className="mb-8 bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block mb-2">
            {isAz ? 'Təmin Edilən Korporativ Təminatlar və İmtiyazlar (Benefits)' : 'Company Benefits & Perks'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {offer.benefits.map((b, i) => (
              <div key={i} className="flex items-center gap-2 text-emerald-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full AI Generated Offer Body */}
      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4 mb-10 whitespace-pre-line border-t border-slate-200 pt-6">
        {contentToDisplay}
      </div>

      {/* Official Signatures Section */}
      {showSignatureSection && (
        <div className="mt-12 pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {isAz ? 'ŞİRKƏT NÜMAYƏNDƏSİ (İCRAÇI)' : 'AUTHORIZED EMPLOYER SIGNATURE'}
            </span>
            <div className="pt-8 border-b border-slate-400 flex items-end justify-between">
              <div>
                <div className="font-bold text-slate-900">{offer.hrContactPerson || 'HR Meneceri'}</div>
                <div className="text-slate-500 text-[11px]">{offer.hrContactPosition || 'İnsan Resursları'}</div>
              </div>
              <div className="font-serif italic text-slate-400 text-sm font-semibold pb-1">
                {offer.companyName}
              </div>
            </div>
            <div className="text-[10px] text-slate-400">
              İmza & Möhür Yeri / Tarix: {new Date().toLocaleDateString('az-AZ')}
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {isAz ? 'NAMİZƏD TƏRƏFİNDƏN QƏBUL (AKSEPT)' : 'CANDIDATE ACCEPTANCE'}
            </span>
            <div className="pt-8 border-b border-slate-400 flex items-end justify-between">
              <div>
                <div className="font-bold text-slate-900">{offer.candidateName || 'Namizəd'}</div>
                <div className="text-slate-500 text-[11px]">
                  Status: {offer.status === 'ACCEPTED' ? '✅ QƏBUL EDİLDİ' : (offer.status === 'DECLINED' ? '❌ İMTİNA EDİLDİ' : 'Gözləmədə')}
                </div>
              </div>
              {offer.acceptedAt && (
                <div className="text-emerald-600 font-mono text-[11px] font-bold">
                  {new Date(offer.acceptedAt).toLocaleDateString('az-AZ')}
                </div>
              )}
            </div>
            <div className="text-[10px] text-slate-400">
              Elektron Təsdiq & Rəqəmsal İmza
            </div>
          </div>
        </div>
      )}

      {/* Footer stamp */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span>Təhlükəsiz İş Təklifi Sənədi • jobia.az AI Platform</span>
        <span>Sənəd İD: {offer.id || 'DRAFT'}</span>
      </div>
    </div>
  );
};
