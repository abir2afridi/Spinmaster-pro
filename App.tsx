import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, RotateCw, Shuffle, SortAsc, Volume2, VolumeX, 
  Trash2, History, Menu, Moon, Sun, Save, FolderOpen, 
  Undo, Redo, Share2, LayoutGrid, List, Plus, X, AlignLeft,
  Edit3, Check, Palette, Image as ImageIcon, Upload, Disc,
  Layers, Circle, Music, Speaker, Play, Star, Heart, Crown, 
  Zap, Square, Smile, Hexagon, Navigation, Globe
} from 'lucide-react';
import Wheel from './components/Wheel';
import WinnerModal from './components/WinnerModal';
import { WheelEntry, AppSettings, HistoryEntry, SavedWheel } from './types';
import { audioManager } from './utils/audio';
import { t, LANGUAGES } from './utils/translations';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

// Vibrant colors
const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e',
  '#fb7185', '#2dd4bf', '#a78bfa'
];

const POINTER_COLOR_PRESETS = [
  { id: '#f43f5e', name: 'Rose' },
  { id: '#3b82f6', name: 'Blue' },
  { id: '#10b981', name: 'Emerald' },
  { id: '#f59e0b', name: 'Amber' },
  { id: '#8b5cf6', name: 'Violet' },
  { id: '#1e293b', name: 'Slate' },
  { id: '#ffffff', name: 'White' },
];

