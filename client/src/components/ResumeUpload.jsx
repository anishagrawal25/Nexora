import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
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
      setError('Please select a PDF file first.');
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
    <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 shadow-xs">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
            Upload Your Resume
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Supported format: PDF up to 5MB. Evaluates technical skills, experience depth, and project impact.
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

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isBusy && fileInputRef.current?.click()}
            className={`border border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-zinc-900 bg-zinc-50/80 ring-2 ring-zinc-900/10'
                : file
                ? 'border-zinc-300 bg-zinc-50/50'
                : 'border-zinc-200 bg-zinc-50/30 hover:bg-zinc-50 hover:border-zinc-300'
            } ${isBusy ? 'pointer-events-none opacity-70' : ''}`}
          >
            {file ? (
              <div className="flex items-center gap-3 w-full max-w-sm bg-white border border-zinc-200 p-3 rounded-lg shadow-xs">
                <div className="w-9 h-9 rounded-md bg-zinc-100 flex items-center justify-center text-zinc-700 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-medium text-zinc-900 truncate">{file.name}</p>
                  <p className="text-[11px] font-mono text-zinc-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF
                  </p>
                </div>
                {!isBusy && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="p-1 text-zinc-400 hover:text-zinc-700 rounded transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-zinc-800">
                    <span className="text-zinc-900 font-semibold underline underline-offset-2">
                      Click to browse
                    </span>{' '}
                    or drag and drop your PDF
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                    PDF document only (max 5MB)
                  </p>
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

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={!file || isBusy}
              className="w-full sm:w-auto bg-zinc-900 text-white rounded-lg px-5 py-2.5 text-xs sm:text-sm font-medium hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xs inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                  <span>{uploading ? 'Uploading PDF...' : 'Analyzing with Gemini...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                  <span>Start Resume Analysis</span>
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