import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus,
  Trash2, 
  MapPin, 
  Accessibility, 
  Navigation, 
  Loader2, 
  ChevronRight,
  Home,
  Users,
  Car,
  Settings as SettingsIcon,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { optimizeRoute, type User, type OptimizationResult } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [daycareAddress, setDaycareAddress] = useState('東京都新宿区西新宿2-8-1');
  const [vehicleCapacity, setVehicleCapacity] = useState(6);
  const [wheelchairCapacity, setWheelchairCapacity] = useState(2);
  
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newHasWheelchair, setNewHasWheelchair] = useState(false);
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSamples = () => {
    const samples: User[] = [
      { id: crypto.randomUUID(), name: '田中 太郎', address: '東京都新宿区西新宿1-1-1', hasWheelchair: false },
      { id: crypto.randomUUID(), name: '佐藤 花子', address: '東京都新宿区北新宿2-2-2', hasWheelchair: true },
      { id: crypto.randomUUID(), name: '鈴木 一郎', address: '東京都新宿区歌舞伎町1-5-1', hasWheelchair: false },
      { id: crypto.randomUUID(), name: '高橋 健二', address: '東京都新宿区西落合3-3-3', hasWheelchair: false },
      { id: crypto.randomUUID(), name: '伊藤 美紀', address: '東京都新宿区中井1-1-1', hasWheelchair: true },
    ];
    setUsers([...users, ...samples]);
  };

  const addUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAddress) return;
    
    const newUser: User = {
      id: crypto.randomUUID(),
      name: newName,
      address: newAddress,
      hasWheelchair: newHasWheelchair,
    };
    
    setUsers([...users, newUser]);
    setNewName('');
    setNewAddress('');
    setNewHasWheelchair(false);
  };

  const removeUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleOptimize = async () => {
    if (users.length === 0) {
      setError('利用者を1人以上追加してください。');
      return;
    }
    
    setIsOptimizing(true);
    setError(null);
    setResult(null);
    
    try {
      const res = await optimizeRoute(daycareAddress, users, vehicleCapacity, wheelchairCapacity);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError('ルートの最適化中にエラーが発生しました。');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans">
      {/* Header */}
      <header className="bg-[#111111] border-b border-white/5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Navigation className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">デイ送迎ルート最適化くん</h1>
          </div>
          <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
            Route Optimizer v1.0
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input & Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daycare Settings */}
          <section className="bg-[#111111] rounded-2xl shadow-2xl border border-white/5 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-4 h-4 text-emerald-500" />
              <h2 className="font-semibold text-zinc-200">拠点設定</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">デイサービス住所</label>
                <input 
                  type="text" 
                  value={daycareAddress}
                  onChange={(e) => setDaycareAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-200 placeholder:text-zinc-600"
                  placeholder="住所を入力..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">車両定員</label>
                  <div className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-lg p-1">
                    <button 
                      type="button"
                      onClick={() => setVehicleCapacity(Math.max(1, vehicleCapacity - 1))}
                      className="p-1.5 hover:bg-white/5 rounded-md text-zinc-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-mono font-bold text-zinc-200">{vehicleCapacity}</span>
                    <button 
                      type="button"
                      onClick={() => setVehicleCapacity(vehicleCapacity + 1)}
                      className="p-1.5 hover:bg-white/5 rounded-md text-zinc-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">車椅子枠</label>
                  <div className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-lg p-1">
                    <button 
                      type="button"
                      onClick={() => setWheelchairCapacity(Math.max(0, wheelchairCapacity - 1))}
                      className="p-1.5 hover:bg-white/5 rounded-md text-zinc-400 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-mono font-bold text-zinc-200">{wheelchairCapacity}</span>
                    <button 
                      type="button"
                      onClick={() => setWheelchairCapacity(wheelchairCapacity + 1)}
                      className="p-1.5 hover:bg-white/5 rounded-md text-zinc-400 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* User List */}
          <section className="bg-[#111111] rounded-2xl shadow-2xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <h2 className="font-semibold text-zinc-200">利用者リスト ({users.length}名)</h2>
              </div>
              <button 
                onClick={loadSamples}
                className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors uppercase tracking-widest"
              >
                サンプル読込
              </button>
            </div>

            <form onSubmit={addUser} className="mb-6 space-y-3 p-4 bg-emerald-950/20 rounded-xl border border-emerald-900/30">
              <input 
                type="text" 
                placeholder="名前" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg focus:outline-none text-zinc-200 placeholder:text-zinc-600"
              />
              <input 
                type="text" 
                placeholder="住所" 
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg focus:outline-none text-zinc-200 placeholder:text-zinc-600"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setNewHasWheelchair(!newHasWheelchair)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                    newHasWheelchair 
                      ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" 
                      : "bg-[#1a1a1a] border-white/10 text-zinc-500 hover:border-white/20"
                  )}
                >
                  <Accessibility className={cn("w-4 h-4", newHasWheelchair ? "text-emerald-400" : "text-zinc-600")} />
                  <span className="text-sm font-medium">車椅子利用</span>
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-900/40"
                >
                  <Plus className="w-4 h-4" /> 追加
                </button>
              </div>
            </form>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {users.length === 0 ? (
                  <div className="text-center py-8 text-zinc-600 italic text-sm">
                    利用者が登録されていません
                  </div>
                ) : (
                  users.map((user) => (
                    <motion.div 
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group flex items-start justify-between p-3 bg-[#161616] rounded-xl border border-white/5 hover:border-emerald-900/50 transition-all"
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">
                          {user.hasWheelchair ? (
                            <Accessibility className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <MapPin className="w-4 h-4 text-zinc-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-zinc-200">{user.name}</div>
                          <div className="text-xs text-zinc-500 truncate max-w-[180px]">{user.address}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => removeUser(user.id)}
                        className="p-1.5 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={handleOptimize}
              disabled={isOptimizing || users.length === 0}
              className={cn(
                "w-full mt-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20",
                isOptimizing || users.length === 0 
                  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
                  : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]"
              )}
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  ルートを計算中...
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5" />
                  最適ルートを提案
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
          </section>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-7">
          <section className="bg-[#111111] rounded-2xl shadow-2xl border border-white/5 min-h-[600px] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#161616]">
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4 text-emerald-500" />
                <h2 className="font-semibold text-zinc-200">提案ルート</h2>
              </div>
              {result && (
                <div className="text-[10px] font-mono bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded border border-emerald-800/50 uppercase tracking-widest">
                  Optimized
                </div>
              )}
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {!result && !isOptimizing && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                  <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                    <Navigation className="w-8 h-8 text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-300">ルートはまだ生成されていません</p>
                    <p className="text-sm text-zinc-400">左側のリストから利用者を設定し、<br/>「最適ルートを提案」をクリックしてください。</p>
                  </div>
                </div>
              )}

              {isOptimizing && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-4 border-emerald-900/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Navigation className="w-8 h-8 text-emerald-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="font-bold text-lg text-zinc-200">AIが最適な順番を計算しています</p>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-zinc-500 animate-pulse">住所の地理的関係を確認中...</p>
                      <p className="text-sm text-zinc-500 animate-pulse delay-75">車椅子の乗降時間を考慮中...</p>
                      <p className="text-sm text-zinc-500 animate-pulse delay-150">Google Mapsのデータを参照中...</p>
                    </div>
                  </div>
                </div>
              )}

              {result && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="prose prose-invert prose-sm max-w-none">
                    <div className="markdown-body">
                      <ReactMarkdown>{result.explanation}</ReactMarkdown>
                    </div>
                  </div>

                  {result.mapLinks.length > 0 && (
                    <div className="space-y-3 pt-6 border-t border-white/5">
                      <h3 className="text-sm font-bold flex items-center gap-2 text-zinc-300">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        関連マップリンク
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {result.mapLinks.map((link, idx) => (
                          <a 
                            key={idx}
                            href={link.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-xl border border-white/5 hover:bg-emerald-900/20 hover:border-emerald-800/50 transition-all group"
                          >
                            <span className="text-xs font-medium truncate pr-2 text-zinc-300 group-hover:text-emerald-400">{link.title}</span>
                            <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-12 border-t border-white/5 text-center">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
          © 2026 デイ送迎ルート最適化くん - Powered by Gemini AI
        </p>
      </footer>
    </div>
  );
}
