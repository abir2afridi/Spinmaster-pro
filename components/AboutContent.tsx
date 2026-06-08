import React, { useState } from 'react';
import { Disc, Sparkles, Shield, Palette, Volume2, Globe, Database, Zap, ChevronDown, Heart, Layers, Navigation, Circle } from 'lucide-react';
import { t } from '../utils/translations';

const AboutContent: React.FC<{ language: string }> = ({ language }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    { icon: <Disc size={20} />, title: t('aboutFeatureCustomEntries', language), desc: t('aboutFeatureCustomEntriesDesc', language) },
    { icon: <Palette size={20} />, title: t('aboutFeatureRichCustomization', language), desc: t('aboutFeatureRichCustomizationDesc', language) },
    { icon: <Zap size={20} />, title: t('aboutFeatureRealisticPhysics', language), desc: t('aboutFeatureRealisticPhysicsDesc', language) },
    { icon: <Volume2 size={20} />, title: t('aboutFeatureSynthesizedAudio', language), desc: t('aboutFeatureSynthesizedAudioDesc', language) },
    { icon: <Sparkles size={20} />, title: t('aboutFeatureConfetti', language), desc: t('aboutFeatureConfettiDesc', language) },
    { icon: <Globe size={20} />, title: t('aboutFeatureLanguages', language), desc: t('aboutFeatureLanguagesDesc', language) },
    { icon: <Database size={20} />, title: t('aboutFeatureLocalPersistence', language), desc: t('aboutFeatureLocalPersistenceDesc', language) },
    { icon: <Shield size={20} />, title: t('aboutFeatureOffline', language), desc: t('aboutFeatureOfflineDesc', language) },
  ];

  const steps = [
    { num: '01', title: t('aboutStep1Title', language), desc: t('aboutStep1Desc', language) },
    { num: '02', title: t('aboutStep2Title', language), desc: t('aboutStep2Desc', language) },
    { num: '03', title: t('aboutStep3Title', language), desc: t('aboutStep3Desc', language) },
    { num: '04', title: t('aboutStep4Title', language), desc: t('aboutStep4Desc', language) },
  ];

  const techStack = [
    'React 19', 'TypeScript', 'Vite 6', 'Tailwind CSS', 'D3.js', 'Lucide Icons', 'Web Audio API', 'Lottie Animations'
  ];

  const faqs = [
    { q: t('aboutFaq1Q', language), a: t('aboutFaq1A', language) },
    { q: t('aboutFaq2Q', language), a: t('aboutFaq2A', language) },
    { q: t('aboutFaq3Q', language), a: t('aboutFaq3A', language) },
    { q: t('aboutFaq4Q', language), a: t('aboutFaq4A', language) },
    { q: t('aboutFaq5Q', language), a: t('aboutFaq5A', language) },
  ];

  return (
    <div className="p-5 space-y-6">

      {/* Hero */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-lg shadow-indigo-500/30 mb-1">
          <Disc size={28} className="text-white" />
        </div>
        <h2 className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-500">
          SpinMaster Pro
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('aboutHeroSubtitle', language)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: t('aboutStatLanguages', language), value: '63', icon: <Globe size={16} /> },
          { label: t('aboutStatPresets', language), value: '6', icon: <Layers size={16} /> },
          { label: t('aboutStatSkins', language), value: '6+', icon: <Palette size={16} /> },
        ].map(stat => (
          <div key={stat.label} className="glass-panel rounded-xl p-3 text-center">
            <div className="flex justify-center text-indigo-500 mb-1">{stat.icon}</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">{stat.value}</div>
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="glass-panel rounded-xl p-4 space-y-2">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Heart size={16} className="text-pink-500" />
          {t('ourMission', language)}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('aboutMissionText', language)}
        </p>
      </div>

      {/* Key Features */}
      <div>
        <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Zap size={14} className="text-indigo-500" />
          {t('keyFeatures', language)}
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {features.map((f, i) => (
            <div key={i} className="glass-panel rounded-xl p-3 flex items-start gap-3 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="mt-0.5 w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                {f.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">{f.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div>
        <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Navigation size={14} className="text-indigo-500" />
          {t('howItWorks', language)}
        </h3>
        <div className="space-y-3">
          {steps.map(step => (
            <div key={step.num} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {step.num}
                </div>
                <div className="w-0.5 flex-1 bg-gradient-to-b from-indigo-500 to-transparent min-h-[20px]" />
              </div>
              <div className="pb-3 min-w-0">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">{step.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="glass-panel rounded-xl p-4 space-y-3">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm uppercase tracking-wider">
          <Circle size={14} className="text-indigo-500" />
          {t('technology', language)}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {techStack.map(tech => (
            <span key={tech} className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
          <Sparkles size={14} className="text-indigo-500" />
          {t('faq', language)}
        </h3>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-panel rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors hover:bg-white/50 dark:hover:bg-slate-800/50"
              >
                <span className="text-sm font-semibold text-slate-800 dark:text-white pr-2">{faq.q}</span>
                <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Credits */}
      <div className="text-center pt-2 pb-4 space-y-3">
        <div className="glass-panel rounded-xl p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
            {t('aboutCredits', language)}
          </p>
        </div>
        <p className="text-[10px] text-slate-400">
          SpinMaster Pro &copy; {new Date().getFullYear()}
        </p>
      </div>

    </div>
  );
};

export default AboutContent;
