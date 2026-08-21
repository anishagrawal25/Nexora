import { useState } from 'react';
import { uploadResume, apiRequest } from '../api';

function ResumeUpload({ onAnalysisComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  function handleFileChange(e) {
    setFile(e.target.files[0]);
    setError('');
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
      setError(err.message);
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }

  return (
    <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6">
      <h3 className="text-lg mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
        Upload your resume
      </h3>
      <p className="text-sm text-[#5B6670] mb-4">
        PDF only, up to 5MB. We'll analyze it and show your readiness score.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="text-sm"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={uploading || analyzing}
          className="bg-[#1F6F5C] text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-[#195A4A] transition disabled:opacity-60"
        >
          {uploading ? 'Uploading...' : analyzing ? 'Analyzing with AI...' : 'Upload & Analyze'}
        </button>
      </form>
    </div>
  );
}

export default ResumeUpload;