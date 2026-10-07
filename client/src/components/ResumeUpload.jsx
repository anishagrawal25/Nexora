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
    <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="max-w-2xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-6">
          <span className="font-mono text-xs uppercase tracking-widest text-[#1F6F5C] font-medium block mb-1">
            Resume Extraction
          </span>
          <h2 className="font-serif italic text-2xl font-medium text-[#12181B] tracking-tight">
            Upload Your Resume
          </h2>
          <p className="text-xs sm:text-sm text-[#5B6670] mt-1 max-w-md mx-auto">
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
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3.5 ${
              isDragging
                ? 'border-[#1F6F5C] bg-[#EBF3F0]/60 ring-4 ring-[#1F6F5C]/10'
                : file
                ? 'border-[#1F6F5C]/40 bg-[#EBF3F0]/20'
                : 'border-[#E4E1D8] bg-[#FBFAF6] hover:bg-[#EBF3F0]/30 hover:border-[#1F6F5C]/60 hover:shadow-xs'
            } ${isBusy ? 'pointer-events-none opacity-70' : ''}`}
          >
            {file ? (
              <div className="flex items-center gap-3.5 w-full max-w-md bg-white border border-[#E4E1D8] p-4 rounded-xl shadow-xs">
                <div className="w-10 h-10 rounded-lg bg-[#EBF3F0] flex items-center justify-center text-[#1F6F5C] shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs sm:text-sm font-semibold text-[#12181B] truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] font-mono text-[#5B6670] mt-0.5">
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
                    className="p-1.5 text-[#5B6670] hover:text-[#12181B] hover:bg-[#F2EFE9] rounded-lg transition cursor-pointer"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="w-11 h-11 rounded-xl bg-[#EBF3F0] flex items-center justify-center text-[#1F6F5C]">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#12181B]">
                    <span className="text-[#1F6F5C] font-semibold hover:underline">
                      Click to browse
                    </span>{' '}
                    or drag and drop your PDF
                  </p>
                  <p className="text-[11px] text-[#5B6670] mt-1 font-mono">
                    Encrypted upload • PDF format up to 5.0 MB
                  </p>
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-[#5B6670] font-mono text-center sm:text-left">
              {file
                ? 'Ready for extraction — click Start Resume Analysis.'
                : 'Select or drop a PDF file above to begin evaluation.'}
            </p>

            <button
              type="submit"
              disabled={!file || isBusy}
              className={`w-full sm:w-auto rounded-xl px-6 py-2.5 text-xs sm:text-sm font-medium transition inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                file && !isBusy
                  ? 'bg-[#1F6F5C] hover:bg-[#185849] active:bg-[#14493D] text-white'
                  : 'bg-[#F2EFE9] text-[#5B6670]/60 border border-[#E4E1D8] cursor-not-allowed shadow-none'
              }`}
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                  <span>{uploading ? 'Uploading PDF...' : 'Analyzing with Gemini...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className={`w-4 h-4 ${file ? 'text-white/80' : 'text-[#5B6670]/50'}`} />
                  <span>Start Resume Analysis</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${file ? 'text-white/80' : 'text-[#5B6670]/50'}`} />
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