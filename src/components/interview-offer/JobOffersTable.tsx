import React, { useState } from 'react';
import { JobOffer, OfferStatus, OfferAuditLog } from '../../types';
import { downloadJobOfferPDF } from '../../services/offerPdfService';
import { OfferDocumentView } from './OfferDocumentView';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Send, 
  Download, 
  Eye, 
  History, 
  Search, 
  Filter, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  X,
  Loader2
} from 'lucide-react';

interface JobOffersTableProps {
  offers: JobOffer[];
  auditLogs: OfferAuditLog[];
  onOpenOfferWorkflow: (offer: JobOffer) => void;
  onOpenAuditLog: (offerId: string, candidateName: string) => void;
  onResendOffer: (offer: JobOffer) => void;
  onOpenCandidatePortal: (offer: JobOffer) => void;
}

export const JobOffersTable: React.FC<JobOffersTableProps> = ({
  offers,
  auditLogs,
  onOpenOfferWorkflow,
  onOpenAuditLog,
  onResendOffer,
  onOpenCandidatePortal,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewingOffer, setViewingOffer] = useState<JobOffer | null>(null);
  const [isDownloadingId, setIsDownloadingId] = useState<string | null>(null);
  const [copiedTokenId, setCopiedTokenId] = useState<string | null>(null);

  // Status stats
  const totalCount = offers.length;
  const sentCount = offers.filter((o) => o.status === 'SENT' || o.status === 'VIEWED').length;
  const acceptedCount = offers.filter((o) => o.status === 'ACCEPTED').length;
  const declinedCount = offers.filter((o) => o.status === 'DECLINED').length;
  const draftCount = offers.filter((o) => o.status === 'DRAFT' || o.status === 'PENDING_APPROVAL').length;

  const filteredOffers = offers.filter((offer) => {
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q ||
      offer.candidateName.toLowerCase().includes(q) ||
      offer.candidateEmail.toLowerCase().includes(q) ||
      offer.position.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OfferStatus) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold flex items-center gap-1 text-[10px]">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            QƏBUL EDİLDİ
          </span>
        );
      case 'DECLINED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 font-bold flex items-center gap-1 text-[10px]">
            <XCircle className="w-3 h-3 text-red-600" />
            İMTİNA EDİLDİ
          </span>
        );
      case 'SENT':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 font-bold flex items-center gap-1 text-[10px]">
            <Send className="w-3 h-3 text-blue-600" />
            GÖNDƏRİLDİ
          </span>
        );
      case 'VIEWED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 font-semibold flex items-center gap-1 text-[10px]">
            <Eye className="w-3 h-3 text-purple-600" />
            BAXILDI
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-semibold flex items-center gap-1 text-[10px]">
            <Clock className="w-3 h-3 text-amber-600" />
            TƏSDİQ GÖZLƏYİR
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-medium flex items-center gap-1 text-[10px]">
            <FileText className="w-3 h-3 text-slate-500" />
            QARALAMA (DRAFT)
          </span>
        );
    }
  };

  const handleDownloadPDF = async (offer: JobOffer) => {
    setIsDownloadingId(offer.id);
    try {
      setViewingOffer(offer);
      // Let modal render then download
      await new Promise((r) => setTimeout(r, 150));
      await downloadJobOfferPDF('table-view-job-offer-doc', offer);
    } catch (e) {
      console.error('PDF error', e);
      window.print();
    } finally {
      setIsDownloadingId(null);
    }
  };

  const handleCopyLink = (token: string, offerId: string) => {
    const link = `${window.location.origin}/?offerToken=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedTokenId(offerId);
    setTimeout(() => setCopiedTokenId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Metric Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Cəmi Təkliflər</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">Bütün tarixlər üzrə</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Göndərilənlər</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{sentCount}</div>
          <span className="text-[10px] text-blue-500 font-medium">Namizədlərə çatdırılıb</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Qəbul Edilənlər</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">{acceptedCount}</div>
          <span className="text-[10px] text-emerald-600 font-bold">Uğurlu İşe Qəbul (Hired)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">İmtina Edilənlər</span>
          <div className="text-2xl font-black text-red-700 mt-1">{declinedCount}</div>
          <span className="text-[10px] text-red-500 font-medium">Səbəblər qeyd olunub</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Qaralamalar</span>
          <div className="text-2xl font-black text-slate-700 mt-1">{draftCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">Hazırlıq mərhələsində</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 font-medium">
          {[
            { id: 'all', label: `Hamısı (${totalCount})` },
            { id: 'SENT', label: `Göndərildi` },
            { id: 'VIEWED', label: `Baxıldı` },
            { id: 'ACCEPTED', label: `Qəbul edildi (${acceptedCount})` },
            { id: 'DECLINED', label: `İmtina edildi (${declinedCount})` },
            { id: 'DRAFT', label: `Qaralamalar (${draftCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Namizəd və ya vəzifə axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium"
          />
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredOffers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Seçilmiş filter üzrə iş təklifi tapılmadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-4">Namizəd</th>
                  <th className="py-3 px-4">Vəzifə & Şöbə</th>
                  <th className="py-3 px-4">Əməkhaqqı (Gross / Net)</th>
                  <th className="py-3 px-4">Başlama Tarixi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{offer.candidateName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{offer.candidateEmail}</div>
                      <div className="text-[10px] text-slate-400">{offer.candidatePhone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-blue-700">{offer.position}</div>
                      <div className="text-[11px] text-slate-500">{offer.department}</div>
                      <div className="text-[10px] text-slate-400">{offer.employmentType}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {offer.grossSalary.toLocaleString('az-AZ')} AZN <span className="text-[10px] text-slate-400 font-normal">Gross</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-semibold">
                        ~{offer.netSalary.toLocaleString('az-AZ')} AZN Net
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{offer.startDate}</div>
                      <div className="text-[10px] text-slate-400">
                        Sınaq: {offer.probationPeriod}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>{getStatusBadge(offer.status)}</div>
                      {offer.status === 'DECLINED' && offer.declineReason && (
                        <div className="text-[10px] text-red-600 mt-1 max-w-[140px] truncate" title={offer.declineReason.text}>
                          Səbəb: {offer.declineReason.category}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Candidate Secure Link */}
                        <button
                          onClick={() => handleCopyLink(offer.secureToken, offer.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Təhlükəsiz linki kopyala"
                        >
                          {copiedTokenId === offer.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* View in Candidate Portal */}
                        <button
                          onClick={() => onOpenCandidatePortal(offer)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="Namizəd Portalında Bax"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>

                        {/* View Document Modal */}
                        <button
                          onClick={() => setViewingOffer(offer)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                          title="Sənədə Bax"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Download PDF */}
                        <button
                          onClick={() => handleDownloadPDF(offer)}
                          disabled={isDownloadingId === offer.id}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors disabled:opacity-50"
                          title="Rəsmi PDF Yüklə"
                        >
                          {isDownloadingId === offer.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {/* Audit Log */}
                        <button
                          onClick={() => onOpenAuditLog(offer.id, offer.candidateName)}
                          className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                          title="Əməliyyat Tarixçəsi (Audit Log)"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>

                        {/* Resend Offer */}
                        <button
                          onClick={() => onResendOffer(offer)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                          title="Təklifi yenidən redaktə et və ya göndər"
                        >
                          <Send className="w-3 h-3" />
                          <span>Yenidən Göndər</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Offer Modal */}
      {viewingOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {viewingOffer.candidateName} üçün Rəsmi İş Təklifi
                </h3>
                <p className="text-xs text-slate-500">
                  Vəzifə: {viewingOffer.position} • Status: {viewingOffer.status}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadJobOfferPDF('table-view-job-offer-doc', viewingOffer)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF Yüklə</span>
                </button>
                <button
                  onClick={() => setViewingOffer(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-100 flex-1">
              <OfferDocumentView
                id="table-view-job-offer-doc"
                offer={viewingOffer}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
