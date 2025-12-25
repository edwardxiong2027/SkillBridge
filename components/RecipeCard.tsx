import React, { useState } from 'react';
import { AnalysisResult, InterviewQuestion } from '../types';
import { 
  Briefcase, CheckCircle, TrendingUp, DollarSign, Star, FileText, 
  Zap, Copy, MessageSquare, Shield, ChevronDown, ChevronUp 
} from 'lucide-react';

interface AnalysisResultDisplayProps {
  result: AnalysisResult;
}

export const AnalysisResultDisplay: React.FC<AnalysisResultDisplayProps> = ({ result }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'resume' | 'prep'>('overview');

  const CopyButton = ({ text }: { text: string }) => (
    <button 
      onClick={() => navigator.clipboard.writeText(text)}
      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center bg-indigo-50 px-3 py-1.5 rounded-full transition hover:bg-indigo-100"
    >
      <Copy size={12} className="mr-1.5" /> Copy
    </button>
  );

  return (
    <div className="space-y-6 animate-slide-up pb-12">
      
      {/* Vibe Check Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-200">
        <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-6">
          <div className="text-6xl md:text-7xl bg-white/20 p-4 rounded-2xl backdrop-blur-sm shadow-inner">
            {result.vibeEmoji}
          </div>
          <div>
            <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase mb-2">
              Vibe Check
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-2">{result.vibe}</h2>
            <p className="text-indigo-100 text-lg max-w-xl">{result.summary}</p>
          </div>
        </div>

        {/* Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {result.badges.map((badge, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center gap-3 hover:bg-white/20 transition">
              <div className="text-3xl">{badge.emoji}</div>
              <div className="text-left">
                <h4 className="font-bold text-sm">{badge.name}</h4>
                <p className="text-xs text-indigo-100">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex p-1 bg-slate-200/50 rounded-xl overflow-x-auto">
         {[
           { id: 'overview', label: 'Quest Board', icon: Star },
           { id: 'resume', label: 'Loot', icon: Briefcase },
           { id: 'prep', label: 'Boss Prep', icon: Shield }
         ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`
               flex-1 flex items-center justify-center py-3 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap
               ${activeTab === tab.id ? 'bg-white text-indigo-600 shadow-md scale-100' : 'text-slate-500 hover:text-slate-700'}
             `}
           >
             <tab.icon size={16} className="mr-2" />
             {tab.label}
           </button>
         ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        
        {/* TAB 1: OVERVIEW (Skills & Careers) */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Skills Graph */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                    <Zap className="text-amber-500 mr-2" fill="currentColor" /> Skill Tree
                  </h3>
                  <div className="space-y-5">
                    {result.skills.map((skill, idx) => (
                      <div key={idx} className="group">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-bold text-slate-700">{skill.name}</span>
                          <span className="text-slate-400 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded-md">{skill.category}</span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-1000"
                            style={{ width: `${skill.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Career Paths */}
                <div className="space-y-4">
                  {result.careers.map((career, idx) => (
                    <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-slate-800">{career.title}</h4>
                        <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full font-extrabold">
                          {career.matchPercentage}% MATCH
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">{career.description}</p>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                            <DollarSign size={14} className="mr-1 text-emerald-600" /> {career.avgSalary}
                         </div>
                         <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                            <TrendingUp size={14} className="mr-1 text-blue-600" /> {career.outlook}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* TAB 2: RESUME & PITCH */}
        {activeTab === 'resume' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Elevator Pitch */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-6 md:p-8 text-white shadow-lg">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold flex items-center">
                   <MessageSquare className="mr-2" /> Elevator Pitch (30s)
                 </h3>
                 <button onClick={() => navigator.clipboard.writeText(result.elevatorPitch)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition">
                    <Copy size={18} />
                 </button>
               </div>
               <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                 <p className="text-lg leading-relaxed font-medium">"{result.elevatorPitch}"</p>
               </div>
               <p className="text-rose-100 text-xs mt-4 text-center font-medium opacity-80">
                 *Memorize this for career fairs or intro emails!
               </p>
            </div>

            {/* Resume Builder */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <FileText className="text-blue-500 mr-2" /> Resume Power-Ups
                </h3>
                <CopyButton text={result.resumePoints.join('\n')} />
              </div>
              
              <div className="space-y-4">
                {result.resumePoints.map((point, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-100 transition group">
                    <div className="mt-1 flex-shrink-0">
                      <CheckCircle className="text-blue-500" size={20} />
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERVIEW PREP */}
        {activeTab === 'prep' && (
           <div className="space-y-4 animate-fade-in">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                 <h3 className="text-xl font-bold text-slate-800 mb-2">Boss Battle: Interview Prep</h3>
                 <p className="text-slate-500 text-sm mb-6">Prepare for these questions to crush your next interview.</p>
                 
                 <div className="space-y-4">
                    {result.interviewQuestions.map((q, idx) => (
                      <InterviewCard key={idx} question={q} index={idx} />
                    ))}
                 </div>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

// Sub-component for accordion style interview questions
const InterviewCard: React.FC<{ question: InterviewQuestion, index: number }> = ({ question, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-indigo-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 text-left transition"
      >
         <div className="flex items-center gap-4">
            <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
               {index + 1}
            </span>
            <span className="font-bold text-slate-800">{question.question}</span>
         </div>
         {isOpen ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
      </button>
      
      {isOpen && (
         <div className="p-5 bg-white border-t border-slate-100 animate-fade-in">
            <div className="flex gap-3">
               <div className="mt-1">
                  <Zap size={18} className="text-amber-500 fill-amber-500" />
               </div>
               <div>
                  <h5 className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Pro Tip</h5>
                  <p className="text-slate-600 leading-relaxed">{question.tip}</p>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
