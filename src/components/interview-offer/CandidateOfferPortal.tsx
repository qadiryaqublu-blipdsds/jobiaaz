import React, { useState, useEffect } from 'react';
import { JobOffer, OfferAuditLog } from '../../types';
import { OfferDocumentView } from './OfferDocumentView';
import { downloadJobOfferPDF } from '../../services/offerPdfService';
import { 
  CheckCircle2, 
  XCircle, 
  Download, 
  Building2, 
  Calendar, 
  DollarSign, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Send, 
  Loader2, 
  ChevronRight, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface CandidateOfferPortalProps {
  offer: JobOffer;
  onUpdateOfferStatus: (offerId: string, status: any, reason?: any, auditLog?: OfferAuditLog) => void;
  onBackToApp?: () => void;
}

export const CandidateOfferPortal: React.FC<CandidateOfferPortalProps> = ({
  offer,
  onUpdateOfferStatus,
  onBackToApp,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineCategory, setDeclineCategory] = useState<'Salary' | 'Position' | 'Start Date' | 'Another Offer' | 'Personal Reasons' | 'Other'>('Another Offer');
  const [declineText, setDeclineText] = useState('');
  const [candidateNotes, setCandidateNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Automatically log viewed event when candidate opens the portal
  useEffect(() => {
    if (offer.status === 'SENT') {
      const log: OfferAuditLog = {
        id: `log-${Date.now()}`,
        offerId: offer.id,
        candidateName: offer.candidateName,
        action: 'OFFER_VIEWED',
        user: `${offer.candidateName} (Namizəd)`,
        timestamp: new Date().toISOString(),
        details: 'Namizəd iş təklifi portalına daxil oldu və sənədi nəzərdən keçirdi.',
      };
      onUpdateOfferStatus(offer.id, 'VIEWED', undefined, log);
    }
  }, [offer.id]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      await downloadJobOfferPDF('candidate-offer-doc', offer);
    } catch (e) {
      console.error('PDF error', e);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleConfirmAccept = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      const log: OfferAuditLog = {
        id: `log-${Date.now()}`,
        offerId: offer.id,
        candidateName: offer.candidateName,
        action: 'OFFER_ACCEPTED',
        user: `${offer.candidateName} (Namizəd)`,
        timestamp: now,
        details: `Namizəd təklifi rəsmən qəbul etdi. Əlavə qeyd: ${candidateNotes || 'Qeyd yoxdur.'}`,
      };

      onUpdateOfferStatus(offer.id, 'ACCEPTED', undefined, log);
      setIsProcessing(false);
      setShowAcceptModal(false);
      setActionFeedback('Təbriklər! Siz rəsmi iş təklifini qəbul etdiniz. Şirkətin HR komandası tezliklə sizinlə əlaqə saxlayacaq.');
    }, 600);
  };

  const handleConfirmDecline = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const now = new Date().toISOString();
      const log: OfferAuditLog = {
        id: `log-${Date.now()}`,
        offerId: offer.id,
        candidateName: offer.candidateName,
        action: 'OFFER_DECLINED',
        user: `${offer.candidateName} (Namizəd)`,
        timestamp: now,
        details: `Namizəd təklifdən imtina etdi. Səbəb kateqoriyası: ${declineCategory}. Şərh: ${declineText || 'Yoxdur.'}`,
      };

      onUpdateOfferStatus(
        offer.id,
        'DECLINED',
        { category: declineCategory, text: declineText },
        log
      );
      setIsProcessing(false);
      setShowDeclineModal(false);
      setActionFeedback('Qərarınız qeydə alındı və şirkətin HR departamentinə çatdırıldı.');
    }, 600);
  };

  const isAz = offer.language !== 'en';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation / Back */}
        {onBackToApp && (
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToApp}
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>jobia.az Portala Qayıt</span>
            </button>
            <div className="text-xs text-slate-500 font-medium">
              jobia.az Təhlükəsiz Namizəd Portalı
            </div>
          </div>
        )}

        {/* Hero Banner with Company & Status */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Rəsmi İş Təklifi Portalı</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Hörmətli {offer.candidateName}, Təbriklər!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              <span className="font-bold text-white">{offer.companyName}</span> şirkəti Sizə <span className="text-blue-400 font-bold">{offer.position}</span> vəzifəsini təklif edir. Təklifin tam detalları ilə aşağıda tanış ola bilərsiniz.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shrink-0 space-y-3 text-center sm:text-right">
            <div className="text-xs text-slate-400">Təklifin Cari Statusu:</div>
            <div>
              {offer.status === 'ACCEPTED' ? (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold rounded-lg inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  QƏBUL EDİLDİ
                </span>
              ) : offer.status === 'DECLINED' ? (
                <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-400/30 text-xs font-bold rounded-lg inline-flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  İMTİNA EDİLDİ
                </span>
              ) : (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold rounded-lg inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  CAVAB GÖZLƏNİLİR
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              Göndərildi: {offer.sentAt ? new Date(offer.sentAt).toLocaleDateString('az-AZ') : 'Yeni'}
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-900 font-bold text-xs flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Quick Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Aylıq Əməkhaqqı (Gross)</span>
            <div className="text-lg font-black text-slate-900">{offer.grossSalary.toLocaleString('az-AZ')} AZN</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Net: ~{offer.netSalary.toLocaleString('az-AZ')} AZN</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">İşə Başlama Tarixi</span>
            <div className="text-lg font-black text-blue-700">{offer.startDate}</div>
            <span className="text-[11px] text-slate-500">{offer.employmentType}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Sınaq Müddəti</span>
            <div className="text-lg font-black text-slate-900">{offer.probationPeriod}</div>
            <span className="text-[11px] text-slate-500">Məzuniyyət: {offer.annualLeave}</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">İş Yeri</span>
            <div className="text-sm font-bold text-slate-900 truncate">{offer.workLocation || 'Bakı, Azərbaycan'}</div>
            <span className="text-[11px] text-slate-500 truncate block">{offer.workingSchedule}</span>
          </div>
        </div>

        {/* Main Action Bar for Candidate */}
        {offer.status !== 'ACCEPTED' && offer.status !== 'DECLINED' && (
          <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-blue-600 shadow-md flex flex-wrap items-center justify-between gap-4 sticky top-4 z-40">
            <div>
              <h3 className="text-sm font-bold text-slate-900">İş Təklifinə Rəsmi Cavabınız</h3>
              <p className="text-xs text-slate-500">
                Təklifi dərhal qəbul edə, PDF yükləyə və ya rəsmi imtina edə bilərsiniz.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                <span>Rəsmi PDF Yüklə</span>
              </button>

              <button
                onClick={() => setShowDeclineModal(true)}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors"
              >
                İmtina Et
              </button>

              <button
                onClick={() => setShowAcceptModal(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Təklifi Qəbul Et</span>
              </button>
            </div>
          </div>
        )}

        {/* Official Document Render */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-300">
          <OfferDocumentView
            id="candidate-offer-doc"
            offer={offer}
          />
        </div>

        {/* Dynamic moving Jobia Logo at bottom of Offer Portal */}
        <div className="rounded-xl overflow-hidden border border-slate-200">
          <ModalBottomLogo
            tagline="Jobia.az Rəsmi Namizəd Təklif Portalı və E-İmza"
            variant="light"
            size="xs"
          />
        </div>
      </div>

      {/* Accept Offer Confirmation Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in text-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">İş Təklifini Qəbul Etməyə Əminsiniz?</h3>
              <p className="text-slate-600 leading-relaxed">
                Təklifi qəbul etdikdən sonra bu rəsmi qərarınız <span className="font-bold text-slate-900">{offer.companyName}</span> şirkətinə və HR komandasına bildiriləcək.
              </p>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-700">İşəgötürənə Qeydiniz və ya Təşəkkürünüz (İstəyə bağlı):</label>
              <textarea
                rows={2}
                value={candidateNotes}
                onChange={(e) => setCandidateNotes(e.target.value)}
                placeholder="Məsələn: Təklif üçün təşəkkür edirəm, qeyd olunan tarixdə işə başlamağa hazıram!"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg resize-none outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100"
              >
                Geri
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Bəli, Təklifi Qəbul Edirəm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Offer Confirmation Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-fade-in text-xs">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">İş Təklifindən İmtina Edirsiniz?</h3>
              <p className="text-slate-600 leading-relaxed">
                İmtina səbəbini bildirməyiniz şirkətin proseslərini təkmilləşdirməsinə kömək edəcək.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Əsas İmtina Səbəbi:</label>
                <select
                  value={declineCategory}
                  onChange={(e) => setDeclineCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="Another Offer">Digər şirkətdən təklifi qəbul etdim</option>
                  <option value="Salary">Əməkhaqqı gözləntilərimə uyğun gəlmədi</option>
                  <option value="Position">Vəzifə və öhdəliklər uyğun deyil</option>
                  <option value="Start Date">İşə başlama tarixi uyğun deyil</option>
                  <option value="Personal Reasons">Şəxsi / ailəvi səbəblər</option>
                  <option value="Other">Digər səbəb</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Əlavə Qeyd (İstəyə bağlı):</label>
                <textarea
                  rows={2}
                  value={declineText}
                  onChange={(e) => setDeclineText(e.target.value)}
                  placeholder="Ətraflı izahat..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg resize-none outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100"
              >
                Geri
              </button>
              <button
                type="button"
                onClick={handleConfirmDecline}
                disabled={isProcessing}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                <span>İmtinanı Təsdiqlə</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
