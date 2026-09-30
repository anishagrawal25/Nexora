import { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  FileCheck,
} from 'lucide-react';
import { uploadResume, apiRequest } from '../api';

function ResumeUpload({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  function handleFileSelection(selectedFile) {
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('Please select a valid PDF file.');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB limit.');
      return;
    }
    setFile(selectedFile);
    setError('');
  }

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume file first.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const uploadData = await uploadResume(file);
      setUploading(false);

      setAnalyzing(true);
      const analysisData = await apiRequest('/resume/analyze', {
        method: 'POST',
        body: JSON.stringify({ resumeId: uploadData.resumeId }),
      });

      onAnalysisComplete(analysisData.analysis);
    } catch (err) {
      setError(err.message || 'Failed to analyze resume.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }

  const isBusy = uploading || analyzing;

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 shadow-xs">
      <div className="max-w-2xl mx-auto">
        {/* Subtle Product Workflow Track (Not a giant infographic) */}
        <div className="mb-7 pb-5 border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-semibold flex items-center justify-center shrink-0 shadow-xs">
              01
            </span>
            <span className="font-semibold text-indigo-900">Upload PDF</span>
          </div>

          <div className="flex-1 max-w-[40px] sm:max-w-[60px] h-px bg-slate-200 mx-2" />

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold flex items-center justify-center shrink-0 border border-slate-200">
              02
            </span>
            <span className="text-zinc-600 hidden sm:inline">Target Role</span>
          </div>

          <div className="flex-1 max-w-[40px] sm:max-w-[60px] h-px bg-slate-200 mx-2" />

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-semibold flex items-center justify-center shrink-0 border border-slate-200">
              03
            </span>
            <span className="text-zinc-600 hidden sm:inline">Gap Analysis</span>
          </div>
        </div>

        {/* Section Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">
            Upload Your Resume
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-md mx-auto">
            Extract technical competencies, project depth, and experience signals to benchmark your
            placement readiness.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={(e) => handleFileSelection(e.target.files[0])}
            className="hidden"
            disabled={isBusy}
          />

          {/* Interactive Drag & Drop Box */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isBusy && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3.5 ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/70 ring-4 ring-indigo-500/10'
                : file
                ? 'border-indigo-300 bg-indigo-50/20'
                : 'border-slate-200 bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-300 hover:shadow-xs'
            } ${isBusy ? 'pointer-events-none opacity-70' : ''}`}
          >
            {file ? (
              <div className="flex items-center gap-3.5 w-full max-w-md bg-white border border-indigo-200 p-4 rounded-xl shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                  </p>
                </div>
                {!isBusy && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-zinc-800">
                    <span className="text-indigo-600 font-semibold hover:underline">
                      Click to browse
                    </span>{' '}
                    or drag and drop your PDF
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                    PDF document · Max file size 5.0 MB
                  </p>
                </div>

                {/* Supporting information tags */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-slate-200/60 w-full max-w-md">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-zinc-600 border border-slate-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    ATS-Friendly Parsing
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-zinc-600 border border-slate-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    Encrypted & Confidential
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-zinc-600 border border-slate-200 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-indigo-600" />
                    Structured Extraction
                  </span>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary CTA with Helpful Helper State */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-zinc-400 font-mono text-center sm:text-left">
              {file
                ? 'Ready for extraction — click Start Resume Analysis.'
                : 'Select or drop a PDF file above to begin analysis.'}
            </p>

            <button
              type="submit"
              disabled={!file || isBusy}
              className={`w-full sm:w-auto rounded-lg px-6 py-2.5 text-xs sm:text-sm font-semibold transition inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                file && !isBusy
                  ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-200/60'
                  : 'bg-slate-100 text-zinc-400 border border-slate-200 cursor-not-allowed shadow-none'
              }`}
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
                  <span>{uploading ? 'Uploading PDF...' : 'Analyzing with Gemini...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className={`w-4 h-4 ${file ? 'text-indigo-200' : 'text-zinc-400'}`} />
                  <span>Start Resume Analysis</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${file ? 'text-indigo-200' : 'text-zinc-400'}`} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResumeUpload;