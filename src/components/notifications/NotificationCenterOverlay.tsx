import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  Sparkles, 
  Gift, 
  Calendar, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  Eye, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  X,
  Radio,
  Volume2,
  VolumeX,
  Flame,
  Send
} from 'lucide-react';
import { AppNotification, User } from '../../types';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotificationFromFirestore, 
  clearAllNotificationsForUser,
  createNotification 
} from '../../services/firestoreService';

interface NotificationCenterOverlayProps {
  currentUser: User | null;
  notifications: AppNotification[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateNotification?: (notification: AppNotification) => void;
}

export const NotificationCenterOverlay: React.FC<NotificationCenterOverlayProps> = ({
  currentUser,
  notifications = [],
  isOpen,
  onClose,
  onNavigateNotification,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'offers' | 'status'>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Filter list
  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.isRead;
    if (activeFilter === 'offers') return n.type === 'job_offer' || n.type === 'interview_invite';
    if (activeFilter === 'status') return n.type === 'status_changed' || n.type === 'application_submitted';
    return true;
  });

  // Close on click outside or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Only close if click wasn't on the toggle trigger
        const trigger = document.getElementById('header-notification-center-btn');
        if (trigger && trigger.contains(event.target as Node)) return;
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Format relative time in Azerbaijani
  const formatTimeAgo = (dateString: string) => {
    try {
      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'İndicə';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} dəq əvvəl`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} saat əvvəl`;
      if (diffInSeconds < 172800) return 'Dünən';
      
      return date.toLocaleDateString('az-AZ', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return 'Bu yaxınlarda';
    }
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.isRead) {
      await markNotificationAsRead(notif.id);
    }
    if (onNavigateNotification) {
      onNavigateNotification(notif);
    }
    onClose();
  };

  const handleMarkAllRead = async () => {
    const targetUserId = currentUser?.id || currentUser?.email || 'all';
    await markAllNotificationsAsRead(targetUserId);
  };

  const handleClearAll = async () => {
    const targetUserId = currentUser?.id || currentUser?.email || 'all';
    await clearAllNotificationsForUser(targetUserId);
  };

  const handleDeleteItem = async (e: React.MouseEvent, notifId: string) => {
    e.stopPropagation();
    await deleteNotificationFromFirestore(notifId);
  };

  // Test simulation trigger
  const handleSimulateRecruiterAction = async (type: 'offer' | 'interview' | 'status') => {
    const targetId = currentUser?.id || currentUser?.email || 'demo-candidate';
    if (type === 'offer') {
      await createNotification({
        userId: targetId,
        title: '🎉 Rəsmi İş Təklifi Aldınız!',
        message: 'PAŞA Bank ASC sizə "Senior Frontend Developer" vəzifəsi üzrə rəsmi iş təklifi (3,500 AZN NET) göndərdi.',
        type: 'job_offer',
        link: '/candidate/offers',
        data: {
          companyName: 'PAŞA Bank ASC',
          position: 'Senior Frontend Developer',
          salary: '3,500 AZN',
        }
      });
    } else if (type === 'interview') {
      await createNotification({
        userId: targetId,
        title: '🗓️ Müsahibəyə Dəvət Olundunuz!',
        message: 'Kapital Bank ASC "Full Stack Mühəndis" vakansiyası üzrə CV-nizi bəyəndi və video müsahibəyə dəvət edir.',
        type: 'interview_invite',
        link: '/candidate/applications',
        data: {
          companyName: 'Kapital Bank ASC',
          time: 'Sabah, saat 15:00',
        }
      });
    } else {
      await createNotification({
        userId: targetId,
        title: '👀 Müraciətinizə Baxıldı',
        message: 'SOCAR müraciət etdiyiniz "Data Analitiki" vakansiyası üzrə CV profilinizi nəzərdən keçirdi.',
        type: 'status_changed',
        link: '/candidate/applications',
        data: {
          status: 'Baxıldı',
          companyName: 'SOCAR',
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      id="realtime-notification-center-overlay"
      className="absolute top-full right-0 mt-2 w-[92vw] sm:w-[440px] max-w-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150 origin-top-right text-slate-800"
      style={{
        boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* 1. TOP HEADER WITH LIVE REALTIME PULSE */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 rounded-xl bg-white/10 text-white border border-white/15">
            <Bell className="w-4 h-4 text-blue-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-slate-900"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Bildirişlər Mərkəzi
              </h3>
              {unreadCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-red-500/90 text-white text-[10px] font-black tracking-wide">
                  {unreadCount} yeni
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-300 text-[10px] font-semibold">
                  Hamısı oxunub
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">
                Real-vaxt canlı bağlantı
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={soundEnabled ? 'Bildiriş səsi aktivdir' : 'Səssiz rejim'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Bağla"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. FILTER TABS & BULK ACTIONS */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-1 text-[11px] font-medium shrink-0">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            Hamısı ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('unread')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'unread'
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            Oxunmamış ({unreadCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('offers')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'offers'
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            Təklif & Dəvət
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('status')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeFilter === 'status'
                ? 'bg-blue-600 text-white font-bold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
            }`}
          >
            Statuslar
          </button>
        </div>

        {/* Action icons: Mark All Read & Clear */}
        <div className="flex items-center gap-1 shrink-0">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="p-1 px-2 rounded-md bg-white border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
              title="Hamısını oxunmuş kimi qeyd et"
            >
              <CheckCheck className="w-3 h-3 text-blue-600" />
              <span className="hidden sm:inline">Oxundu</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1 px-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 text-[11px] transition-colors cursor-pointer"
              title="Bütün bildirişləri təmizlə"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. SCROLLABLE NOTIFICATION LIST */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 min-h-[160px] max-h-[380px] p-1.5 space-y-1">
        {filteredNotifications.length === 0 ? (
          <div className="py-10 px-4 text-center flex flex-col items-center justify-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
              <Bell className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              {activeFilter === 'unread' ? 'Oxunmamış yeni bildiriş yoxdur' : 'Hələlik heç bir bildirişiniz yoxdur'}
            </p>
            <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
              İşəgötürənlər müraciətinizə baxdıqda, müsahibə təyin etdikdə və ya rəsmi iş təklifi göndərdikdə burada dərhal xəbərdar olacaqsınız.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isOffer = notif.type === 'job_offer';
            const isInterview = notif.type === 'interview_invite';
            const isApproved = notif.type === 'status_changed' && (notif.message.includes('Qəbul') || notif.message.includes('Təklif'));

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`group relative p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 select-none ${
                  !notif.isRead
                    ? isOffer
                      ? 'bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/90 shadow-2xs'
                      : isInterview
                      ? 'bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/80 shadow-2xs'
                      : 'bg-blue-50/60 hover:bg-blue-100/60 border border-blue-200/70 shadow-2xs'
                    : 'bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200'
                }`}
              >
                {/* Visual Icon Badge by Type */}
                <div className="shrink-0 mt-0.5">
                  {isOffer ? (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs">
                      <Gift className="w-4 h-4" />
                    </div>
                  ) : isInterview ? (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                  ) : isApproved ? (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : notif.type === 'application_submitted' ? (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                      <Send className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Content body */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className={`text-xs font-bold leading-snug truncate ${
                      !notif.isRead ? 'text-slate-900' : 'text-slate-700'
                    }`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium shrink-0">
                      {formatTimeAgo(notif.createdAt)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Interactive Action Pill */}
                  <div className="mt-2 flex items-center gap-2">
                    {isOffer ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-600 text-white text-[10px] font-bold shadow-2xs group-hover:bg-amber-700 transition-colors">
                        <span>Rəsmi Təklifi İncələ</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    ) : isInterview ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px] font-bold shadow-2xs group-hover:bg-purple-700 transition-colors">
                        <span>Müsahibə Detalları</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 group-hover:text-blue-700">
                        <span>Müraciətlərimə keç</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    )}

                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Oxunmayıb" />
                    )}
                  </div>
                </div>

                {/* Delete button on hover */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteItem(e, notif.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all absolute top-2.5 right-2 cursor-pointer"
                  title="Bildirişi sil"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* 4. FOOTER: RECRUITER REALTIME ACTION SIMULATOR & STATUS */}
      <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-200/80 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Real-vaxt Simulyatoru:</span>
          </span>
          <span className="text-[9px] text-slate-400">Canlı sınaqdan keçirin</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleSimulateRecruiterAction('offer')}
            className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Şirkətdən iş təklifi bildirişini sınaqdan keçir"
          >
            <Gift className="w-3 h-3 text-amber-600" />
            <span>+ İş Təklifi</span>
          </button>
          <button
            type="button"
            onClick={() => handleSimulateRecruiterAction('interview')}
            className="px-2 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Müsahibəyə dəvət bildirişini sınaqdan keçir"
          >
            <Calendar className="w-3 h-3 text-purple-600" />
            <span>+ Müsahibə</span>
          </button>
          <button
            type="button"
            onClick={() => handleSimulateRecruiterAction('status')}
            className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="Status dəyişikliyi bildirişini sınaqdan keçir"
          >
            <Eye className="w-3 h-3 text-blue-600" />
            <span>+ Status</span>
          </button>
        </div>
      </div>
    </div>
  );
};
