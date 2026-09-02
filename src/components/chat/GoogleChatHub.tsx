import React, { useState, useEffect, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logoutGoogleChat, 
  getAccessToken,
  listGoogleChatSpaces,
  listGoogleChatMessages,
  sendGoogleChatMessage,
  createGoogleChatSpace,
  GoogleChatSpace,
  GoogleChatMessage
} from '../../utils/googleChatService';
import { Vacancy, Application, CVData } from '../../types';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Search, 
  Users, 
  Sparkles, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  Briefcase, 
  Calendar, 
  FileText, 
  LogIn, 
  LogOut, 
  Check, 
  Info,
  Hash,
  Shield,
  Loader2,
  X
} from 'lucide-react';

interface GoogleChatHubProps {
  vacancies?: Vacancy[];
  candidateCV?: CVData;
  applications?: Application[];
  initialShareType?: 'job' | 'cv' | 'interview';
  selectedJobToShare?: Vacancy | null;
  selectedAppToShare?: Application | null;
  onClose?: () => void;
}

export const GoogleChatHub: React.FC<GoogleChatHubProps> = ({
  vacancies = [],
  candidateCV,
  applications = [],
  initialShareType,
  selectedJobToShare,
  selectedAppToShare,
  onClose,
}) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Spaces & Messages state
  const [spaces, setSpaces] = useState<GoogleChatSpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<GoogleChatSpace | null>(null);
  const [messages, setMessages] = useState<GoogleChatMessage[]>([]);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [spaceSearchQuery, setSpaceSearchQuery] = useState('');

  // Message compose
  const [messageInput, setMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Quick Action / Confirmation Modal
  const [isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceDesc, setNewSpaceDesc] = useState('');
  const [isCreatingSpace, setIsCreatingSpace] = useState(false);

  // Quick share template
  const [shareTemplateModalOpen, setShareTemplateModalOpen] = useState(false);
  const [selectedTemplateType, setSelectedTemplateType] = useState<'job' | 'cv' | 'interview'>('job');
  const [selectedShareJobId, setSelectedShareJobId] = useState<string>(vacancies[0]?.id || '');
  const [confirmSendDialog, setConfirmSendDialog] = useState<{
    isOpen: boolean;
    text: string;
    targetSpaceName?: string;
  }>({ isOpen: false, text: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize auth listener on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setAuthError(null);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Spaces when accessToken is available
  const loadSpaces = async (tokenToUse?: string) => {
    const token = tokenToUse || accessToken;
    if (!token) return;

    setIsLoadingSpaces(true);
    setAuthError(null);
    try {
      const fetchedSpaces = await listGoogleChatSpaces(token);
      setSpaces(fetchedSpaces);
      if (fetchedSpaces.length > 0 && !selectedSpace) {
        setSelectedSpace(fetchedSpaces[0]);
      }
    } catch (err: any) {
      console.error('Failed to load Google Chat spaces:', err);
      setAuthError(err.message || 'Google Chat məlumatlarını yükləmək mümkün olmadı.');
    } finally {
      setIsLoadingSpaces(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      loadSpaces(accessToken);
    }
  }, [accessToken]);

  // Fetch Messages when selectedSpace changes
  const loadMessages = async (space: GoogleChatSpace) => {
    if (!accessToken) return;
    setIsLoadingMessages(true);
    try {
      const fetchedMessages = await listGoogleChatMessages(accessToken, space.name);
      setMessages(fetchedMessages);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedSpace && accessToken) {
      loadMessages(selectedSpace);
    }
  }, [selectedSpace, accessToken]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Google Sign In
  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        loadSpaces(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      setAuthError(err.message || 'Google hesabı ilə daxil olma uğursuz oldu.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogleChat();
    setCurrentUser(null);
    setAccessToken(null);
    setSpaces([]);
    setSelectedSpace(null);
    setMessages([]);
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedSpace || !accessToken || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      const newMsg = await sendGoogleChatMessage(accessToken, selectedSpace.name, messageInput);
      setMessages((prev) => [...prev, newMsg]);
      setMessageInput('');
    } catch (err: any) {
      alert(`Mesaj göndərilərkən xəta baş verdi: ${err.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Create Space
  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim() || !accessToken || isCreatingSpace) return;

    setIsCreatingSpace(true);
    try {
      const created = await createGoogleChatSpace(accessToken, newSpaceName, newSpaceDesc);
      setSpaces((prev) => [created, ...prev]);
      setSelectedSpace(created);
      setIsCreateSpaceModalOpen(false);
      setNewSpaceName('');
      setNewSpaceDesc('');
      loadMessages(created);
    } catch (err: any) {
      alert(`Otaq yaradılarkən xəta baş verdi: ${err.message}`);
    } finally {
      setIsCreatingSpace(false);
    }
  };

  // Generate Quick Share Payload
  const openShareConfirmation = (type: 'job' | 'cv' | 'interview') => {
    let templateText = '';
    const activeSpaceTitle = selectedSpace?.displayName || 'Google Chat';

    if (type === 'job') {
      const job = vacancies.find((v) => v.id === selectedShareJobId) || selectedJobToShare || vacancies[0];
      if (job) {
        templateText = `💼 VAKANSİYA ELANI | ${job.companyName}\n📌 Vəzifə: ${job.title}\n🏢 Şirkət: ${job.companyName} (${job.city})\n💰 Əmək haqqı: ${job.hideSalary ? 'Razılaşma ilə' : `${job.minSalary} - ${job.maxSalary} ${job.currency}`}\n⏱ İş qrafiki: ${job.employmentType} • Təcrübə: ${job.experienceLevel}\n\nQeyd: Bu vakansiya üçün uyğun namizədlər portal vasitəsilə müraciət edə bilərlər.`;
      }
    } else if (type === 'cv' && candidateCV) {
      templateText = `📄 NAMİZƏD TƏQDİMATI | ${candidateCV.personalInfo.fullName}\n🎯 Vəzifə: ${candidateCV.personalInfo.jobTitle}\n📧 Əlaqə: ${candidateCV.personalInfo.email} | 📞 ${candidateCV.personalInfo.phone}\n🛠 Əsas Bacarıqlar: ${candidateCV.skills.slice(0, 6).map(s => s.name).join(', ')}\n🎓 Son Təhsil: ${candidateCV.education[0]?.institution || 'Ali təhsil'}\n\nQeyd: Rəsmi CV sənədi portalda təsdiqlənmişdir.`;
    } else if (type === 'interview') {
      templateText = `📅 MÜSAHİBƏ DƏVƏTİ VƏ TƏQVİMİ\n🤝 Hörmətli namizəd,\nSizi şirkətimizdə keçiriləcək ilkin tanışlıq və texniki müsahibəyə dəvət edirik.\n\n📍 Məkan: Google Meet / Online\n⏰ Vaxt: Yaxın iş günləri (Razılaşdırılmış cədvəl üzrə)\n📋 Zəhmət olmasa təsdiq mesajınızı göndərin.`;
    }

    setConfirmSendDialog({
      isOpen: true,
      text: templateText,
      targetSpaceName: activeSpaceTitle,
    });
    setShareTemplateModalOpen(false);
  };

  const handleConfirmExecuteShare = async () => {
    if (!accessToken || !selectedSpace || !confirmSendDialog.text) return;
    setIsSendingMessage(true);
    try {
      const newMsg = await sendGoogleChatMessage(accessToken, selectedSpace.name, confirmSendDialog.text);
      setMessages((prev) => [...prev, newMsg]);
      setConfirmSendDialog({ isOpen: false, text: '' });
    } catch (err: any) {
      alert(`Paylaşım zamanı xəta: ${err.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const filteredSpaces = spaces.filter((s) => 
    (s.displayName || s.name).toLowerCase().includes(spaceSearchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col min-h-[640px] max-h-[85vh] animate-fade-in">
      {/* Top Application Bar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight">Google Chat Workspace İnteqrasiyası</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Aktiv API
              </span>
            </div>
            <p className="text-xs text-slate-300">
              HR komandası, rekruterlər və namizədlərlə birbaşa Google Chat otaqlarında əlaqə saxlayın
            </p>
          </div>
        </div>

        {/* User Auth controls */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-7 h-7 rounded-full object-cover border border-slate-600"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                  {currentUser.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-none">
                  {currentUser.displayName || 'Google İstifadəçisi'}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[140px]">
                  {currentUser.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/60 transition-colors ml-1"
                title="Google Chat sessiyasından çıxış"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={isLoggingIn}
              className="bg-white hover:bg-slate-50 text-slate-800 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 border border-slate-200 cursor-pointer disabled:opacity-60"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Google ilə Daxil Ol</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Auth Gate if not logged in */}
      {!accessToken ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Google Chat Hesabınızı Qoşun
          </h3>
          <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
            Şirkətinizin HR otaqlarına qoşulmaq, vakansiyaları komanda ilə bölüşmək və namizəd statuslarını Google Chat üzərindən idarə etmək üçün Google hesabınızla daxil olun.
          </p>

          <button
            onClick={handleSignIn}
            disabled={isLoggingIn}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>Google ilə Qoşul və İcazə Ver</span>
          </button>

          {authError && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 max-w-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl text-left">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80">
              <Building className="w-4 h-4 text-blue-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-900">Şirkət Kanalları</p>
              <p className="text-[11px] text-slate-500">Mövcud bütün iş otaqlarını və qrupları canlı izləyin.</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80">
              <FileText className="w-4 h-4 text-emerald-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-900">CV və Müraciətlər</p>
              <p className="text-[11px] text-slate-500">Bir kliklə namizəd profilini komandaya göndərin.</p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80">
              <Calendar className="w-4 h-4 text-purple-600 mb-1.5" />
              <p className="text-xs font-bold text-slate-900">Müsahibə Bildirişləri</p>
              <p className="text-[11px] text-slate-500">Dəvət və görüş xatırlatmalarını dərhal çatdırın.</p>
            </div>
          </div>
        </div>
      ) : (
        /* Logged In Google Chat Workspace Interface */
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 overflow-hidden min-h-[550px]">
          {/* Left Panel: Spaces & Rooms (4 cols) */}
          <div className="md:col-span-4 bg-slate-50/70 flex flex-col h-full border-r border-slate-200">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Otaq və ya qrup axtar..."
                  value={spaceSearchQuery}
                  onChange={(e) => setSpaceSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <button
                onClick={() => setIsCreateSpaceModalOpen(true)}
                className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                title="Yeni Google Chat Otağı Yarat"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Yeni Otaq</span>
              </button>
            </div>

            {/* Spaces list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {isLoadingSpaces ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-xs">Google Chat otaqları yüklənir...</span>
                </div>
              ) : filteredSpaces.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">Otaq tapılmadı</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Google Chat-da yeni iş və ya müsahibə otağı yaradaraq başlayın.
                  </p>
                  <button
                    onClick={() => setIsCreateSpaceModalOpen(true)}
                    className="mt-3 px-3 py-1.5 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    + İlk Otağı Yarat
                  </button>
                </div>
              ) : (
                filteredSpaces.map((space) => {
                  const isSelected = selectedSpace?.name === space.name;
                  const displayName = space.displayName || space.name.replace('spaces/', 'Otaq #');
                  return (
                    <button
                      key={space.name}
                      onClick={() => setSelectedSpace(space)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs font-medium'
                          : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/60'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {space.spaceType === 'DIRECT_MESSAGE' ? (
                          <Users className="w-3.5 h-3.5" />
                        ) : (
                          <Hash className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {displayName}
                          </p>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-sm ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {space.spaceType === 'DIRECT_MESSAGE' ? 'DM' : 'Otaq'}
                          </span>
                        </div>
                        {space.spaceDetails?.description && (
                          <p
                            className={`text-[11px] truncate mt-0.5 ${
                              isSelected ? 'text-blue-100' : 'text-slate-500'
                            }`}
                          >
                            {space.spaceDetails.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick Share Action Trigger at sidebar bottom */}
            <div className="p-3 border-t border-slate-200 bg-white">
              <button
                onClick={() => setShareTemplateModalOpen(true)}
                disabled={!selectedSpace}
                className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Portal Məlumatını Google Chat-a Göndər</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Active Chat Stream (8 cols) */}
          <div className="md:col-span-8 flex flex-col h-full bg-white">
            {selectedSpace ? (
              <>
                {/* Space Header */}
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        {selectedSpace.displayName || selectedSpace.name}
                      </h3>
                      <p className="text-[10px] text-slate-500">
                        {selectedSpace.spaceDetails?.description || 'Google Chat Workspace Otağı'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadMessages(selectedSpace)}
                      disabled={isLoadingMessages}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs flex items-center gap-1 transition-colors"
                      title="Mesajları yenilə"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMessages ? 'animate-spin' : ''}`} />
                    </button>
                    <a
                      href="https://chat.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 shadow-2xs transition-colors"
                      title="Google Chat veb tətbiqində aç"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span className="hidden sm:inline">Chat.google.com</span>
                    </a>
                  </div>
                </div>

                {/* Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40">
                  {isLoadingMessages ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs">Mesajlar gətirilir...</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-bold text-slate-600">Bu otaqda hələ mesaj yoxdur</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                        Aşağıdakı sahədən ilk mesajınızı yazın və ya vakansiya/CV xülasəsini paylaşın.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = msg.sender?.displayName === currentUser?.displayName;
                      return (
                        <div
                          key={msg.name || index}
                          className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          {msg.sender?.avatarUrl ? (
                            <img
                              src={msg.sender.avatarUrl}
                              alt={msg.sender.displayName || 'Sender'}
                              className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                              {msg.sender?.displayName?.charAt(0) || 'U'}
                            </div>
                          )}

                          <div className={`max-w-[78%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-1.5 mb-0.5 px-1">
                              <span className="text-[11px] font-bold text-slate-700">
                                {isMe ? 'Siz' : msg.sender?.displayName || 'İstifadəçi'}
                              </span>
                              {msg.createTime && (
                                <span className="text-[10px] text-slate-400">
                                  {new Date(msg.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                                isMe
                                  ? 'bg-blue-600 text-white rounded-tr-xs shadow-2xs'
                                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-2xs'
                              }`}
                            >
                              {msg.text || msg.formattedText}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Compose Input */}
                <div className="p-3 border-t border-slate-200 bg-white">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder={`${selectedSpace.displayName || 'Google Chat'}-a mesaj yazın... (Enter göndərir)`}
                      className="flex-1 max-h-28 min-h-[44px] p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none leading-relaxed"
                      rows={1}
                    />

                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || isSendingMessage}
                      className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                      title="Göndər"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-600">Otaq seçilməyib</p>
                <p className="text-[11px] text-slate-400">
                  Mesajlaşmaq üçün sol tərəfdəki siyahıdan bir Google Chat otağını seçin.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Create New Space */}
      {isCreateSpaceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Yeni Google Chat Otağı Yarat</h3>
              </div>
              <button
                onClick={() => setIsCreateSpaceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSpace} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Otağın Adı *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Məs: PASHA Bank - Senior Frontend Recruitment"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Təsvir (İxtiyari)
                </label>
                <textarea
                  rows={2}
                  placeholder="Bu otaq üzrə namizəd müzakirələri və müsahibə təyinləri aparılacaq."
                  value={newSpaceDesc}
                  onChange={(e) => setNewSpaceDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateSpaceModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={!newSpaceName.trim() || isCreatingSpace}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isCreatingSpace && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Otağı Yarat</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Quick Share Template Selector */}
      {shareTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-5 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Google Chat-da Paylaşım Şablonu
                </h3>
              </div>
              <button
                onClick={() => setShareTemplateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                Aktiv seçilmiş <strong className="text-slate-700">"{selectedSpace?.displayName || 'Chat Otağı'}"</strong> otağına hansı məlumatı göndərmək istəyirsiniz?
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                <button
                  onClick={() => setSelectedTemplateType('job')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTemplateType === 'job'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-blue-600 mb-1" />
                  <p className="text-xs">Vakansiya</p>
                </button>

                <button
                  onClick={() => setSelectedTemplateType('cv')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTemplateType === 'cv'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600 mb-1" />
                  <p className="text-xs">Namizəd CV</p>
                </button>

                <button
                  onClick={() => setSelectedTemplateType('interview')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedTemplateType === 'interview'
                      ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20 font-semibold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-purple-600 mb-1" />
                  <p className="text-xs">Müsahibə Dəvəti</p>
                </button>
              </div>

              {selectedTemplateType === 'job' && vacancies.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Paylaşılacaq Vakansiyanı Seçin:
                  </label>
                  <select
                    value={selectedShareJobId}
                    onChange={(e) => setSelectedShareJobId(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {vacancies.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title} — {v.companyName} ({v.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setShareTemplateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Bağla
                </button>
                <button
                  onClick={() => openShareConfirmation(selectedTemplateType)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <span>Məzmunu İncələ & Təsdiq Et</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Mandatory User Confirmation for Sending Messages */}
      {confirmSendDialog.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-5 animate-scale-in">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Google Chat Paylaşımını Təsdiqləyin</h3>
                <p className="text-[11px] text-slate-500">
                  Hədəf otaq: <strong>{confirmSendDialog.targetSpaceName}</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap max-h-48 overflow-y-auto mb-4 leading-relaxed">
              {confirmSendDialog.text}
            </div>

            <p className="text-[11px] text-slate-500 mb-4 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Bu mesaj sizin Google hesabınız adından seçilmiş Google Chat otağına göndəriləcəkdir.</span>
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmSendDialog({ isOpen: false, text: '' })}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                İmtina Et
              </button>
              <button
                onClick={handleConfirmExecuteShare}
                disabled={isSendingMessage}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                {isSendingMessage && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Bəli, Google Chat-a Göndər</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
