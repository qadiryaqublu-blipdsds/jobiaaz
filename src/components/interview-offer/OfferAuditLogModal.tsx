import React from 'react';
import { OfferAuditLog } from '../../types';
import { X, History, User, Clock, ShieldCheck } from 'lucide-react';
import { ModalBottomLogo } from '../ModalBottomLogo';

interface OfferAuditLogModalProps {
  logs: OfferAuditLog[];
  offerId?: string;
  candidateName?: string;
  onClose: () => void;
}

export const OfferAuditLogModal: React.FC<OfferAuditLogModalProps> = ({
  logs,
  offerId,
  candidateName,
  onClose,
}) => {
  const filteredLogs = offerId ? logs.filter((l) => l.offerId === offerId) : logs;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'OFFER_ACCEPTED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'OFFER_DECLINED':
        return 'bg-red-100 text-red-800 border-red-300 font-bold';
      case 'OFFER_SENT':
      case 'OFFER_RESENT':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      case 'OFFER_VIEWED':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'OFFER_APPROVED':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'OFFER_CREATED':
      case 'OFFER_GENERATED':
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-fade-in text-xs">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                İş Təklifi Əməliyyat Tarixçəsi (Audit Log)
              </h3>
              <p className="text-[11px] text-slate-500">
                {candidateName ? `Namizəd: ${candidateName}` : 'Bütün sistem qeydləri'}
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

        {/* Log list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              Hələ heç bir audit qeydi mövcud deyil.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              {filteredLogs.map((log) => (
                <div key={log.id} className="relative pl-6">
                  {/* Dot */}
                  <div className="absolute -left-2 top-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600" />

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] border uppercase ${getActionBadge(log.action)}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(log.timestamp).toLocaleString('az-AZ')}</span>
                      </div>
                    </div>

                    <p className="text-slate-800 font-medium leading-relaxed">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>İcraçı: <strong className="text-slate-700">{log.user}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800"
          >
            Bağla
          </button>
        </div>

        {/* Dynamic moving Jobia Logo at bottom */}
        <ModalBottomLogo
          tagline="Jobia.az Rəsmi Əməliyyat və Audit Qeydləri"
          variant="slate"
          size="xs"
        />
      </div>
    </div>
  );
};
