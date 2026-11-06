import React, { useState, useEffect, useRef } from 'react';
import { Expert } from '../types.ts';
import { fetchExperts, sendExpertMessage } from '../services/api.ts';
import { getUIText } from '../i18n/languages.ts';
import { Phone, Send, Paperclip, Star, ShieldCheck, CheckCircle } from 'lucide-react';

interface ExpertsTabProps {
  langCode: string;
  showToast: (msg: string) => void;
}

interface ChatMessage {
  sender: 'user' | 'expert';
  text: string;
  time: string;
  imageUrl?: string;
}

export const ExpertsTab: React.FC<ExpertsTabProps> = ({ langCode, showToast }) => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpertIdx, setSelectedExpertIdx] = useState<number>(0);
  const [inputText, setInputText] = useState<string>('');
  const [callRequested, setCallRequested] = useState<Record<number, boolean>>({});
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Record<number, ChatMessage[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchExperts().then(list => {
      setExperts(list);
      // Initialize with first expert greeting
      const initChat: Record<number, ChatMessage[]> = {};
      list.forEach(exp => {
        initChat[exp.id] = [
          {
            sender: 'expert',
            text: langCode === 'or'
              ? `ନମସ୍କାର! ମୁଁ ${exp.name}, ${exp.organization} ରୁ। ଆପଣଙ୍କ ପରିବା ଫସଲରେ କି ସମସ୍ୟା ଦେଖାଦେଇଛି? ପତ୍ରର ଫଟୋ ପଠାନ୍ତୁ କିମ୍ବା ପଚାରନ୍ତୁ।`
              : exp.greeting,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
      });
      setChatHistory(initChat);
    });
  }, [langCode]);

  const activeExpert = experts[selectedExpertIdx] || null;
  const currentMessages = activeExpert ? chatHistory[activeExpert.id] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, isTyping]);

  const handleSendMessage = async (textToSend?: string, imgUrl?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text && !imgUrl) return;
    if (!activeExpert) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: text || (langCode === 'or' ? 'ପତ୍ରର ଫଟୋ ସଂଲଗ୍ନ ହୋଇଛି' : 'Leaf photo attached'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl: imgUrl
    };

    setChatHistory(prev => ({
      ...prev,
      [activeExpert.id]: [...(prev[activeExpert.id] || []), userMsg]
    }));
    setInputText('');
    setIsTyping(true);

    try {
      const response = await sendExpertMessage(
        activeExpert.id,
        text,
        imgUrl,
        langCode === 'or' ? 'Odia' : 'English',
        langCode
      );
      setIsTyping(false);
      if (response && response.expertMessage) {
        const expReply: ChatMessage = {
          sender: 'expert',
          text: response.expertMessage.text,
          time: response.expertMessage.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => ({
          ...prev,
          [activeExpert.id]: [...(prev[activeExpert.id] || []), expReply]
        }));
      }
    } catch {
      setIsTyping(false);
      showToast(langCode === 'or' ? 'ବାର୍ତ୍ତା ପଠାଇବାରେ ତ୍ରୁଟି ଘଟିଲା' : 'Error sending message to expert');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      handleSendMessage(langCode === 'or' ? 'ରୋଗ ପରୀକ୍ଷା ପାଇଁ ଏହା ମୋ ଫସଲ ପତ୍ରର ଫଟୋ।' : 'Here is a photo of my leaf symptoms for your diagnosis.', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRequestCall = () => {
    if (!activeExpert) return;
    setCallRequested(prev => ({ ...prev, [activeExpert.id]: true }));
    showToast(langCode === 'or' ? `${activeExpert.name} ଙ୍କ ସହିତ ଫୋନ୍ କଲ୍ ଅନୁରୋଧ ହୋଇଛି। ଆସନ୍ତା ୧୫ ମିନିଟ୍ ମଧ୍ୟରେ କଲ୍ ଆସିବ।` : `Call requested with ${activeExpert.name}. You will receive a call within 15 minutes.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 pb-28">
      {/* Intro Header */}
      <section className="bg-gradient-to-r from-[#e3f7ea] via-white to-[#f1fbf5] rounded-3xl p-6 border border-[#cfe8d8] shadow-sm mb-6">
        <span className="inline-block bg-[#d6f3e2] text-[#0b7a45] font-extrabold text-xs px-3 py-1 rounded-full mb-2">
          🧑‍🔬 {getUIText('agriExperts', langCode)}
        </span>
        <h1 className="text-2xl sm:text-3xl font-black font-['Baloo_2'] text-[#12392a]">
          {getUIText('kvkSpecialists', langCode)}
        </h1>
        <p className="text-xs sm:text-sm text-[#4a6b59] max-w-2xl mt-1">
          {getUIText('kvkSubTitle', langCode)}
        </p>
      </section>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List of Specialists */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-black uppercase text-emerald-900 px-1">
            {langCode === 'or' ? 'ପ୍ରମାଣିତ କୃଷି ବୈଜ୍ଞାନିକ' : 'Verified Local Specialists'} ({experts.length})
          </div>

          {experts.map((exp, idx) => {
            const isSelected = selectedExpertIdx === idx;
            return (
              <button
                key={exp.id}
                onClick={() => setSelectedExpertIdx(idx)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  isSelected
                    ? 'border-[#0e9f5c] bg-gradient-to-br from-[#f0fbf4] to-white shadow-md ring-2 ring-emerald-500/20'
                    : 'border-[#d3eadb] bg-white hover:border-emerald-300'
                }`}
              >
                <div
                  style={{ backgroundColor: exp.avatarBg }}
                  className="w-13 h-13 rounded-2xl grid place-items-center text-2xl shrink-0 shadow-sm relative"
                >
                  <span>{exp.icon}</span>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-extrabold text-sm text-[#12392a] truncate">{exp.name}</h3>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{exp.rating}</span>
                    </span>
                  </div>

                  <div className="text-xs text-[#0b7a45] font-bold truncate mt-0.5">{exp.role}</div>
                  <div className="text-[11px] text-slate-500 truncate">{exp.organization}</div>

                  <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] font-bold text-slate-500">
                    <span className="bg-slate-100 px-2 py-0.5 rounded-full">📍 {exp.location.split(',')[0]}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded-full">{exp.experienceYears} yrs exp</span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full truncate max-w-[130px]">
                      {exp.languages.join(', ')}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Chat Panel */}
        {activeExpert && (
          <section className="lg:col-span-7 bg-white rounded-3xl border border-[#d3eadb] shadow-md flex flex-col h-[580px] overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-[#e3f7ea] to-white border-b border-[#d3eadb] flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <span
                  style={{ backgroundColor: activeExpert.avatarBg }}
                  className="w-11 h-11 rounded-2xl grid place-items-center text-xl shadow-xs"
                >
                  {activeExpert.icon}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-black text-sm sm:text-base text-[#12392a]">
                      {activeExpert.name}
                    </h2>
                    <span className="text-[10px] font-extrabold bg-[#d6f3e2] text-[#0b7a45] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>KVK verified</span>
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium block truncate max-w-[280px]">
                    {activeExpert.focus}
                  </span>
                </div>
              </div>

              {/* Call Request Button */}
              <button
                onClick={handleRequestCall}
                disabled={callRequested[activeExpert.id]}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-extrabold text-xs transition cursor-pointer ${
                  callRequested[activeExpert.id]
                    ? 'bg-emerald-100 text-emerald-800 cursor-default'
                    : 'bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white hover:brightness-105 shadow-sm'
                }`}
              >
                {callRequested[activeExpert.id] ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Call Requested</span>
                  </>
                ) : (
                  <>
                    <Phone className="w-3.5 h-3.5" />
                    <span>Request Call</span>
                  </>
                )}
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fcf9]">
              {currentMessages.map((msg, i) => {
                const isMe = msg.sender === 'user';
                return (
                  <div
                    key={i}
                    className={`flex flex-col max-w-[82%] ${
                      isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-[#d3eadb] rounded-tl-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-bold mb-1">
                        <span>{isMe ? 'You (Farmer)' : activeExpert.name.split(' ')[1] || 'Expert'}</span>
                        <span>{msg.time}</span>
                      </div>
                      <div>{msg.text}</div>
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Attached leaf"
                          className="mt-2 max-h-48 rounded-xl object-cover border border-white/20"
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-1 p-3 bg-white border border-[#d3eadb] rounded-2xl rounded-tl-xs w-16 text-slate-400">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions Chips */}
            <div className="p-2.5 px-4 bg-white border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
              {[
                { icon: '🍂', text: langCode === 'or' ? 'ପତ୍ରରେ ଦାଗ ହେଉଛି' : 'Spots on leaves' },
                { icon: '🚫', text: langCode === 'or' ? 'ଆଜି ସ୍ପ୍ରେ କରିପାରିବି କି?' : 'Can I spray today?' },
                { icon: '💰', text: langCode === 'or' ? 'ଏବେ ବିକ୍ରି କରିବି କି?' : 'Should I sell now?' },
                { icon: '🧪', text: langCode === 'or' ? 'କେଉଁ ସାର ପ୍ରୟୋଗ କରିବି?' : 'Recommended fertilizer?' }
              ].map(q => (
                <button
                  key={q.text}
                  onClick={() => handleSendMessage(q.text)}
                  className="px-3 py-1 rounded-full border border-[#d3eadb] bg-emerald-50/50 hover:bg-emerald-100 text-[#12392a] font-bold text-xs whitespace-nowrap transition cursor-pointer flex items-center gap-1"
                >
                  <span>{q.icon}</span>
                  <span>{q.text}</span>
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
              <label
                className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center cursor-pointer text-slate-600 transition shrink-0"
                title="Attach leaf photo"
              >
                <Paperclip className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleFileUpload} hidden />
              </label>

              <input
                type="text"
                placeholder={getUIText('typeQuestionPlaceholder', langCode)}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#0e9f5c]"
              />

              <button
                onClick={() => handleSendMessage()}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white grid place-items-center hover:brightness-105 transition shrink-0 shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
