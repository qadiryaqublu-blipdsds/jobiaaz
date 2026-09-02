import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  Gift, 
  Calendar, 
  CheckCircle2, 
  Eye, 
  X, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { AppNotification } from '../../types';

interface LiveNotificationToastProps {
  notification: AppNotification | null;
  onClose: () => void;
  onOpenCenter: () => void;
  onNavigate?: (notification: AppNotification) => void;
}

export const LiveNotificationToast: React.FC<LiveNotificationToastProps> = ({
  notification,
  onClose,
  onOpenCenter,
  onNavigate,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 7000); // 7 seconds
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification || !visible) return null;

  const isOffer = notification.type === 'job_offer';
  const isInterview = notification.type === 'interview_invite';

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(notification);
    } else {
      onOpenCenter();
    }
    setVisible(false);
    onClose();
  };

  return (
    <div
      id="live-notification-toast-alert"
      className="fixed top-16 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 p-3.5 sm:p-4 flex items-start gap-3 animate-in slide-in-from-top-4 fade-in duration-300"
      style={{
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Icon */}
      <div className="shrink-0 mt-0.5">
        {isOffer ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md">
            <Gift className="w-5 h-5 animate-bounce" />
          </div>
        ) : isInterview ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Calendar className="w-5 h-5" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Bell className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-300 border border-blue-400/30 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Canlı Bildiriş</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium">İndicə</span>
        </div>

        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
          {notification.title}
        </h4>

        <p className="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        {/* Action button */}
        <div className="mt-2.5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleClick}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <span>Bax və İncələ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          onClose();
        }}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        title="Bağla"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
