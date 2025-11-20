
import React from 'react';
import { WheelEntry } from '../types';
import Confetti from './Confetti';
import { X } from 'lucide-react';
import { t } from '../utils/translations';

interface WinnerModalProps {
  winner: WheelEntry | null;
  onClose: () => void;
  onRemove: () => void;
  language: string;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, onClose, onRemove, language }) => {
  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <Confetti />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border-4 border-primary transform scale-100 animate-in zoom-in-95 duration-300">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
            <X size={24} />
        </button>
        
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            {t('weHaveWinner', language)}
        </h2>
        
        <div className="my-8 py-6 bg-slate-100 dark:bg-slate-700 rounded-xl">
            <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-sm">
                {winner.text}
            </span>
        </div>

        <div className="flex gap-4 justify-center">
            <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white hover:brightness-95 transition-all"
            >
                {t('close', language)}
            </button>
            <button
                onClick={() => {
                    onRemove();
                    onClose();
                }}
                className="px-6 py-3 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-red-500/30 transition-all"
            >
                {t('removeWinnerBtn', language)}
            </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;