const BACKGROUND_PRESETS = [
  { name: 'Galaxy', url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=2000&q=80' },
  { name: 'Sunset', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=2000&q=80' },
  { name: 'Forest', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80' },
  { name: 'City', url: 'https://images.unsplash.com/photo-1519608487953-e999c9dc2949?auto=format&fit=crop&w=2000&q=80' },
  { name: 'Geometric', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2000&q=80' },
  { name: 'Casino', url: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=2000&q=80' },
  { name: 'Wood', url: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=2000&q=80' },
  { name: 'Stage', url: 'https://images.unsplash.com/photo-1514525253440-b393452e3383?auto=format&fit=crop&w=2000&q=80' },
];

const WHEEL_IMAGE_PRESETS = [
  { name: 'Wood', url: 'https://images.unsplash.com/photo-1546527868-ccb7ee7dfa6a?auto=format&fit=crop&w=600&q=80' },
  { name: 'Metal', url: 'https://images.unsplash.com/photo-1535050704408-41166316da9c?auto=format&fit=crop&w=600&q=80' },
  { name: 'Gold', url: 'https://images.unsplash.com/photo-1610375461496-ad2b2276820a?auto=format&fit=crop&w=600&q=80' },
  { name: 'Galaxy', url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80' },
  { name: 'Stone', url: 'https://images.unsplash.com/photo-1445368794737-088a15500932?auto=format&fit=crop&w=600&q=80' },
  { name: 'Abstract', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=600&q=80' },
];

const RIM_PRESETS = [
  { id: 'default', name: 'Classic', color: '#cbd5e1' },
  { id: 'rainbow', name: 'RGB Glow', color: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' },
  { id: 'gold', name: 'Gold', color: 'linear-gradient(to right, #BF953F, #FCF6BA, #AA771C)' },
  { id: '#06b6d4', name: 'Neon Blue', color: '#06b6d4' },
  { id: '#f43f5e', name: 'Neon Pink', color: '#f43f5e' },
  { id: '#10b981', name: 'Neon Green', color: '#10b981' },
  { id: '#7C3AED', name: 'Neon', color: '#7C3AED' },
];

const HUB_COLOR_PRESETS = [
    { id: 'default', name: 'Classic', color: 'bg-gradient-to-br from-white to-slate-200 dark:from-slate-700 dark:to-slate-900' },
    { id: 'gold', name: 'Gold', color: 'linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)' },
    { id: '#ef4444', name: 'Red', color: '#ef4444' },
    { id: '#3b82f6', name: 'Blue', color: '#3b82f6' },
    { id: '#10b981', name: 'Green', color: '#10b981' },
    { id: '#0f172a', name: 'Black', color: '#0f172a' },
    { id: 'galaxy', name: 'Galaxy', color: 'linear-gradient(to bottom right, #4c1d95, #db2777)' },
    { id: 'metal', name: 'Metal', color: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #e2e8f0 100%)' },
    { id: 'wood', name: 'Wood', color: 'repeating-linear-gradient(45deg, #a0522d 0, #a0522d 10px, #8b4513 10px, #8b4513 20px)' },
];

const HUB_ICON_PRESETS = [
    { id: 'text', name: 'Text', icon: <span className="text-[10px] font-bold">TXT</span> },
    { id: 'play', name: 'Play', icon: <Play size={14} /> },
    { id: 'star', name: 'Star', icon: <Star size={14} /> },
    { id: 'heart', name: 'Heart', icon: <Heart size={14} /> },
    { id: 'crown', name: 'Crown', icon: <Crown size={14} /> },
    { id: 'zap', name: 'Zap', icon: <Zap size={14} /> },
    { id: 'smile', name: 'Smile', icon: <Smile size={14} /> },
];

const HUB_SHAPE_PRESETS = [
    { id: 'circle', name: 'Circle', icon: <Circle size={14} /> },
    { id: 'rounded', name: 'Rounded', icon: <Square size={14} className="rounded-md" /> },
    { id: 'square', name: 'Square', icon: <Square size={14} /> },
];

const WIN_SOUND_PRESETS = [
  { id: 'fanfare', name: 'Fanfare' },
  { id: 'success', name: 'Success' },
  { id: 'arcade', name: 'Arcade' },
  { id: 'soft', name: 'Soft Chime' },
];

const TICK_SOUND_PRESETS = [
    { id: 'classic', name: 'Classic' },
    { id: 'mechanical', name: 'Mechanical' },
    { id: 'bubble', name: 'Bubble' },
    { id: 'soft', name: 'Soft' },
];

const POINTER_PRESETS = [
  { id: 'classic', name: 'Classic' },
  { id: 'arrow', name: 'Arrow' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'neon', name: 'Neon' },
  { id: 'rounded', name: 'Rounded' },
];

const WHEEL_PRESETS = [
  { 
    name: 'What to Eat', 
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=500&q=80',
    items: ['Pizza', 'Burger', 'Sushi', 'Salad', 'Tacos', 'Pasta', 'Steak', 'Ramen']
  },
  { 
    name: 'Yes or No', 
    image: 'https://images.unsplash.com/photo-1535136352623-698f1cb2474e?auto=format&fit=crop&w=500&q=80',
    items: ['Yes', 'No', 'Maybe', 'Ask Again Later', 'Definitely', 'No Way']
  },
  { 
    name: 'Dice Roll', 
    image: 'https://images.unsplash.com/photo-1595757816291-ab4c1cba0fc2?auto=format&fit=crop&w=500&q=80',
    items: ['1', '2', '3', '4', '5', '6']
  },
  { 
    name: 'Activities', 
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80',
    items: ['Watch Movie', 'Read Book', 'Go for Walk', 'Clean House', 'Take Nap', 'Call Friend', 'Workout']
  },
  { 
    name: 'Truth/Dare', 
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=500&q=80',
    items: ['Truth', 'Dare']
  },
  { 
    name: 'Rock Paper Scissors', 
    image: 'https://images.unsplash.com/photo-1604147706283-d711941b0a7a?auto=format&fit=crop&w=500&q=80',
    items: ['Rock', 'Paper', 'Scissors']
  }
];

const DEFAULT_ENTRIES = ["Pizza", "Burger", "Sushi", "Tacos", "Salad", "Pasta", "Steak"];

// Helper to render preview of pointer style
const renderPointerPreview = (style: string, color: string) => {
  const common = { fill: color, stroke: '#333', strokeWidth: 2 };
  switch (style) {
    case 'arrow':
      return <path d="M 30 58 L 10 25 L 22 25 L 22 2 L 38 2 L 38 25 L 50 25 Z" {...common} transform="scale(0.6) translate(18, 0)" />;
    case 'minimal':
      return <path d="M 30 50 L 15 20 L 45 20 Z" fill={color} stroke="#333" strokeWidth="2" transform="scale(0.6) translate(18, 10)" />;
    case 'neon':
      return <path d="M 30 55 L 5 10 L 55 10 Z" fill="none" stroke={color} strokeWidth="4" transform="scale(0.6) translate(18, 0)" />;
    case 'rounded':
      return <path d="M 30 55 L 10 15 Q 30 5 50 15 Z" {...common} transform="scale(0.6) translate(18, 0)" />;
    case 'classic':
    default:
      return <path d="M 30 55 L 5 10 L 55 10 Z" {...common} transform="scale(0.6) translate(18, 0)" />;
  }
};

// --- Helper Components ---

const ColorPickerPopover: React.FC<{
  position: { top: number; bottom: number; left: number };
  onSelect: (color: string) => void;
  onClose: () => void;
  currentColor: string;
}> = ({ position, onSelect, onClose, currentColor }) => {
  // Calculate position to keep it on screen
  const popoverHeight = 300; // Estimated height including content and padding (increased for safety)
  const popoverWidth = 230; // w-[220px] plus estimated padding/border
  const windowHeight = window.innerHeight;
  const windowWidth = window.innerWidth;
  
  // Vertical positioning logic
  const spaceBelow = windowHeight - position.bottom;
  const spaceAbove = position.top;
  
  // Prefer showing below, but switch to above if there's no space below AND there is space above
  const showAbove = (spaceBelow < popoverHeight) && (spaceAbove > popoverHeight);
  
  const top = showAbove ? 'auto' : position.bottom + 8;
  const bottom = showAbove ? (windowHeight - position.top) + 8 : 'auto';
  
  // Horizontal positioning logic
  let left = position.left;
  
  // Prevent overflow on the right edge
  if (left + popoverWidth > windowWidth) {
      left = windowWidth - popoverWidth - 12; // 12px safety margin
  }
  
  // Prevent overflow on the left edge (if clamping pushed it too far left)
  left = Math.max(12, left);

  return (
    <>
      <div className="fixed inset-0 z-50" onClick={onClose} />
      <div 
        className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 w-[220px] animate-in zoom-in-95 duration-200"
        style={{ top, bottom, left }}
      >
        <div className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Select Color</div>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => { onSelect(c); onClose(); }}
              className={`w-7 h-7 rounded-full transition-transform hover:scale-125 ring-2 shadow-sm ${currentColor === c ? 'ring-slate-900 dark:ring-white scale-110' : 'ring-transparent hover:ring-slate-200 dark:hover:ring-slate-600'}`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700">
            <label className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 shadow-sm group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Custom</span>
                </div>
                <input 
                    type="color" 
                    value={currentColor}
                    onChange={(e) => onSelect(e.target.value)}
                    className="w-8 h-8 p-0 border-0 rounded cursor-pointer bg-transparent"
                />
            </label>
        </div>
      </div>
    </>
  );
};

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'settings' | 'saved'>('editor');
  const [editorMode, setEditorMode] = useState<'bulk' | 'list'>('list'); // Default to list for "Pro" feel
  
  // Core Data
  const [rawInput, setRawInput] = useState(DEFAULT_ENTRIES.join('\n'));
  const [entries, setEntries] = useState<WheelEntry[]>([]);
  
  // Gameplay State
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [winner, setWinner] = useState<WheelEntry | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [savedWheels, setSavedWheels] = useState<SavedWheel[]>([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Color Picker State
  const [colorPickerState, setColorPickerState] = useState<{ id: string; top: number; bottom: number; left: number } | null>(null);
  
  // Undo/Redo Stacks - Now storing full Entry objects to persist colors
  const [undoStack, setUndoStack] = useState<WheelEntry[][]>([]);
  const [redoStack, setRedoStack] = useState<WheelEntry[][]>([]);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Wheel Image Upload Ref
  const wheelImageInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<AppSettings>({
    spinDuration: 5,
    enableSound: true,
    removeWinner: false,
    theme: 'dark',
    showConfetti: true,
    backgroundImage: '',
    wheelImage: '',
    rimColor: 'default',
    winSound: 'fanfare',
    tickSound: 'classic',
    centerHubColor: 'default',
    centerHubIcon: 'text',
    centerHubShape: 'circle',
    centerHubText: 'SPIN',
    pointerStyle: 'classic',
    pointerColor: '#f43f5e',
    language: 'English'
  });

  // --- Effects ---

  // Load Saved Data
  useEffect(() => {
    const saved = localStorage.getItem('spinmaster_saves');
    if (saved) setSavedWheels(JSON.parse(saved));
    
    const savedHistory = localStorage.getItem('spinmaster_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Theme
  useEffect(() => {
    if (settings.theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings.theme]);

  // Initial Load Logic
  useEffect(() => {
    // Only run once on mount to init entries from default rawInput
    reconcileEntries(DEFAULT_ENTRIES.join('\n'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard Shortcuts (Space to Spin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        // Disable shortcut if user is typing or in a specialized input
        const isTyping = target.matches('input, textarea, select') || target.isContentEditable;

        if (!isTyping) {
          e.preventDefault(); // Prevent page scroll
          if (!isSpinning && entries.length >= 2) {
            setSpinTrigger(prev => prev + 1);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSpinning, entries.length]);

  // --- Logic ---

  // Capture current state to history before changes
  const addToHistory = () => {
    setUndoStack(prev => [...prev.slice(-20), entries]);
    setRedoStack([]);
  };

  // Helper to generate entries from text while trying to preserve colors of existing items
  const reconcileEntries = (text: string, currentEntries: WheelEntry[] = []) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    const newEntries: WheelEntry[] = lines.map((line, i) => {
      const trimmed = line.trim();
      // Try to find existing entry with same text to keep color
      const existing = currentEntries.find(e => e.text === trimmed);
      
      if (existing) {
        return { ...existing, id: existing.id }; // Keep ID and Color
      }
      
      return {
        id: `entry-${Date.now()}-${i}`,
        text: trimmed,
        color: COLORS[i % COLORS.length],
        enabled: true
      };
    });
    
    setEntries(newEntries);
    return newEntries;
  };

  const updateRawInput = (newText: string) => {
    addToHistory();
    setRawInput(newText);
    reconcileEntries(newText, entries);
  };

  // Specific Entry Updates (List Mode)
  const updateEntry = (id: string, updates: Partial<WheelEntry>) => {
    setEntries(prev => {
        const newEntries = prev.map(e => e.id === id ? { ...e, ...updates } : e);
        // Sync raw input without triggering full reconciliation (prevent color reset)
        setRawInput(newEntries.map(e => e.text).join('\n'));
        return newEntries;
    });
  };

  const removeEntry = (id: string) => {
    addToHistory();
    setEntries(prev => {
        const newEntries = prev.filter(e => e.id !== id);
        setRawInput(newEntries.map(e => e.text).join('\n'));
        return newEntries;
    });
  };

  const addEntry = () => {
    addToHistory();
    const newEntry: WheelEntry = {
        id: `entry-${Date.now()}`,
        text: `Option ${entries.length + 1}`,
        color: COLORS[entries.length % COLORS.length],
        enabled: true
    };
    setEntries(prev => {
        const newEntries = [...prev, newEntry];
        setRawInput(newEntries.map(e => e.text).join('\n'));
        return newEntries;
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const previousEntries = undoStack[undoStack.length - 1];
    
    setRedoStack(prev => [entries, ...prev]);
    setUndoStack(prev => prev.slice(0, -1));
    
    setEntries(previousEntries);
    setRawInput(previousEntries.map(e => e.text).join('\n'));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextEntries = redoStack[0];
    
    setUndoStack(prev => [...prev, entries]);
    setRedoStack(prev => prev.slice(1));
    
    setEntries(nextEntries);
    setRawInput(nextEntries.map(e => e.text).join('\n'));
  };

  const handleSpin = () => {
    if (isSpinning || entries.length < 2) return;
    setSpinTrigger(prev => prev + 1);
  };

  const handleSpinComplete = (winningEntry: WheelEntry) => {
    setIsSpinning(false);
    setWinner(winningEntry);
    
    const newHistoryItem = { id: Date.now().toString(), text: winningEntry.text, timestamp: Date.now() };
    const newHistory = [newHistoryItem, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('spinmaster_history', JSON.stringify(newHistory));
  };

  const handleRemoveWinner = () => {
    if (winner) {
      addToHistory();
      const newEntries = entries.filter(e => e.id !== winner.id);
      setEntries(newEntries);
      setRawInput(newEntries.map(e => e.text).join('\n'));
    }
  };

  const saveWheel = () => {
    const name = prompt("Name your wheel:", "My Awesome Wheel");
    if (!name) return;
    
    const newSave: SavedWheel = {
      id: Date.now().toString(),
      name,
      entries: entries, // Save full entry objects including colors
      lastModified: Date.now()
    };
    
    const newSaves = [...savedWheels, newSave];
    setSavedWheels(newSaves);
    localStorage.setItem('spinmaster_saves', JSON.stringify(newSaves));
    alert("Wheel saved!");
  };

  const loadWheel = (save: SavedWheel) => {
    if (confirm(`Load "${save.name}"? Unsaved changes will be lost.`)) {
      addToHistory();
      // Check for legacy data format (array of strings)
      const isLegacy = save.entries.length > 0 && typeof save.entries[0] === 'string';

      if (isLegacy) {
        const text = (save.entries as unknown as string[]).join('\n');
        setRawInput(text);
        reconcileEntries(text);
      } else {
        // New format with colors
        const loadedEntries = save.entries as WheelEntry[];
        const text = loadedEntries.map(e => e.text).join('\n');
        setRawInput(text);
        setEntries(loadedEntries);
      }
      setActiveTab('editor');
    }
  };

  const deleteSavedWheel = (id: string) => {
    if (confirm("Are you sure you want to delete this saved wheel?")) {
      const newSaves = savedWheels.filter(s => s.id !== id);
      setSavedWheels(newSaves);
      localStorage.setItem('spinmaster_saves', JSON.stringify(newSaves));
    }
  };

  const clearAllSavedWheels = () => {
    if (confirm("Are you sure you want to delete ALL saved wheels? This action cannot be undone.")) {
      setSavedWheels([]);
      localStorage.removeItem('spinmaster_saves');
    }
  };

  const openColorPicker = (e: React.MouseEvent, id: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setColorPickerState({
      id,
      top: rect.top,
      bottom: rect.bottom,
      left: rect.left
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(s => ({ ...s, backgroundImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWheelImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(s => ({ ...s, wheelImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const applyPreset = (preset: typeof WHEEL_PRESETS[0]) => {
    if (confirm(`Load "${preset.name}"? Current entries will be replaced.`)) {
      addToHistory();
      const text = preset.items.join('\n');
      setRawInput(text);
      reconcileEntries(text, []); // Pass empty array to force reset of colors
      setActiveTab('editor');
    }
  };

  // --- UI Components ---

  const TabButton: React.FC<{ id: string; icon: React.ReactNode; label: string }> = ({ id, icon, label }) => (
    <button 
      onClick={() => setActiveTab(id as any)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
        activeTab === id 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  const currentLang = settings.language;

  return (
    <div className="h-screen flex flex-col bg-slate-100 dark:bg-slate-900 transition-colors duration-500 overflow-hidden">
      
      {/* Custom Animation Styles for Spinning State */}
      <style>{`
        @keyframes spin-glow {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.3)); transform: scale(1.02); }
          50% { filter: drop-shadow(0 0 35px rgba(99, 102, 241, 0.6)); transform: scale(1.04); }
        }
        .spin-active {
          animation: spin-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Custom Background Image - ENHANCED */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          {settings.backgroundImage && (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out opacity-25 dark:opacity-15"
                style={{ backgroundImage: `url("${settings.backgroundImage}")` }}
              />
              {/* Gradient overlay to blend content area smoothly */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-100 via-transparent to-transparent dark:from-slate-900 dark:via-transparent dark:to-transparent opacity-80" />
            </>
          )}
      </div>

      {/* Header */}
      <header className="glass-panel z-40 px-4 py-2 flex items-center justify-between shadow-sm sticky top-0 h-16">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 flex items-center justify-center">
             <DotLottieReact
               src="https://lottie.host/fa5ebd64-ca68-4e4b-a18e-e82ec29fe466/QtGkI2xGgf.lottie"
               loop
               autoplay
               style={{ width: '100%', height: '100%' }}
             />
           </div>
           <h1 className="text-2xl font-display font-bold bg-clip-text text-transparent tracking-wide animate-gradient bg-300% bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-500">
             SpinMaster
           </h1>
           <style jsx global>{`
             @keyframes gradient {
               0% { background-position: 0% 50%; }
               50% { background-position: 100% 50%; }
               100% { background-position: 0% 50%; }
             }
             .animate-gradient {
               animation: gradient 3s ease infinite;
               background-size: 200% 200%;
             }
           `}</style>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
           <div className="hidden md:flex gap-2 p-1 bg-slate-200 dark:bg-slate-800 rounded-full">
              <button 
                onClick={() => setSettings(s => ({ ...s, theme: 'light' }))}
                className={`p-2 rounded-full transition-all ${settings.theme === 'light' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}
              >
                <Sun size={18} />
              </button>
              <button 
                onClick={() => setSettings(s => ({ ...s, theme: 'dark' }))}
                className={`p-2 rounded-full transition-all ${settings.theme === 'dark' ? 'bg-slate-700 shadow text-indigo-400' : 'text-slate-400'}`}
              >
                <Moon size={18} />
              </button>
           </div>
           <button 
             onClick={() => setSettings(s => ({ ...s, enableSound: !s.enableSound }))}
             className={`p-3 rounded-full transition-all ${settings.enableSound ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}
           >
             {settings.enableSound ? <Volume2 size={20} /> : <VolumeX size={20} />}
           </button>
           <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-3 bg-slate-200 dark:bg-slate-800 rounded-xl"
           >
              <Menu size={20} />
           </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10 min-h-0 h-[calc(100vh-4rem)]">
        
        {/* Left: Wheel Area */}
        <section className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 overflow-hidden max-h-[calc(100vh-4rem)]">
           <div className={`relative z-10 transition-transform duration-500 ${isSpinning ? 'spin-active' : 'hover:scale-[1.02]'}`} style={{ maxHeight: 'calc(80vh - 4rem)' }}>
              <Wheel 
                entries={entries}
                isSpinning={isSpinning}
                onSpinComplete={handleSpinComplete}
                onSpinStart={() => setIsSpinning(true)}
                spinDuration={settings.spinDuration}
                enableSound={settings.enableSound}
                triggerSpin={spinTrigger}
                wheelImage={settings.wheelImage}
                rimColor={settings.rimColor}
                winSound={settings.winSound}
                tickSound={settings.tickSound}
                centerHubColor={settings.centerHubColor}
                centerHubIcon={settings.centerHubIcon}
                centerHubShape={settings.centerHubShape}
                centerHubText={settings.centerHubText}
                pointerStyle={settings.pointerStyle}
                pointerColor={settings.pointerColor}
              />
           </div>
           
           {/* Desktop Spin Button */}
           <button
                onClick={handleSpin}
                disabled={isSpinning || entries.length < 2}
                className="group relative w-full max-w-xs md:max-w-none md:w-auto px-8 py-4 md:px-16 md:py-4 rounded-full overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                title="Press Space to spin"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 animate-[spin_4s_linear_infinite]" />
                <div className="absolute inset-[2px] bg-slate-900 rounded-full" />
                <div className="relative flex items-center justify-center gap-3 text-xl font-bold text-white tracking-wider uppercase">
                   <span className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-pink-400 transition-all">
                     {t('clickToSpin', currentLang)}
                   </span>
                </div>
           </button>
        </section>

        {/* Right: Controls Area */}
        <aside className={`
            absolute inset-0 lg:relative lg:inset-auto 
            flex flex-col w-full lg:w-[450px] 
            glass-panel border-l-0 lg:border-l shadow-2xl
            transition-transform duration-500 z-30
            h-full overflow-y-auto
            ${showMobileMenu ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
        `}>
            
            {/* Mobile Handle */}
            <div 
                className="lg:hidden h-12 flex items-center justify-center border-b border-white/10 cursor-pointer"
                onClick={() => setShowMobileMenu(false)}
            >
                <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
            </div>

            {/* Tab Navigation */}
            <div className="w-full border-b border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="w-full overflow-x-auto px-2 py-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                <div className="flex space-x-2 py-1 w-max min-w-full">
                  <TabButton id="editor" icon={<Edit3 size={18} />} label={t('edit', currentLang)} />
                  <TabButton id="saved" icon={<FolderOpen size={18} />} label={t('saved', currentLang)} />
                  <TabButton id="history" icon={<History size={18} />} label={t('history', currentLang)} />
                  <TabButton id="settings" icon={<Settings size={18} />} label={t('settings', currentLang)} />
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden relative bg-slate-50/50 dark:bg-slate-900/50 h-[calc(100vh-12rem)] lg:h-[calc(100vh-4rem)]">
              <style jsx global>{`
                /* Custom scrollbar for the tab navigation */
                .scrollbar-thin::-webkit-scrollbar {
                  height: 6px;
                }
                .scrollbar-thin::-webkit-scrollbar-track {
                  background: transparent;
                }
                .scrollbar-thin::-webkit-scrollbar-thumb {
                  background-color: #cbd5e1;
                  border-radius: 3px;
                }
                .dark .scrollbar-thin::-webkit-scrollbar-thumb {
                  background-color: #4b5563;
                }
              `}</style>
               
               {/* 1. EDITOR TAB */}
               {activeTab === 'editor' && (
                 <div className="flex flex-col h-full p-4 animate-in slide-in-from-right-4 duration-300 overflow-y-auto" style={{ maxHeight: '100%' }}>
                    
                    {/* Toolbar */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
                            <button 
                                onClick={() => setEditorMode('list')}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${editorMode === 'list' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`}
                            >
                                <List size={14} /> {t('list', currentLang)}
                            </button>
                            <button 
                                onClick={() => setEditorMode('bulk')}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${editorMode === 'bulk' ? 'bg-white dark:bg-slate-600 shadow text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`}
                            >
                                <AlignLeft size={14} /> {t('bulk', currentLang)}
                            </button>
                        </div>

                        <div className="flex gap-2">
                             <button 
                                onClick={() => {
                                    addToHistory();
                                    const shuffled = rawInput.split('\n').filter(x=>x).sort(() => Math.random() - 0.5).join('\n');
                                    setRawInput(shuffled);
                                    reconcileEntries(shuffled, entries);
                                }} 
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded-lg hover:brightness-110 transition-all"
                                title="Shuffle entries"
                            >
                                <Shuffle size={14} />
                            </button>
                            <button 
                                onClick={() => {
                                    addToHistory();
                                    const sorted = rawInput.split('\n').filter(x=>x).sort().join('\n');
                                    setRawInput(sorted);
                                    reconcileEntries(sorted, entries);
                                }} 
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-700 rounded-lg hover:brightness-110 transition-all"
                                title="Sort A-Z"
                            >
                                <SortAsc size={14} />
                            </button>
                        </div>
                    </div>

                    {/* EDITOR CONTENT */}
                    <div className="flex-1 relative overflow-hidden flex flex-col">
                        {editorMode === 'bulk' ? (
                            <div className="flex-1 relative group h-full">
                                <textarea 
                                    value={rawInput}
                                    onChange={(e) => updateRawInput(e.target.value)}
                                    className="w-full h-full p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 ring-indigo-500 focus:outline-none resize-none font-mono text-sm shadow-inner"
                                    placeholder="Enter options here (one per line)..."
                                />
                                <div className="absolute bottom-4 right-4 text-xs text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded pointer-events-none">
                                    {entries.length} {t('entries', currentLang)}
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                                {entries.map((entry, index) => (
                                    <div key={entry.id} className="flex items-center gap-2 group bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                                        {/* Interactive Color Swatch */}
                                        <button 
                                            className="relative w-8 h-8 flex-shrink-0 rounded-full cursor-pointer ring-2 ring-transparent hover:ring-indigo-400 transition-all shadow-sm"
                                            style={{ backgroundColor: entry.color }}
                                            onClick={(e) => openColorPicker(e, entry.id)}
                                            title="Change Color"
                                        />
                                        
                                        <input 
                                            type="text" 
                                            value={entry.text}
                                            onChange={(e) => updateEntry(entry.id, { text: e.target.value })}
                                            className="flex-1 bg-transparent border-b border-transparent focus:border-indigo-500 focus:outline-none px-2 py-1 text-sm font-medium"
                                            placeholder="Enter option..."
                                        />

                                        <button 
                                            onClick={() => removeEntry(entry.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button 
                                    onClick={addEntry}
                                    className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-slate-500 hover:text-indigo-500 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all flex items-center justify-center gap-2 font-semibold text-sm"
                                >
                                    <Plus size={16} /> {t('addEntry', currentLang)}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button onClick={handleUndo} disabled={!undoStack.length} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                            <Undo size={18} />
                        </button>
                        <button onClick={handleRedo} disabled={!redoStack.length} className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 disabled:opacity-50 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                            <Redo size={18} />
                        </button>
                        <button onClick={saveWheel} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                            <Save size={18} /> {t('save', currentLang)}
                        </button>
                    </div>
                 </div>
               )}

               {/* 2. SAVED TAB */}
               {activeTab === 'saved' && (
                   <div className="p-4 h-full overflow-y-auto space-y-3 animate-in slide-in-from-right-4 duration-300">
                       {savedWheels.length === 0 && (
                           <div className="text-center text-slate-400 mt-10">
                               <FolderOpen size={48} className="mx-auto mb-4 opacity-50"/>
                               <p>{t('noSaved', currentLang)}</p>
                               <button onClick={() => setActiveTab('editor')} className="text-indigo-500 mt-2 underline">{t('createOne', currentLang)}</button>
                           </div>
                       )}
                       {savedWheels.map(wheel => (
                           <div key={wheel.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                               <div className="flex justify-between items-start mb-2">
                                   <h3 className="font-bold text-lg">{wheel.name}</h3>
                                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                       <button onClick={() => loadWheel(wheel)} className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg" title="Load">
                                          <LayoutGrid size={18} />
                                       </button>
                                       <button onClick={() => deleteSavedWheel(wheel.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Delete">
                                           <Trash2 size={18} />
                                       </button>
                                   </div>
                               </div>
                               <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                   Last modified: {new Date(wheel.lastModified).toLocaleDateString()}
                               </p>
                               <div className="flex gap-2 flex-wrap">
                                   {wheel.entries.slice(0, 4).map((e, i) => {
                                       // Handle both legacy (string) and new (WheelEntry) formats safely
                                       const text = typeof e === 'string' ? e : e.text;
                                       const color = typeof e === 'string' ? null : e.color;
                                       return (
                                           <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs truncate max-w-[100px] flex items-center gap-1">
                                               {color && <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />}
                                               {text}
                                           </span>
                                       );
                                   })}
                                   {wheel.entries.length > 4 && <span className="px-2 py-1 text-xs text-slate-500">+{wheel.entries.length - 4} more</span>}
                               </div>
                           </div>
                       ))}

                       {savedWheels.length > 0 && (
                           <button 
                               onClick={clearAllSavedWheels}
                               className="w-full py-3 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 mt-6 border border-red-200 dark:border-red-900/30 rounded-xl transition-all flex items-center justify-center gap-2"
                           >
                               <Trash2 size={16} /> {t('clearAll', currentLang)}
                           </button>
                       )}
                   </div>
               )}

               {/* 3. HISTORY TAB */}
               {activeTab === 'history' && (
                 <div className="p-4 h-full overflow-y-auto animate-in slide-in-from-right-4 duration-300" style={{ maxHeight: '100%' }}>
                     {history.length === 0 ? (
                        <p className="text-center text-slate-400 mt-10">{t('spinHistory', currentLang)}</p>
                     ) : (
                         <div className="space-y-2">
                             {history.map((item) => (
                                 <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                     <span className="font-semibold text-indigo-600 dark:text-indigo-400">{item.text}</span>
                                     <span className="text-xs text-slate-400 font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                                 </div>
                             ))}
                             <button 
                                onClick={() => {
                                    if (confirm("Are you sure you want to clear the spin history?")) {
                                        setHistory([]);
                                        localStorage.removeItem('spinmaster_history');
                                    }
                                }}
                                className="w-full py-2 text-xs text-red-500 hover:text-red-600 mt-4 border border-red-200 dark:border-red-900/30 rounded-lg"
                             >
                                 {t('clearHistory', currentLang)}
                             </button>
                         </div>
                     )}
                 </div>
               )}

               {/* 4. SETTINGS TAB */}
               {activeTab === 'settings' && (
                 <div className="p-6 h-full overflow-y-auto animate-in slide-in-from-right-4 duration-300" style={{ maxHeight: '100%' }}>
                     
                     {/* General / Language */}
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t('general', currentLang)}</h3>
                     <div className="space-y-4 mb-8">
                         <div>
                             <label className="font-medium block mb-2 flex items-center gap-2">
                                <Globe size={16} className="text-indigo-500"/>
                                {t('language', currentLang)}
                             </label>
                             <div className="relative">
                                <select 
                                   value={settings.language}
                                   onChange={(e) => setSettings(s => ({...s, language: e.target.value}))}
                                   className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 pr-8 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-shadow shadow-sm"
                                >
                                    {LANGUAGES.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                             </div>
                         </div>
                     </div>

                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t('gameplay', currentLang)}</h3>
                     <div className="space-y-4 mb-8">
                         <div className="flex items-center justify-between">
                             <label className="font-medium">{t('spinDuration', currentLang)}</label>
                             <select 
                                value={settings.spinDuration}
                                onChange={(e) => setSettings(s => ({...s, spinDuration: Number(e.target.value)}))}
                                className="bg-slate-200 dark:bg-slate-700 rounded-lg px-3 py-1"
                             >
                                 <option value={3}>Fast (3s)</option>
                                 <option value={5}>Normal (5s)</option>
                                 <option value={8}>Dramatic (8s)</option>
                                 <option value={15}>Extreme (15s)</option>
                             </select>
                         </div>
                         <div className="flex items-center justify-between">
                             <label className="font-medium">{t('soundEffects', currentLang)}</label>
                             <button 
                                onClick={() => setSettings(s => ({...s, enableSound: !s.enableSound}))}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.enableSound ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                             >
                                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.enableSound ? 'translate-x-6' : ''}`} />
                             </button>
                         </div>
                         
                         {/* Win Sound Selection */}
                         <div className="space-y-2">
                             <label className="font-medium flex items-center gap-2">
                                <Music size={16} className="text-indigo-500"/>
                                {t('winSound', currentLang)}
                             </label>
                             <div className="grid grid-cols-2 gap-2">
                                {WIN_SOUND_PRESETS.map(sound => (
                                    <button
                                        key={sound.id}
                                        onClick={() => {
                                            setSettings(s => ({ ...s, winSound: sound.id }));
                                            audioManager.playWin(sound.id);
                                        }}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                                            settings.winSound === sound.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                            : 'border-transparent bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {sound.name}
                                    </button>
                                ))}
                             </div>
                         </div>

                         {/* Tick Sound Selection */}
                         <div className="space-y-2">
                             <label className="font-medium flex items-center gap-2">
                                <Speaker size={16} className="text-indigo-500"/>
                                {t('tickSound', currentLang)}
                             </label>
                             <div className="grid grid-cols-2 gap-2">
                                {TICK_SOUND_PRESETS.map(sound => (
                                    <button
                                        key={sound.id}
                                        onClick={() => {
                                            setSettings(s => ({ ...s, tickSound: sound.id }));
                                            audioManager.playTick(sound.id);
                                        }}
                                        className={`px-2 py-2 rounded-lg text-sm font-medium transition-all border-2 truncate ${
                                            settings.tickSound === sound.id
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                                            : 'border-transparent bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {sound.name}
                                    </button>
                                ))}
                             </div>
                         </div>

                         <div className="flex items-center justify-between">
                             <label className="font-medium">{t('confetti', currentLang)}</label>
                             <button 
                                onClick={() => setSettings(s => ({...s, showConfetti: !s.showConfetti}))}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.showConfetti ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                             >
                                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.showConfetti ? 'translate-x-6' : ''}`} />
                             </button>
                         </div>
                         <div className="flex items-center justify-between">
                             <label className="font-medium">{t('removeWinner', currentLang)}</label>
                             <button 
                                onClick={() => setSettings(s => ({...s, removeWinner: !s.removeWinner}))}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.removeWinner ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                             >
                                 <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings.removeWinner ? 'translate-x-6' : ''}`} />
                             </button>
                         </div>
                     </div>

                     {/* WHEEL COLLECTIONS PRESETS */}
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t('collections', currentLang)}</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                        {WHEEL_PRESETS.map(preset => (
                            <button
                                key={preset.name}
                                onClick={() => applyPreset(preset)}
                                className="relative aspect-video rounded-xl overflow-hidden group shadow-sm hover:shadow-md transition-all hover:scale-105 ring-2 ring-transparent hover:ring-indigo-500/50"
                            >
                                <img src={preset.image} alt={preset.name} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                     <span className="text-xs font-bold text-white uppercase tracking-wider block flex items-center gap-1">
                                        <Disc size={12} className="inline" /> {preset.name}
                                     </span>
                                     <span className="text-[10px] text-slate-300">{preset.items.length} items</span>
                                </div>
                            </button>
                        ))}
                     </div>

                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t('appearance', currentLang)}</h3>
                     <div className="space-y-8">
                         {/* CENTER HUB CUSTOMIZATION */}
                         <div>
                            <label className="font-medium block mb-3 flex items-center gap-2">
                                <Disc size={16} className="text-indigo-500"/>
                                {t('centerHub', currentLang)}
                             </label>
                             
                             {/* Hub Color */}
                             <div className="mb-4">
                                 <div className="text-xs text-slate-500 mb-2">{t('styleColor', currentLang)}</div>
                                 <div className="grid grid-cols-5 gap-2">
                                    {HUB_COLOR_PRESETS.map(hub => (
                                        <button
                                            key={hub.id}
                                            onClick={() => setSettings(s => ({ ...s, centerHubColor: hub.id }))}
                                            className={`relative h-10 rounded-lg border-2 transition-all hover:scale-105 ${settings.centerHubColor === hub.id ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-110' : 'border-transparent hover:border-slate-300'}`}
                                            style={{ background: hub.color }}
                                            title={hub.name}
                                        />
                                    ))}
                                     {/* Custom Hub Color Picker */}
                                    <label 
                                        className={`relative h-10 rounded-lg border-2 transition-all group shadow-sm flex items-center justify-center cursor-pointer overflow-hidden ${
                                            !HUB_COLOR_PRESETS.map(h => h.id).includes(settings.centerHubColor)
                                            ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-white dark:bg-slate-700' 
                                            : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 bg-slate-200 dark:bg-slate-800'
                                        }`}
                                    >
                                        <div 
                                            className="w-full h-full opacity-50"
                                            style={{ background: !HUB_COLOR_PRESETS.map(h => h.id).includes(settings.centerHubColor) ? settings.centerHubColor : 'transparent' }} 
                                        />
                                        <Palette size={16} className="absolute text-slate-500" />
                                        <input 
                                            type="color" 
                                            value={!HUB_COLOR_PRESETS.map(h => h.id).includes(settings.centerHubColor) ? settings.centerHubColor : '#ffffff'}
                                            onChange={(e) => setSettings(s => ({ ...s, centerHubColor: e.target.value }))}
                                            className="absolute opacity-0 inset-0 cursor-pointer w-full h-full"
                                        />
                                    </label>
                                 </div>
                             </div>

                             {/* Hub Icon & Shape */}
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs text-slate-500 mb-2">{t('icon', currentLang)}</div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {HUB_ICON_PRESETS.map(icon => (
                                            <button
                                                key={icon.id}
                                                onClick={() => setSettings(s => ({...s, centerHubIcon: icon.id}))}
                                                className={`h-10 flex items-center justify-center rounded-lg transition-all border border-slate-200 dark:border-slate-700 ${settings.centerHubIcon === icon.id ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                title={icon.name}
                                            >
                                                {icon.icon}
                                            </button>
                                        ))}
                                    </div>
                                    {/* Hub Text Input - Only visible if Text icon is selected */}
                                    {settings.centerHubIcon === 'text' && (
                                        <div className="mt-2 animate-in fade-in slide-in-from-top-1">
                                            <input
                                                type="text"
                                                value={settings.centerHubText}
                                                onChange={(e) => setSettings(s => ({...s, centerHubText: e.target.value.toUpperCase()}))}
                                                placeholder="SPIN"
                                                maxLength={8}
                                                className="w-full px-2 py-1 text-xs text-center font-bold rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <div className="text-xs text-slate-500 mb-2">{t('shape', currentLang)}</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {HUB_SHAPE_PRESETS.map(shape => (
                                            <button
                                                key={shape.id}
                                                onClick={() => setSettings(s => ({...s, centerHubShape: shape.id}))}
                                                className={`h-10 flex items-center justify-center rounded-lg transition-all border border-slate-200 dark:border-slate-700 ${settings.centerHubShape === shape.id ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                title={shape.name}
                                            >
                                                {shape.icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                             </div>
                         </div>

                         {/* POINTER STYLE */}
                         <div>
                             <label className="font-medium block mb-3 flex items-center gap-2">
                                <Navigation size={16} className="text-indigo-500 rotate-90"/>
                                {t('pointer', currentLang)}
                             </label>
                             
                             {/* Style Selection */}
                             <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                                {POINTER_PRESETS.map(pointer => (
                                    <button
                                        key={pointer.id}
                                        onClick={() => setSettings(s => ({...s, pointerStyle: pointer.id}))}
                                        className={`h-16 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                                            settings.pointerStyle === pointer.id 
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {/* Mini SVG preview */}
                                        <svg width="24" height="24" viewBox="0 0 60 60" className="drop-shadow-sm">
                                            {renderPointerPreview(pointer.id, settings.pointerColor)}
                                        </svg>
                                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{pointer.name}</span>
                                    </button>
                                ))}
                             </div>

                             {/* Color Selection */}
                             <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                 <div className="text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Pointer Color</div>
                                 <div className="flex flex-wrap gap-2">
                                    {POINTER_COLOR_PRESETS.map(color => (
                                        <button
                                            key={color.id}
                                            onClick={() => setSettings(s => ({...s, pointerColor: color.id}))}
                                            className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm hover:scale-110 ${settings.pointerColor === color.id ? 'border-indigo-500 ring-2 ring-indigo-500/30' : 'border-transparent'}`}
                                            style={{ backgroundColor: color.id }}
                                            title={color.name}
                                        />
                                    ))}
                                     {/* Custom Color Input */}
                                    <label className="relative w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600 overflow-hidden cursor-pointer hover:scale-110 transition-transform bg-gradient-to-br from-red-500 via-green-500 to-blue-500 shadow-sm">
                                         <input 
                                            type="color" 
                                            value={settings.pointerColor}
                                            onChange={(e) => setSettings(s => ({...s, pointerColor: e.target.value}))}
                                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                        />
                                    </label>
                                 </div>
                             </div>
                         </div>

                         {/* WHEEL SKINS PRESETS */}
                         <div>
                             <label className="font-medium block mb-3 flex items-center gap-2">
                                <Layers size={16} className="text-indigo-500"/>
                                {t('skins', currentLang)}
                             </label>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                {WHEEL_IMAGE_PRESETS.map((skin) => (
                                    <button
                                        key={skin.name}
                                        onClick={() => setSettings(s => ({ ...s, wheelImage: skin.url }))}
                                        className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all group shadow-sm ${
                                            settings.wheelImage === skin.url 
                                            ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-[1.05]' 
                                            : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:scale-105'
                                        }`}
                                    >
                                        <img src={skin.url} alt={skin.name} className="w-full h-full object-cover" />
                                        
                                        {/* Selected Indicator */}
                                        {settings.wheelImage === skin.url && (
                                            <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center animate-in fade-in duration-200">
                                                <div className="bg-white rounded-full p-1 shadow-lg">
                                                    <Check size={14} className="text-indigo-600" />
                                                </div>
                                            </div>
                                        )}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setSettings(s => ({ ...s, wheelImage: '' }))}
                                    className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all group flex flex-col items-center justify-center gap-1 bg-slate-200 dark:bg-slate-800 ${
                                        !settings.wheelImage 
                                        ? 'border-indigo-500 ring-2 ring-indigo-500/30 text-indigo-500' 
                                        : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                                        <div className="w-0.5 h-full bg-current rotate-45" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase">{t('none', currentLang)}</span>
                                </button>
                             </div>

                             <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Custom Wheel Image URL..."
                                        value={settings.wheelImage || ''}
                                        onChange={(e) => setSettings(s => ({...s, wheelImage: e.target.value}))}
                                        className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    <button 
                                        onClick={() => wheelImageInputRef.current?.click()}
                                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        title="Upload Image"
                                    >
                                        <Upload size={18} />
                                    </button>
                                    <input 
                                        ref={wheelImageInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleWheelImageUpload}
                                        className="hidden"
                                    />
                                </div>
                             </div>
                         </div>
                        
                        {/* WHEEL RIM SETTINGS */}
                         <div>
                             <label className="font-medium block mb-3 flex items-center gap-2">
                                <Circle size={16} className="text-indigo-500"/>
                                {t('rim', currentLang)}
                             </label>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                {RIM_PRESETS.map((rim) => (
                                    <button
                                        key={rim.id}
                                        onClick={() => setSettings(s => ({ ...s, rimColor: rim.id }))}
                                        className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all group shadow-sm flex items-center justify-center ${
                                            settings.rimColor === rim.id 
                                            ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-white dark:bg-slate-700' 
                                            : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 bg-slate-100 dark:bg-slate-800'
                                        }`}
                                    >
                                        <div 
                                            className="w-8 h-8 rounded-full border-4"
                                            style={{ 
                                                borderColor: rim.id.startsWith('#') ? rim.id : 'transparent',
                                                background: rim.color
                                            }} 
                                        />
                                        {rim.id === 'default' && <div className="w-8 h-8 rounded-full border-4 border-slate-300 absolute" />}
                                        
                                        <span className="ml-2 text-xs font-bold text-slate-600 dark:text-slate-300">{rim.name}</span>

                                        {/* Selected Indicator */}
                                        {settings.rimColor === rim.id && (
                                            <div className="absolute top-1 right-1 text-indigo-600">
                                                <Check size={12} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                                
                                {/* Custom Color Picker for Rim */}
                                <label 
                                    className={`relative h-14 rounded-xl overflow-hidden border-2 transition-all group shadow-sm flex items-center justify-center cursor-pointer ${
                                        !RIM_PRESETS.map(r => r.id).includes(settings.rimColor)
                                        ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-white dark:bg-slate-700' 
                                        : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 bg-slate-100 dark:bg-slate-800'
                                    }`}
                                >
                                    <div 
                                        className="w-8 h-8 rounded-full border-4"
                                        style={{ borderColor: !RIM_PRESETS.map(r => r.id).includes(settings.rimColor) ? settings.rimColor : '#000' }} 
                                    />
                                    <input 
                                        type="color" 
                                        value={!RIM_PRESETS.map(r => r.id).includes(settings.rimColor) ? settings.rimColor : '#ffffff'}
                                        onChange={(e) => setSettings(s => ({ ...s, rimColor: e.target.value }))}
                                        className="absolute opacity-0 inset-0 cursor-pointer w-full h-full"
                                    />
                                    <span className="ml-2 text-xs font-bold text-slate-600 dark:text-slate-300">{t('custom', currentLang)}</span>
                                </label>
                             </div>
                         </div>

                        {/* Background Presets */}
                         <div>
                             <label className="font-medium block mb-3 flex items-center gap-2">
                                <ImageIcon size={16} className="text-indigo-500"/>
                                {t('background', currentLang)}
                             </label>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                {BACKGROUND_PRESETS.map((bg) => (
                                    <button
                                        key={bg.name}
                                        onClick={() => setSettings(s => ({ ...s, backgroundImage: bg.url }))}
                                        className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all group shadow-sm ${
                                            settings.backgroundImage === bg.url 
                                            ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-[1.02]' 
                                            : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 hover:scale-105'
                                        }`}
                                    >
                                        <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        
                                        {/* Selected Indicator */}
                                        {settings.backgroundImage === bg.url && (
                                            <div className="absolute inset-0 bg-indigo-900/40 flex items-center justify-center animate-in fade-in duration-200">
                                                <div className="bg-white rounded-full p-1 shadow-lg">
                                                    <Check size={14} className="text-indigo-600" />
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Label */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-[2px] p-1.5 text-center">
                                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">{bg.name}</span>
                                        </div>
                                    </button>
                                ))}
                                <button
                                    onClick={() => setSettings(s => ({ ...s, backgroundImage: '' }))}
                                    className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all group flex flex-col items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 ${
                                        !settings.backgroundImage 
                                        ? 'border-indigo-500 ring-2 ring-indigo-500/30 text-indigo-500' 
                                        : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
                                        <div className="w-0.5 h-full bg-current rotate-45" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase">{t('none', currentLang)}</span>
                                </button>
                             </div>
                             
                             <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Custom Background URL..."
                                        value={settings.backgroundImage || ''}
                                        onChange={(e) => setSettings(s => ({...s, backgroundImage: e.target.value}))}
                                        className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                        title="Upload Image"
                                    >
                                        <Upload size={18} />
                                    </button>
                                    <input 
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                             </div>
                         </div>
                     </div>
                 </div>
               )}
               
            </div>
        </aside>

      </main>

      {/* Footer */}
      <footer className="glass-panel z-40 border-t border-slate-200/50 dark:border-slate-700/50 relative shrink-0">
        <div className="px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
             <div className="flex items-center gap-2">
                 <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500 font-bold">SpinMaster Pro</span>
                 <span className="opacity-50"> 2023</span>
             </div>
             
             <div className="flex items-center gap-2">
                 <span>Powered by</span>
                 <a 
                     href="https://abir2afridi.vercel.app/" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center gap-1 font-['Rock_Salt'] text-sm hover:scale-105 transition-transform duration-300"
                 >
                     <span className="animate-gradient-text bg-gradient-to-r from-indigo-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                         TheDevAbir|CodeCrafted
                     </span>
                 </a>
                 <style jsx global>{`
                     @keyframes gradient {
                         0% { background-position: 0% 50%; }
                         50% { background-position: 100% 50%; }
                         100% { background-position: 0% 50%; }
                     }
                     .animate-gradient-text {
                         background-size: 200% auto;
                         animation: gradient 3s ease infinite;
                         -webkit-background-clip: text;
                         -webkit-text-fill-color: transparent;
                     }
                 `}</style>
             </div>
        </div>
      </footer>

      {/* Floating Color Picker Popover */}
      {colorPickerState && (
          <ColorPickerPopover
              position={{ top: colorPickerState.top, bottom: colorPickerState.bottom, left: colorPickerState.left }}
              currentColor={entries.find(e => e.id === colorPickerState.id)?.color || '#000000'}
              onSelect={(color) => {
                addToHistory(); // Save history before color change
                updateEntry(colorPickerState.id, { color });
              }}
              onClose={() => setColorPickerState(null)}
          />
      )}

      <WinnerModal 
        winner={winner} 
        onClose={() => setWinner(null)}
        onRemove={handleRemoveWinner}
        language={settings.language}
      />
    </div>
  );
};

export default App;
