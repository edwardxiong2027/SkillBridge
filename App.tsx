import React, { useState, useEffect } from 'react';
import { CameraScanner } from './components/CameraScanner';
import { AnalysisResultDisplay } from './components/RecipeCard'; // Importing from repurposed file
import { analyzeExperience, digitizeDocument } from './services/geminiService';
import { AnalysisResult, AppState } from './types';
import { 
  Camera, 
  Sparkles, 
  Briefcase,
  Loader2,
  ArrowRight,
  Edit3,
  X,
  GraduationCap
} from 'lucide-react';

// Simple CSS confetti using particles (no external lib for weight)
const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div 
           key={i}
           className="absolute animate-fall"
           style={{
             left: `${Math.random() * 100}%`,
             top: `-5%`,
             backgroundColor: ['#f43f5e', '#8b5cf6', '#10b981', '#f59e0b'][Math.floor(Math.random() * 4)],
             width: '10px',
             height: '20px',
             animationDuration: `${Math.random() * 2 + 2}s`,
             animationDelay: `${Math.random() * 2}s`,
             transform: `rotate(${Math.random() * 360}deg)`
           }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};

export default function App() {
  const [inputText, setInputText] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [status, setStatus] = useState<AppState['status']>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const handleDocumentCapture = async (imageData: string) => {
    setStatus('scanning');
    setStatusMessage('Reading document...');
    try {
      const text = await digitizeDocument(imageData);
      setInputText(prev => (prev ? prev + '\n\n' + text : text));
      setStatus('idle');
    } catch (e) {
      setStatus('error');
      setStatusMessage('Could not read document.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setStatus('analyzing');
    setStatusMessage('Unlocking your potential...');
    
    try {
      const data = await analyzeExperience(inputText);
      setResult(data);
      setStatus('success');
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5s
    } catch (e) {
      setStatus('error');
      setStatusMessage('Analysis failed. Please try again.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {showConfetti && <Confetti />}

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
              <Briefcase className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">SkillBridge</span>
          </div>
          <button 
            onClick={() => setShowHelp(true)}
            className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition flex items-center bg-slate-100 px-3 py-2 rounded-lg hover:bg-indigo-50"
          >
            <GraduationCap size={18} className="mr-2" />
            How it works
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-10">
        
        {/* Hero Section (Only show if no results yet to save space after analysis) */}
        {!result && (
          <div className="text-center space-y-6 max-w-3xl mx-auto animate-fade-in mt-8">
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
              Level up your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">future career.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
              Turn your gaming hours, club projects, or weekend jobs into a professional profile that gets you hired.
            </p>
          </div>
        )}

        {/* Input Area - Hide if result is showing to focus on dashboard */}
        {!result && (
          <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100 overflow-hidden border border-slate-100 animate-slide-up">
            <div className="p-1 bg-slate-50 border-b border-slate-100 flex gap-1">
               <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                 Your Story
               </div>
            </div>
            
            <div className="p-6">
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="What have you been up to? &#10;Example: 'I built a discord bot for my gaming clan using Python, I manage the inventory for the school store, and I volunteer at the animal shelter on weekends.'"
                  className="w-full h-48 p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-0 transition-all resize-none text-slate-700 placeholder-slate-400 leading-relaxed text-lg"
                />
                <button 
                  onClick={() => setShowCamera(true)}
                  className="absolute right-4 bottom-4 p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all hover:scale-110 active:scale-95"
                  title="Scan Document"
                >
                  <Camera size={22} />
                </button>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  disabled={!inputText.trim() || status === 'analyzing' || status === 'scanning'}
                  onClick={handleAnalyze}
                  className={`
                    flex items-center px-8 py-4 rounded-xl font-bold text-lg text-white shadow-lg shadow-indigo-200 transition-all transform
                    ${!inputText.trim() ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:scale-[1.02] active:scale-[0.98]'}
                  `}
                >
                  {status === 'analyzing' ? (
                    <>
                      <Loader2 size={24} className="animate-spin mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} className="mr-2" />
                      Unlock My Profile
                      <ArrowRight size={20} className="ml-2 opacity-80" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading / Status State */}
        {(status === 'scanning' || status === 'error') && (
          <div className={`flex items-center justify-center p-4 rounded-xl font-bold ${status === 'error' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-700'}`}>
            {status === 'scanning' && <Loader2 className="animate-spin mr-2" size={20} />}
            <span className="font-medium">{statusMessage}</span>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div id="results" className="animate-fade-in">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-3xl font-extrabold text-slate-900">Your Dashboard</h2>
                   <p className="text-slate-500">Here is your professional breakdown.</p>
                </div>
                <button 
                  onClick={() => { setInputText(''); setResult(null); }}
                  className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:shadow transition"
                >
                  <Edit3 size={16} className="mr-2" /> New Scan
                </button>
             </div>
             <AnalysisResultDisplay result={result} />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-slate-400 font-medium">
            © {new Date().getFullYear()} SkillBridge AI. Built for the future.
          </p>
        </div>
      </footer>

      {/* Camera Modal */}
      {showCamera && (
        <CameraScanner 
          onCapture={handleDocumentCapture} 
          onClose={() => setShowCamera(false)} 
        />
      )}

      {/* How It Works Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative animate-slide-up border border-white/20">
            <button 
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            >
              <X size={24} />
            </button>
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-4 rotate-3">
                <Sparkles size={32} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">How it Works</h2>
            </div>

            <div className="space-y-6">
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-lg">1</div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Share Your Story</h3>
                  <p className="text-slate-600 mt-1">Type in your experiences, hobbies, or just upload a photo of your rough resume or activity log.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-lg">2</div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Get Analyzed</h3>
                  <p className="text-slate-600 mt-1">Our AI detects your hidden "Vibe" and translates your gaming/hobby skills into professional traits.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-lg">3</div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Level Up</h3>
                  <p className="text-slate-600 mt-1">Get an elevator pitch, interview cheat codes, and badges to boost your confidence.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowHelp(false)}
              className="w-full mt-10 bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              Let's Go!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}