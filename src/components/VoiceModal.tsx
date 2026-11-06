import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Activity, CheckCircle, ShieldCheck, AlertTriangle, Volume2 } from 'lucide-react';
import { processVoiceQuery } from '../services/api.ts';
import { getUIText } from '../i18n/languages.ts';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  langName: string;
  langCode: string;
  showToast: (msg: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  langName,
  langCode,
  showToast
}) => {
  const [isListening, setIsListening] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0: Idle, 1: Listening, 2: Processing, 3: Answered
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState<any | null>(null);
  const recognitionRef = useRef<any>(null);

  // Determine speech recognition language code
  const getSpeechLangCode = () => {
    if (langCode === 'or') return 'or-IN';
    if (langCode === 'hi') return 'hi-IN';
    return 'en-IN';
  };

  useEffect(() => {
    if (!isOpen) {
      handleClose();
    }
  }, [isOpen]);

  const handleClose = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    // Stop any ongoing speech when modal closes
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsListening(false);
    setStep(0);
    setTranscript('');
    setAiResponse(null);
    onClose();
  };

  // --- Text to Speech (Read Aloud) ---
  const handleReadAloud = (text: string) => {
    if (!('speechSynthesis' in window)) {
      showToast('Audio playback is not supported on this browser.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any currently playing audio
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language
    if (langCode === 'or') utterance.lang = 'or-IN';
    else if (langCode === 'hi') utterance.lang = 'hi-IN';
    else utterance.lang = 'en-IN';

    // Try to find a high-quality local voice if available
    const voices = window.speechSynthesis.getVoices();
    const exactVoice = voices.find(v => v.lang === utterance.lang || v.lang.replace('_', '-') === utterance.lang);
    if (exactVoice) {
      utterance.voice = exactVoice;
    }

    // Odia Fallback Notice
    if (langCode === 'or' && !exactVoice) {
      showToast('Odia voice engine may not be installed on this device.');
    }

    window.speechSynthesis.speak(utterance);
  };

  const handleStartListening = () => {
    const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecClass) {
      showToast('Speech recognition not supported in this browser. Try Chrome.');
      return;
    }

    try {
      const recognition = new SpeechRecClass();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false; // Set to false to guarantee we get the final complete string
      recognition.lang = getSpeechLangCode();

      recognition.onstart = () => {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel(); // mute TTS while listening
        setIsListening(true);
        setStep(1);
        setTranscript('');
        setAiResponse(null);
      };

      recognition.onresult = (event: any) => {
        // Safely extract the final transcript
        const finalTranscript = event.results[0]?.[0]?.transcript;
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processAIQuery(finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'aborted') {
          showToast(`Microphone error: ${event.error}`);
        }
        setIsListening(false);
        if (step === 1) setStep(0);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const processAIQuery = async (text: string) => {
    setStep(2); // Processing
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    setIsListening(false);

    try {
      const res = await processVoiceQuery(text, langName, langCode);
      if (res.success && res.result) {
        setAiResponse(res.result);
        setStep(3); // Answered
      } else {
        throw new Error('Failed to parse AI response');
      }
    } catch (err) {
      showToast(langCode === 'or' ? 'ଉତ୍ତର ଆଣିବାରେ ତ୍ରୁଟି ଘଟିଲା' : 'Failed to process voice query');
      setStep(0);
    }
  };

  // Sample queries based on language for fallback testing
  const SAMPLE_QUERIES = {
    en: [
      "Is it safe to spray fungicide today if humidity is 80%?",
      "What is the current mandi price for tomatoes?",
      "My leaves have brown rings and yellow edges, what is it?"
    ],
    hi: [
      "आज 80% नमी है, क्या फफूंदनाशक स्प्रे करना सुरक्षित है?",
      "टमाटर का आज का मंडी भाव क्या है?",
      "मेरे पत्तों पर भूरे रंग के छल्ले और पीले किनारे हैं, यह क्या है?"
    ],
    or: [
      "ଆଜି ୮୦% ଆର୍ଦ୍ରତା ଅଛି, କୀଟନାଶକ ସ୍ପ୍ରେ କରିବା ସୁରକ୍ଷିତ କି?",
      "ଟମାଟୋର ଆଜିର ମଣ୍ଡି ଦର କେତେ?",
      "ମୋ ଗଛ ପତ୍ରରେ ବାଦାମୀ ରଙ୍ଗର ଗୋଲାକାର ଚିହ୍ନ ଅଛି, ଏହା କେଉଁ ରୋଗ?"
    ]
  };

  const activeSamples = langCode === 'or' ? SAMPLE_QUERIES.or : langCode === 'hi' ? SAMPLE_QUERIES.hi : SAMPLE_QUERIES.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-br from-[#0b7a55] via-[#0f4a33] to-[#12392a] sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-400/20 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold mb-1 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{getUIText('voiceCopilotHeader', langCode)}</span>
            </div>
            <h2 className="text-2xl font-black font-['Baloo_2'] text-white">
              {getUIText('voiceModalTitle', langCode)}
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1 max-w-sm">
              {getUIText('voiceModalDesc', langCode)}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-rose-500/80 grid place-items-center text-white transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* Microphone Section */}
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-28 h-28 flex items-center justify-center mb-6">
              {/* Pulsing rings when listening */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] animation-delay-500" />
                </>
              )}
              <button
                onClick={isListening ? handleClose : handleStartListening}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 ${
                  isListening 
                    ? 'bg-gradient-to-br from-rose-400 to-rose-600 text-white animate-pulse' 
                    : 'bg-gradient-to-br from-emerald-300 to-emerald-500 text-emerald-950'
                }`}
              >
                {isListening ? <Activity className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-white font-['Baloo_2'] mb-1 text-center">
              {step === 0 && getUIText('tapMicToSpeak', langCode)}
              {step === 1 && getUIText('listeningVoicePrompt', langCode)}
              {step === 2 && getUIText('processingGemini', langCode)}
              {step === 3 && (langCode === 'or' ? 'ଉତ୍ତର ପ୍ରସ୍ତୁତ' : 'Advice Ready')}
            </h3>
            <p className="text-sm text-emerald-200/70 text-center max-w-xs">
              {getUIText('speakAnyLanguage', langCode)}
            </p>
          </div>

          {/* Transcript / Result Area */}
          <div className="mt-4">
            {(step === 2 || step === 3) && transcript && (
              <div className="bg-black/20 rounded-2xl p-4 mb-4 border-l-4 border-sky-400 italic text-emerald-50 text-sm">
                "{transcript}"
              </div>
            )}

            {/* AI Result Card */}
            {step === 3 && aiResponse && (
              <div className="bg-white rounded-3xl p-5 shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300 text-slate-800">
                <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-black font-['Baloo_2'] text-slate-900" style={{ color: aiResponse.accentColor || '#12392a' }}>
                      {aiResponse.riskTitle}
                    </h4>
                    {/* Read Aloud Button */}
                    <button 
                      onClick={() => handleReadAloud(aiResponse.replyMessage)}
                      className="p-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition"
                      title="Read Aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{getUIText('riskIndexLabel', langCode) || 'Risk:'}</span>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black text-white" style={{ backgroundColor: aiResponse.accentColor || '#ff9f43' }}>
                      {aiResponse.riskScore}/100
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed font-semibold mb-4">
                  {aiResponse.replyMessage}
                </p>

                <div className="space-y-2 mb-4">
                  {aiResponse.actionSteps?.map((stepStr: string, i: number) => {
                    const parts = stepStr.split('|');
                    const icon = parts.length > 1 ? parts[0] : '✅';
                    const text = parts.length > 1 ? parts[1] : parts[0];
                    
                    return (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-base shrink-0">{icon}</span>
                        <span className="text-xs sm:text-sm font-medium text-slate-700">{text}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{aiResponse.disclaimer}</span>
                </div>
              </div>
            )}

            {/* Fallback sample queries if user doesn't want to use mic */}
            {step === 0 && (
              <div className="mt-2">
                <div className="text-xs font-bold text-emerald-300 mb-3 text-center">
                  {getUIText('sampleVoiceQueryPrompt', langCode)}
                </div>
                <div className="flex flex-col gap-2">
                  {activeSamples.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setTranscript(q);
                        processAIQuery(q);
                      }}
                      className="text-left p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-emerald-50 text-xs sm:text-sm font-medium transition-colors"
                    >
                      🗣️ "{q}"
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};