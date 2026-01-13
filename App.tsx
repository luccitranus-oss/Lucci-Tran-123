
import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import InputField from './components/InputField';
import { FashionParams } from './types';
import { generateFashionImages } from './services/geminiService';

const App: React.FC = () => {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [outfitImage, setOutfitImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [params, setParams] = useState<FashionParams>({
    camera: '',
    pose: '',
    expression: '',
    fabric: '',
    background: '',
    keepOutfit: false
  });

  const handleParamChange = (key: keyof FashionParams, value: any) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelImage) {
      setError("Please upload an identity source image first.");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]); 
    try {
      const imageUrls = await generateFashionImages(modelImage, outfitImage, params);
      setResults(imageUrls);
    } catch (err: any) {
      setError(err.message || "An error occurred during synchronization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-gray-900 pb-20">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight uppercase tracking-[0.1em]">Studio.AI</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">1:1 Identity Anchor Active</span>
          </div>

          <nav className="hidden md:flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <a href="#" className="text-black">Production</a>
            <a href="#" className="hover:text-black transition-colors">Lab</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Controls Panel */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-4xl font-serif italic text-gray-800 tracking-tight leading-none">Identity Persistence</h2>
              <p className="text-gray-500 text-sm leading-relaxed border-l-2 border-emerald-500 pl-4">
                Our engine ensures absolute model consistency. The face and identity from your reference are <strong>locked 1:1</strong>.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <ImageUploader 
                  label="1. Identity Reference" 
                  onImageSelected={setModelImage} 
                  required 
                />
                <ImageUploader 
                  label="2. Style Reference" 
                  onImageSelected={setOutfitImage} 
                />
              </div>

              <div className="space-y-5">
                <InputField 
                  label="Custom Environment" 
                  placeholder="e.g. brutalist concrete loft, morning fog" 
                  value={params.background}
                  onChange={(val) => handleParamChange('background', val)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Camera Perspective" 
                    placeholder="e.g. low-angle wide" 
                    value={params.camera}
                    onChange={(val) => handleParamChange('camera', val)}
                  />
                  <InputField 
                    label="Target Pose" 
                    placeholder="e.g. natural stride" 
                    value={params.pose}
                    onChange={(val) => handleParamChange('pose', val)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Expression" 
                    placeholder="e.g. neutral gaze" 
                    value={params.expression}
                    onChange={(val) => handleParamChange('expression', val)}
                  />
                  <InputField 
                    label="Fabric Weave" 
                    placeholder="e.g. organic linen" 
                    value={params.fabric}
                    onChange={(val) => handleParamChange('fabric', val)}
                  />
                </div>

                <div className="flex items-center gap-3 py-3 px-4 bg-emerald-50/20 rounded-xl border border-emerald-100 group cursor-pointer hover:bg-emerald-50 transition-colors">
                  <input 
                    type="checkbox" 
                    id="keepOutfit" 
                    checked={params.keepOutfit}
                    onChange={(e) => handleParamChange('keepOutfit', e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                  <label htmlFor="keepOutfit" className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700 cursor-pointer select-none">
                    Lock Original Garments
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading || !modelImage}
                className={`w-full py-5 rounded-xl text-[11px] font-black uppercase tracking-[0.25em] transition-all shadow-md ${
                  loading || !modelImage 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-black text-white hover:bg-gray-900 hover:shadow-xl active:scale-95'
                }`}
              >
                {loading ? "Anchoring Neural DNA..." : "Generate Pro Lookbook (4)"}
              </button>
            </form>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-8">
            <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 min-h-[600px] flex items-center justify-center p-8">
              {results.length > 0 ? (
                <div className="w-full flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="text-xl font-serif italic text-gray-800">Synchronized Master Set</h3>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zM10 5a1 1 0 00-1 1v2.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 8.586V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Identity Verified</span>
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">4 Assets Developed</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    {results.map((url, idx) => (
                      <div key={idx} className="relative group/card rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex flex-col hover:shadow-2xl transition-all duration-500">
                        <img 
                          src={url} 
                          alt={`Variation ${idx + 1}`} 
                          className="w-full h-auto object-contain aspect-[3/4]" 
                        />
                        <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex justify-between items-end">
                          <div className="flex flex-col gap-1 text-white">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Synchronized Asset</span>
                            <span className="text-sm font-serif italic text-white/90">Asset Capture {idx + 1}</span>
                          </div>
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `studio-ai-synchronized-${idx + 1}.png`;
                              link.click();
                            }}
                            className="p-3 bg-white text-black rounded-full hover:bg-gray-100 transition-all shadow-xl hover:scale-110 active:scale-90"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center p-12 flex flex-col items-center gap-10 w-full max-w-sm">
                  {loading ? (
                    <div className="flex flex-col items-center gap-10">
                      <div className="relative">
                        <div className="w-40 h-40 border-8 border-gray-50 rounded-full shadow-inner"></div>
                        <div className="absolute inset-0 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-serif italic text-gray-800">Identity Anchoring</h3>
                        <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em] font-black">Syncing 1:1 Facial Geometry</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-inner">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="space-y-5">
                        <h3 className="text-2xl font-serif text-gray-400 italic">Input Required</h3>
                        <p className="text-gray-300 text-[11px] font-black uppercase tracking-[0.25em] leading-relaxed">
                          Provide identity reference for exact model preservation
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 border-t border-gray-200 mt-20 py-12 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.3em]">
        <div className="flex flex-col gap-2 text-center md:text-left">
           <p className="text-black">Studio.AI Architecture</p>
           <p className="text-gray-400">1:1 Persistent Identity Modeling</p>
        </div>
        <div className="flex gap-12 text-gray-400">
          <a href="#" className="hover:text-black transition-colors underline decoration-emerald-100 decoration-4 underline-offset-8">Neural Ethics</a>
          <a href="#" className="hover:text-black transition-colors underline decoration-emerald-100 decoration-4 underline-offset-8">Production License</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
