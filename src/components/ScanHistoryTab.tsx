import React, { useState } from 'react';
import { ScanRecord } from '../types.ts';
import { generateDiagnosisPDF } from '../services/pdfExport.ts';
import { getUIText } from '../i18n/languages.ts';
import { deleteScanRecord } from '../services/api.ts';
import { Search, FileDown, Trash2, Calendar, MapPin, Eye, X, AlertCircle } from 'lucide-react';

interface ScanHistoryTabProps {
  scans: ScanRecord[];
  onRefresh: () => void;
  langCode: string;
  showToast: (msg: string) => void;
  onNewScan: () => void;
}

export const ScanHistoryTab: React.FC<ScanHistoryTabProps> = ({
  scans,
  onRefresh,
  langCode,
  showToast,
  onNewScan
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVegFilter, setSelectedVegFilter] = useState('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [activeModalScan, setActiveModalScan] = useState<ScanRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract unique vegetables for filter
  const uniqueVegetables = Array.from(new Set(scans.map(s => s.vegetable)));

  const filteredScans = scans.filter(s => {
    const matchesSearch =
      s.problemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vegetable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.symptoms.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVeg =
      selectedVegFilter === 'all' || s.vegetable.toLowerCase() === selectedVegFilter.toLowerCase();

    const matchesType =
      selectedTypeFilter === 'all' || s.problemType.toLowerCase() === selectedTypeFilter.toLowerCase();

    return matchesSearch && matchesVeg && matchesType;
  });

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this scan record from database?')) return;

    setDeletingId(id);
    const success = await deleteScanRecord(id);
    setDeletingId(null);
    if (success) {
      showToast('Scan record deleted from backend.');
      onRefresh();
    } else {
      showToast('Failed to delete scan.');
    }
  };

  const handleDownloadPDF = (scan: ScanRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    generateDiagnosisPDF(scan);
    showToast(`PDF Report downloaded for ${scan.vegetable} (${scan.problemName})`);
  };

  const diseaseCount = scans.filter(s => s.problemType === 'disease').length;
  const deficiencyCount = scans.filter(s => s.problemType === 'deficiency').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-28">
      {/* Intro Header & Stats */}
      <div className="bg-gradient-to-br from-[#e3f7ea] via-white to-[#f1fbf5] rounded-3xl p-6 border border-[#cfe8d8] shadow-sm mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block bg-[#d6f3e2] text-[#0b7a45] font-extrabold text-xs px-3 py-1 rounded-full mb-2">
              📋 {getUIText('historyTitle', langCode)}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-['Baloo_2'] text-[#12392a]">
              {getUIText('scanHistory', langCode)}
            </h1>
            <p className="text-xs sm:text-sm text-[#4a6b59] max-w-2xl mt-1">
              {getUIText('historySubtitle', langCode)}
            </p>
          </div>

          <button
            onClick={onNewScan}
            className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#0e9f5c] to-[#2fbf71] text-white font-extrabold text-xs sm:text-sm shadow-md hover:brightness-105 transition cursor-pointer"
          >
            {getUIText('runNewScan', langCode)}
          </button>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-emerald-100">
          <div className="bg-white/80 p-3 rounded-2xl border border-emerald-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase">{getUIText('totalScans', langCode)}</span>
            <div className="text-2xl font-black font-['Baloo_2'] text-[#12392a]">{scans.length}</div>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-emerald-100">
            <span className="text-[11px] font-bold text-rose-600 uppercase">{getUIText('diseasesCount', langCode)}</span>
            <div className="text-2xl font-black font-['Baloo_2'] text-rose-700">{diseaseCount}</div>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-emerald-100">
            <span className="text-[11px] font-bold text-amber-600 uppercase">{getUIText('nutrientGaps', langCode)}</span>
            <div className="text-2xl font-black font-['Baloo_2'] text-amber-700">{deficiencyCount}</div>
          </div>
          <div className="bg-white/80 p-3 rounded-2xl border border-emerald-100">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">{getUIText('databaseStatus', langCode)}</span>
            <div className="text-xs font-extrabold text-emerald-700 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{getUIText('acidPersistent', langCode)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-[#d3eadb] shadow-sm mb-6 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={getUIText('searchHistory', langCode)}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 outline-none focus:border-[#0e9f5c]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Vegetable Filter */}
          <select
            value={selectedVegFilter}
            onChange={e => setSelectedVegFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-[#0e9f5c]"
          >
            <option value="all">{getUIText('filterByVegetable', langCode)}</option>
            {uniqueVegetables.map(v => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {/* Problem Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={e => setSelectedTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 outline-none focus:border-[#0e9f5c]"
          >
            <option value="all">{getUIText('filterByProblem', langCode)}</option>
            <option value="disease">{langCode === 'or' ? 'ରୋଗ' : 'Diseases'}</option>
            <option value="deficiency">{langCode === 'or' ? 'ପୋଷକ ଅଭାବ' : 'Nutrient Deficiencies'}</option>
            <option value="healthy">{langCode === 'or' ? 'ସୁସ୍ଥ ପତ୍ର' : 'Healthy Leaves'}</option>
          </select>
        </div>
      </div>

      {/* Scans List Cards */}
      {filteredScans.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-emerald-200">
          <div className="text-4xl mb-2">🌿</div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">
            {getUIText('noScansFound', langCode)}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Try adjusting your search filters or run a new AI crop leaf diagnosis.
          </p>
          <button
            onClick={onNewScan}
            className="px-4 py-2 rounded-full bg-[#0e9f5c] text-white text-xs font-bold"
          >
            Run Crop Diagnosis
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScans.map(scan => {
            const isDef = scan.problemType === 'deficiency';
            const isHealthy = scan.problemType === 'healthy';

            return (
              <div
                key={scan.id}
                onClick={() => setActiveModalScan(scan)}
                className="bg-white rounded-2xl p-5 border border-[#d3eadb] shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-extrabold text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                      <span>🌱</span>
                      <span>{scan.vegetable}</span>
                      <span className="opacity-60 font-normal">({scan.stage})</span>
                    </span>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isHealthy
                          ? 'bg-emerald-100 text-emerald-800'
                          : isDef
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {scan.problemType === 'deficiency' ? 'Nutrient Gap' : scan.problemType}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold font-['Baloo_2'] text-[#12392a] group-hover:text-[#0e9f5c] transition-colors">
                    {scan.problemName}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                    {scan.symptoms}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold mt-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(scan.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {scan.location || 'Sambalpur, Odisha'}
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
                  <div className="text-xs font-bold text-[#0e9f5c]">
                    Match: <b>{scan.confidence}%</b> • {scan.severity}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => handleDownloadPDF(scan, e)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0b7a45] text-xs font-bold transition"
                      title="Download PDF Report"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={e => handleDelete(scan.id, e)}
                      disabled={deletingId === scan.id}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Diagnosis Details Modal */}
      {activeModalScan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-emerald-100 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  Report ID: {activeModalScan.id}
                </span>
                <h2 className="text-2xl font-black font-['Baloo_2'] text-[#12392a]">
                  {activeModalScan.problemName}
                </h2>
                <div className="text-xs text-slate-500 font-semibold mt-0.5">
                  {activeModalScan.vegetable} ({activeModalScan.variety}) • {activeModalScan.stage} •{' '}
                  {new Date(activeModalScan.createdAt).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => setActiveModalScan(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center text-slate-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnostic Symptoms */}
            <div className="p-3.5 bg-slate-50 rounded-2xl mb-4 text-xs sm:text-sm text-slate-700 leading-relaxed border border-slate-100">
              <b className="text-slate-900 block mb-1">Diagnosed Symptoms:</b>
              {activeModalScan.symptoms}
            </div>

            {/* Actionable Remedies */}
            <h4 className="text-xs font-black uppercase text-emerald-900 mb-2">
              Recommended Remedies & Treatment Plan
            </h4>
            <div className="space-y-2.5 mb-5">
              {activeModalScan.remedies?.map((rem, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs sm:text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      {rem.category}
                    </span>
                    {rem.dosage && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        Dosage: {rem.dosage}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-[#12392a]">{rem.title}</div>
                  <div className="text-slate-600 text-xs mt-0.5">{rem.instructions}</div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveModalScan(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                onClick={e => handleDownloadPDF(activeModalScan, e)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0b7a45] to-[#0e9f5c] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Export PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
