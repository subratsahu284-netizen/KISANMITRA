import React, { useState, useEffect, useRef } from 'react';
import { VegetableInfo, ProblemDef, ScanRecord } from '../types.ts';
import { runCropDiagnosis, askDiagnosisFollowup } from '../services/api.ts';
import { generateDiagnosisPDF } from '../services/pdfExport.ts';
import { getUIText, getLocalizedVegetableName, getLocalizedGrowthStage, getLocalizedProblemName } from '../i18n/languages.ts';
import { Upload, Mic, MicOff, Sparkles, FileDown, CheckCircle, AlertTriangle, ShieldCheck, RefreshCw, MessageSquare, Send } from 'lucide-react';

interface DiagnosisTabProps {
  vegetables: VegetableInfo[];
  selectedVegId: string;
  onVegetableChange: (id: string) => void;
  langCode: string;
  onScanSaved: (scan: ScanRecord) => void;
  onViewHistory: () => void;
  showToast: (msg: string) => void;
  capturedLeafPhoto?: { url: string; name: string } | null;
}

export const DiagnosisTab: React.FC<DiagnosisTabProps> = ({
  vegetables,
  selectedVegId,
  onVegetableChange,
  langCode,
  onScanSaved,
  onViewHistory,
  showToast,
  capturedLeafPhoto
}) => {
  const currentVeg = vegetables.find(v => v.id === selectedVegId) || vegetables[0] || null;

  const [selectedVariety, setSelectedVariety] = useState<string>('');
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(2); // Default Flowering
  const [selectedSampleIdx, setSelectedSampleIdx] = useState<number>(0);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [customImageName, setCustomImageName] = useState<string>('');
  const [symptomsText, setSymptomsText] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [lastSavedScan, setLastSavedScan] = useState<ScanRecord | null>(null);
  const [followupQuestion, setFollowupQuestion] = useState<string>('');
  const [followupLoading, setFollowupLoading] = useState<boolean>(false);
  const [followupResponse, setFollowupResponse] = useState<any | null>(null);
  const recognitionRef = useRef<any>(null);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (currentVeg && currentVeg.varieties.length > 0) {
      setSelectedVariety(currentVeg.varieties[0]);
      setSelectedSampleIdx(0);
      setCustomImage(null);
      setDiagnosisResult(null);
    }
  }, [selectedVegId]);

  useEffect(() => {
    if (capturedLeafPhoto?.url) {
      setCustomImage(capturedLeafPhoto.url);
      setCustomImageName(capturedLeafPhoto.name || 'Leaf Photo (Camera)');
      setDiagnosisResult(null);
    }
  }, [capturedLeafPhoto]);

  const activeProblem: ProblemDef | undefined = currentVeg?.problems[selectedSampleIdx] || currentVeg?.problems[0];

  // Render SVG sample leaf based on problem visual properties
  const renderLeafSVG = (prob: ProblemDef | undefined, isThumbnail = false) => {
    if (!prob) return null;
    const baseCol = prob.leafVisual?.baseColor || '#3f8f3a';
    const spotCol = prob.leafVisual?.spotColor;
    const haloCol = prob.leafVisual?.haloColor;
    const isCurl = prob.name.toLowerCase().includes('curl');

    return (
      <svg
        viewBox="0 0 400 340"
        className={`w-full h-full object-cover ${isThumbnail ? 'h-16' : ''}`}
      >
        <path d="M200 320V190" stroke="#256024" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M200 300C60 280 30 150 120 70C170 30 260 30 300 80C370 160 320 290 200 300Z"
          fill={baseCol}
        />
        <path
          d="M200 295V70M200 230L130 180M200 200L270 150M200 160L140 120"
          stroke="rgba(11,122,69,0.35)"
          strokeWidth="3.5"
          fill="none"
        />

        {/* Spots / Deficiencies */}
        {spotCol && (
          <g className="animate-pulse">
            <circle cx="150" cy="140" r="22" fill={haloCol || 'none'} opacity="0.6" />
            <circle cx="150" cy="140" r="14" fill={spotCol} />
            <circle cx="150" cy="140" r="8" fill="none" stroke="#00000055" strokeWidth="2" />

            <circle cx="230" cy="200" r="18" fill={haloCol || 'none'} opacity="0.6" />
            <circle cx="230" cy="200" r="11" fill={spotCol} />

            <circle cx="120" cy="230" r="14" fill={haloCol || 'none'} opacity="0.6" />
            <circle cx="120" cy="230" r="8" fill={spotCol} />

            <circle cx="260" cy="130" r="14" fill={spotCol} />
          </g>
        )}

        {/* Nutrient deficiency chlorosis halo */}
        {haloCol && !spotCol && (
          <ellipse cx="200" cy="170" rx="95" ry="65" fill={haloCol} opacity="0.55" />
        )}

        {/* Leaf curl fold */}
        {isCurl && (
          <path
            d="M60 170Q200 60 340 170Q200 130 60 170Z"
            fill="#00000030"
          />
        )}
      </svg>
    );
  };

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCustomImage(reader.result as string);
      setCustomImageName(file.name);
      setDiagnosisResult(null);
      showToast(`Leaf photo loaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  // Voice Speech Recognition with robust lifecycle handling
  const handleToggleVoiceInput = () => {
    const SpeechRecClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecClass) {
      // Fallback sample text
      setSymptomsText(
        langCode === 'or'
          ? 'ଟମାଟୋ ତଳ ପତ୍ରରେ କଳା ଗୋଲାକାର ଚିହ୍ନ, ହଳଦିଆ ଧାର ଓ ପତ୍ର କୁଞ୍ଚିତ ହେଉଛି।'
          : 'Brown circular rings on lower leaves with yellow halo margins and mild leaf curling.'
      );
      showToast(langCode === 'or' ? 'ସ୍ୱର ଲେଖା ଯୋଡ଼ାଗଲା (ନମୁନା ପାଠ୍ୟ)' : 'Sample voice observation inserted');
      return;
    }

    // If currently listening, cleanly stop immediately
    if (isListening || recognitionRef.current) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort();
        } catch {}
        recognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecClass();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = langCode === 'hi' ? 'hi-IN' : langCode === 'or' ? 'or-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        showToast(langCode === 'or' ? 'ଶୁଣୁଛି... ନିଜ ଲକ୍ଷଣ କୁହନ୍ତୁ 🎙️' : 'Listening... Speak your observations');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptomsText(prev => (prev ? `${prev} ${transcript}` : transcript));
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch {}
          recognitionRef.current = null;
        }
        setIsListening(false);
        showToast(langCode === 'or' ? 'ସ୍ୱର ରେକର୍ଡ ହେଲା! ✅' : 'Voice recorded! ✅');
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'aborted') {
          setIsListening(false);
          return;
        }
        if (event.error === 'language-not-supported' && recognition.lang !== 'en-IN') {
          recognition.lang = 'en-IN';
        }
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch {}
          recognitionRef.current = null;
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.start();
    } catch {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
      setIsListening(false);
      showToast('Microphone busy. Please tap mic again.');
    }
  };

  // Run AI disease and nutrient diagnosis
  const handleRunDiagnosis = async () => {
    if (!currentVeg) return;

    setIsScanning(true);
    setDiagnosisResult(null);

    const stageName = currentVeg.stages[selectedStageIdx]?.name || 'Flowering';

    try {
      const response = await runCropDiagnosis({
        vegetable: currentVeg.name,
        variety: selectedVariety,
        growthStage: stageName,
        symptomsText: symptomsText || activeProblem?.symptoms || 'Visual leaf check',
        imageBase64: customImage || undefined,
        autoSave: true,
        language: langCode === 'or' ? 'Odia' : langCode === 'hi' ? 'Hindi' : 'English',
        langCode
      });

      if (response.success && response.diagnosis) {
        setDiagnosisResult(response.diagnosis);
        setFollowupResponse(null);
        if (response.savedRecord) {
          setLastSavedScan(response.savedRecord);
          onScanSaved(response.savedRecord);
        }
        showToast('AI Diagnosis complete & saved to History!');
      } else {
        showToast(response.error || 'Diagnosis failed. Showing offline advisory.');
      }
    } catch (err: any) {
      console.error(err);
      showToast('Network error, showing local pathology heuristics.');
    } finally {
      setIsScanning(false);
    }
  };

  // PDF Download trigger
  const handleExportPDF = () => {
    if (lastSavedScan) {
      generateDiagnosisPDF(lastSavedScan);
      showToast('Official PDF Report generated & downloaded!');
    } else if (diagnosisResult && currentVeg) {
      // Build temporary scan record
      const tempRecord: ScanRecord = {
        id: `scan_${Date.now()}`,
        createdAt: new Date().toISOString(),
        vegetable: currentVeg.name,
        variety: selectedVariety,
        stage: currentVeg.stages[selectedStageIdx]?.name || 'Flowering',
        problemType: diagnosisResult.problemType,
        problemName: diagnosisResult.problemName,
        severity: diagnosisResult.severity,
        confidence: diagnosisResult.confidence,
        symptoms: diagnosisResult.symptoms,
        remedies: diagnosisResult.remedies,
        notes: symptomsText,
        farmerName: 'Ramesh Patel',
        location: 'Sambalpur, Odisha'
      };
      generateDiagnosisPDF(tempRecord);
      showToast('PDF Report downloaded!');
    }
  };

  const handleAskFollowup = async (qToSend?: string) => {
    const q = (qToSend ?? followupQuestion).trim();
    if (!q || !diagnosisResult) return;
    setFollowupLoading(true);
    try {
      const res = await askDiagnosisFollowup({
        vegetable: currentVeg?.name || selectedVegId,
        variety: selectedVariety,
        growthStage: currentVeg?.stages[selectedStageIdx]?.name,
        problemName: diagnosisResult.problemName,
        problemType: diagnosisResult.problemType,
        symptoms: diagnosisResult.symptoms,
        remedies: diagnosisResult.remedies || [],
        question: q,
        language: langCode === 'or' ? 'Odia' : langCode === 'hi' ? 'Hindi' : 'English',
        langCode
      });
      if (res.success && res.result) {
        setFollowupResponse(res.result);
        setFollowupQuestion('');
        showToast(langCode === 'or' ? 'Gemini AI କୃଷି ଉତ୍ତର ପ୍ରସ୍ତୁତ ✅' : 'Gemini AI Agronomist answered ✅');
      }
    } catch {
      showToast(langCode === 'or' ? 'ଉତ୍ତର ପାଇବାରେ ବିଫଳ ହେଲା' : 'Failed to get answer');
    } finally {
      setFollowupLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 pb-28">
      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Leaf Image Viewport & Samples */}
        <section className="lg:col-span-7 bg-white rounded-3xl p-5 border border-[#d3eadb] shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3.5 flex-wrap">
            <h2 className="text-xl font-extrabold font-['Baloo_2'] text-[#12392a] flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-300 text-emerald-950 grid place-items-center font-black text-sm">
                1
              </span>
              <span>{getUIText('step1Title', langCode)}</span>
            </h2>

            <label className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-1.5 border-dashed border-sky-500 text-sky-600 font-bold text-xs sm:text-sm cursor-pointer hover:bg-sky-50 transition shadow-sm">
              <Upload className="w-4 h-4" />
              <span>{getUIText('uploadPhoto', langCode)}</span>
              <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} hidden />
            </label>
          </div>

          {/* Leaf Screen Viewer with scanning laser */}
          <div
            className={`relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-emerald-100 bg-gradient-to-br from-[#f1fbf5] to-[#bfe6cd] flex items-center justify-center transition-all ${
              isScanning ? 'ring-4 ring-emerald-400' : ''
            }`}
          >
            {/* Top Chip Label */}
            <div className="absolute top-3 left-3 z-20 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow">
              {customImage
                ? `${getUIText('yourPhotoText', langCode)}: ${customImageName}`
                : `${getUIText('sampleLeafText', langCode)}: ${getLocalizedVegetableName(currentVeg?.id || '', currentVeg?.name || '', langCode)} • ${getLocalizedProblemName(activeProblem?.name || '', langCode)}`}
            </div>

            {/* Custom Leaf Image or SVG */}
            {customImage ? (
              <img
                src={customImage}
                alt="Leaf photo uploaded by farmer"
                className="w-full h-full object-cover"
              />
            ) : (
              renderLeafSVG(activeProblem)
            )}

            {/* Laser Scanning Animation */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none z-30">
                <div className="w-full h-14 bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent border-b-2 border-emerald-300 animate-bounce" />
                <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
              </div>
            )}

            {/* Bottom Caption Overlay */}
            {!customImage && activeProblem && (
              <div className="absolute bottom-3 left-3 right-3 z-20 bg-black/75 backdrop-blur-md text-white text-xs leading-relaxed p-2.5 rounded-xl border-l-4 border-amber-400">
                <b className="text-amber-300 block mb-0.5">{getLocalizedProblemName(activeProblem.name, langCode)}:</b>
                {activeProblem.symptoms}
              </div>
            )}
          </div>

          {/* Sample Leaves Picker */}
          <div className="mt-4">
            <div className="text-xs font-bold text-[#5a7a69] mb-2">
              {getUIText('orPickSample', langCode)}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {currentVeg?.problems.map((prob, idx) => {
                const isSelected = !customImage && selectedSampleIdx === idx;
                return (
                  <button
                    key={prob.name}
                    onClick={() => {
                      setSelectedSampleIdx(idx);
                      setCustomImage(null);
                      setDiagnosisResult(null);
                    }}
                    className={`p-1.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2fbf71] bg-emerald-50/70 shadow-md scale-[1.02]'
                        : 'border-emerald-100 bg-[#f7fcf9] hover:border-emerald-300'
                    }`}
                  >
                    <div className="h-14 rounded-lg overflow-hidden bg-gradient-to-b from-emerald-50 to-emerald-100 flex items-center justify-center">
                      {renderLeafSVG(prob, true)}
                    </div>
                    <div className="mt-1 px-1">
                      <div className="font-bold text-[11px] text-[#12392a] truncate">
                        {getLocalizedProblemName(prob.name, langCode)}
                      </div>
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${
                        prob.type === 'deficiency'
                          ? 'bg-amber-100 text-amber-800'
                          : prob.type === 'healthy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {prob.type === 'deficiency' ? (langCode === 'or' ? 'ପୋଷକ ଅଭାବ' : 'Deficiency') : prob.type === 'healthy' ? (langCode === 'or' ? 'ସୁସ୍ଥ' : 'Healthy') : (langCode === 'or' ? 'ରୋଗ' : 'Disease')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right Column: Crop Variety & Stages & AI Diagnosis Action */}
        <section className="lg:col-span-5 bg-white rounded-3xl p-5 border border-[#d3eadb] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3.5">
              <h2 className="text-xl font-extrabold font-['Baloo_2'] text-[#12392a] flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-xl bg-pink-300 text-emerald-950 grid place-items-center font-black text-sm">
                  2
                </span>
                <span>{getUIText('step2Title', langCode)}</span>
              </h2>
            </div>

            {/* Vegetable Selector */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#12392a] mb-1">
                  {getUIText('selectVegetable', langCode)}
                </label>
                <select
                  value={selectedVegId}
                  onChange={e => onVegetableChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfe3d6] bg-white text-sm font-bold text-[#12392a] outline-none focus:border-[#0e9f5c] focus:ring-2 focus:ring-emerald-100"
                >
                  {vegetables.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.icon} {getLocalizedVegetableName(v.id, v.name, langCode)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Variety Selector */}
              {currentVeg && currentVeg.varieties.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-[#12392a] mb-1">
                    {getUIText('vegetableVariety', langCode)}
                  </label>
                  <select
                    value={selectedVariety}
                    onChange={e => setSelectedVariety(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#cfe3d6] bg-white text-xs sm:text-sm font-semibold text-[#12392a] outline-none focus:border-[#0e9f5c]"
                  >
                    {currentVeg.varieties.map(varName => (
                      <option key={varName} value={varName}>
                        {varName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Growth Stage Badges */}
              <div>
                <label className="block text-xs font-bold text-[#12392a] mb-1.5">
                  {getUIText('growthStage', langCode)}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentVeg?.stages.map((st, i) => {
                    const isSelected = selectedStageIdx === i;
                    return (
                      <button
                        key={st.name}
                        onClick={() => setSelectedStageIdx(i)}
                        className={`px-2.5 py-2 rounded-xl text-left font-bold text-xs border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[#0e9f5c] text-white border-[#0e9f5c] shadow-sm scale-102'
                            : 'border-[#cfe3d6] bg-[#f8fcf9] text-[#12392a] hover:bg-emerald-50'
                        }`}
                      >
                        <span className="text-base">{st.icon}</span>
                        <span className="truncate">{getLocalizedGrowthStage(st.name, langCode)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Observed Symptoms Text & Voice Mic */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#12392a]">
                    {getUIText('symptomsObserved', langCode)}
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border transition ${
                      isListening
                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                        : 'bg-emerald-50 text-[#0b7a45] border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                    <span>{isListening ? getUIText('listeningVoice', langCode) : getUIText('speak', langCode)}</span>
                  </button>
                </div>

                <textarea
                  rows={3}
                  value={symptomsText}
                  onChange={e => setSymptomsText(e.target.value)}
                  placeholder={getUIText('symptomsPlaceholder', langCode)}
                  className="w-full px-3 py-2 rounded-xl border border-[#cfe3d6] bg-white text-xs sm:text-sm text-[#12392a] outline-none focus:border-[#0e9f5c] focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </div>
          </div>

          {/* Run Diagnosis Button */}
          <button
            onClick={handleRunDiagnosis}
            disabled={isScanning}
            className="w-full mt-5 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#19b36b] via-[#2fbf71] to-[#19b36b] hover:brightness-105 active:scale-[0.99] transition text-emerald-950 font-extrabold font-['Baloo_2'] text-lg shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{getUIText('scanningLeaf', langCode)}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>{getUIText('runDiagnosis', langCode)}</span>
              </>
            )}
          </button>
        </section>
      </div>

      {/* Diagnosis Results Card with Remedies and PDF Export */}
      {diagnosisResult && (
        <section className="mt-6 bg-gradient-to-br from-[#e3f7ea] to-white rounded-3xl p-6 border border-[#cfe8d8] shadow-md animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-emerald-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                  diagnosisResult.problemType === 'deficiency'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : diagnosisResult.problemType === 'healthy'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                }`}>
                  {diagnosisResult.problemType === 'deficiency' ? (langCode === 'or' ? 'ପୋଷକ ଅଭାବ' : 'Nutrient Deficiency') : diagnosisResult.problemType === 'healthy' ? (langCode === 'or' ? 'ସୁସ୍ଥ ଫସଲ' : 'Healthy Crop') : (langCode === 'or' ? 'ଫସଲ ରୋଗ' : 'Crop Disease')}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  {getUIText('severityLabel', langCode)}: <b>{diagnosisResult.severity}</b>
                </span>
              </div>

              <h3 className="text-2xl font-black font-['Baloo_2'] text-[#12392a]">
                {diagnosisResult.problemName}
              </h3>
            </div>

            {/* Match Confidence & Export PDF Button */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-500">
                  {getUIText('matchConfidence', langCode)}
                </div>
                <div className="text-2xl font-extrabold text-[#0e9f5c] font-['Baloo_2']">
                  {diagnosisResult.confidence}%
                </div>
              </div>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0b7a45] to-[#0e9f5c] text-white font-bold text-xs sm:text-sm hover:shadow-lg transition cursor-pointer shadow-md"
              >
                <FileDown className="w-4 h-4" />
                <span>{getUIText('exportPdf', langCode)}</span>
              </button>
            </div>
          </div>

          {/* Symptoms description */}
          <div className="mt-4 p-3.5 bg-white/80 rounded-2xl border border-emerald-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <b className="text-emerald-900 font-bold block mb-1">{getUIText('observedDiagnostics', langCode)}:</b>
            {diagnosisResult.symptoms}
          </div>

          {/* Step-by-Step Remedies */}
          <div className="mt-5">
            <h4 className="text-sm font-extrabold text-[#12392a] uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{getUIText('recommendedActionPlan', langCode)}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {diagnosisResult.remedies?.map((rem: any, idx: number) => {
                const isOrg = rem.category === 'organic';
                const isChem = rem.category === 'chemical';

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isOrg
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : isChem
                        ? 'bg-amber-50/60 border-amber-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isOrg
                          ? 'bg-emerald-200 text-emerald-900'
                          : isChem
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        {rem.category === 'organic' ? getUIText('organicCategory', langCode) : rem.category === 'chemical' ? getUIText('chemicalCategory', langCode) : rem.category === 'cultural' ? getUIText('culturalCategory', langCode) : getUIText('preventiveCategory', langCode)}
                      </span>
                      {rem.dosage && (
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                          {getUIText('dosageLabel', langCode)}: {rem.dosage}
                        </span>
                      )}
                    </div>

                    <div className="font-bold text-sm text-[#12392a] mb-1">{rem.title}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rem.instructions}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gemini AI Agronomist Follow-up Q&A Section */}
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-white border border-emerald-200 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <h4 className="text-sm font-extrabold text-[#12392a]">
                {langCode === 'or' ? '💬 ଏହି ନିଦାନ ବିଷୟରେ Gemini AI କୃଷି ବୈଜ୍ଞାନିକଙ୍କୁ ପଚାରନ୍ତୁ' : '💬 Ask Gemini AI Agronomist About This Diagnosis'}
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              {langCode === 'or' ? 'କୀଟନାଶକ ମିଶ୍ରଣ, ସ୍ପ୍ରେ ସମୟ, ଅମଳ ସୁରକ୍ଷା ବା ପରବର୍ତ୍ତୀ ପ୍ରତିକାର ବିଷୟରେ ପଚାରନ୍ତୁ:' : 'Ask about chemical mixing compatibility, pre-harvest safety interval, or soil remediation:'}
            </p>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-2 mb-3">
              {(langCode === 'or'
                ? [
                    'ଜୈବିକ ଓ ରାସାୟନିକ ଔଷଧ ଏକାସାଙ୍ଗେ ସ୍ପ୍ରେ କରିହେବ କି?',
                    'ସ୍ପ୍ରେ କରିବାର କେତେ ଦିନ ପରେ ପନିପରିବା ତୋଳିବା ସୁରକ୍ଷିତ?',
                    'ପରବର୍ତ୍ତୀ ଫସଲରେ ଏହି ରୋଗକୁ କିପରି ସମ୍ପୂର୍ଣ୍ଣ ରୋକିବେ?'
                  ]
                : [
                    'Can I mix this bio-fungicide with neem oil or micronutrients?',
                    'What is the pre-harvest interval (PHI) before picking fruit?',
                    'How to prevent this disease in the next planting cycle?'
                  ]
              ).map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskFollowup(chip)}
                  disabled={followupLoading}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-semibold transition cursor-pointer text-left"
                >
                  💡 {chip}
                </button>
              ))}
            </div>

            {/* Custom Question Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={followupQuestion}
                onChange={e => setFollowupQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAskFollowup()}
                placeholder={langCode === 'or' ? 'ନିଜର ପ୍ରଶ୍ନ ଲେଖନ୍ତୁ...' : 'Ask your specific question to the AI Agronomist...'}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium outline-none focus:border-[#0e9f5c]"
              />
              <button
                type="button"
                onClick={() => handleAskFollowup()}
                disabled={followupLoading || !followupQuestion.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0b7a45] to-[#0e9f5c] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {followupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{followupLoading ? (langCode === 'or' ? 'ଉତ୍ତର ଆସୁଛି...' : 'Thinking...') : (langCode === 'or' ? 'ପଚାରନ୍ତୁ' : 'Ask')}</span>
              </button>
            </div>

            {/* Follow-up Response Card */}
            {followupResponse && (
              <div className="mt-3.5 p-3.5 rounded-xl bg-[#f0fbf4] border border-emerald-200 text-xs sm:text-sm animate-in fade-in">
                <div className="font-extrabold text-[#12392a] mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{langCode === 'or' ? 'AI କୃଷି ବୈଜ୍ଞାନିକଙ୍କ ପରାମର୍ଶ:' : 'AI Agronomist Verdict:'}</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium mb-2">
                  {followupResponse.answer}
                </p>
                {followupResponse.practicalTips && followupResponse.practicalTips.length > 0 && (
                  <ul className="space-y-1 mb-2 pt-2 border-t border-emerald-200/60">
                    {followupResponse.practicalTips.map((tip: string, idx: number) => (
                      <li key={idx} className="text-emerald-950 flex items-start gap-1.5 text-xs">
                        <span className="text-emerald-600 font-black">✓</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {followupResponse.safetyWarning && (
                  <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200 font-semibold">
                    ⚠️ {followupResponse.safetyWarning}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save Status & Local KVK advisory */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-emerald-100">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{getUIText('scanSavedSuccess', langCode)}</span>
              <button
                onClick={onViewHistory}
                className="underline ml-1 text-emerald-900 hover:text-black cursor-pointer font-extrabold"
              >
                {getUIText('viewInHistory', langCode)}
              </button>
            </div>

            <div className="text-[11px] text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{getUIText('advisoryDisclaimer', langCode)}</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};