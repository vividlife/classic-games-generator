"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Mode = "learn" | "practice" | "match";
type NoteId = "do4" | "re4" | "mi4" | "fa4" | "sol4" | "la4" | "si4" | "do5";

interface SolfegeNote {
  id: NoteId;
  label: string;
  shortLabel: string;
  hz: number;
  color: string;
}

interface EarStats {
  total: number;
  correct: number;
  streak: number;
  bestStreak: number;
  matches: number;
}

interface MatchPlayer {
  id: number;
  name: string;
  score: number;
  attempts: number;
}

const NOTES: SolfegeNote[] = [
  { id: "do4", label: "低 Do", shortLabel: "Do", hz: 261.63, color: "border-red-400/70 bg-red-500/15 text-red-200" },
  { id: "re4", label: "Re", shortLabel: "Re", hz: 293.66, color: "border-orange-400/70 bg-orange-500/15 text-orange-200" },
  { id: "mi4", label: "Mi", shortLabel: "Mi", hz: 329.63, color: "border-yellow-300/70 bg-yellow-400/15 text-yellow-100" },
  { id: "fa4", label: "Fa", shortLabel: "Fa", hz: 349.23, color: "border-emerald-400/70 bg-emerald-500/15 text-emerald-200" },
  { id: "sol4", label: "Sol", shortLabel: "Sol", hz: 392, color: "border-cyan-400/70 bg-cyan-500/15 text-cyan-200" },
  { id: "la4", label: "La", shortLabel: "La", hz: 440, color: "border-blue-400/70 bg-blue-500/15 text-blue-200" },
  { id: "si4", label: "Si", shortLabel: "Si", hz: 493.88, color: "border-violet-400/70 bg-violet-500/15 text-violet-200" },
  { id: "do5", label: "高 Do", shortLabel: "Do↑", hz: 523.25, color: "border-rose-300/70 bg-rose-400/15 text-rose-100" },
];

const NOTE_BY_ID = Object.fromEntries(NOTES.map(note => [note.id, note])) as Record<NoteId, SolfegeNote>;
const DEFAULT_STATS: EarStats = { total: 0, correct: 0, streak: 0, bestStreak: 0, matches: 0 };
const STATS_KEY = "classic-games-generator:chord-ear:stats";
const SINGLE_NOTE_VOLUME = 0.42;
const CHORD_NOTE_VOLUME = 0.2;

const MODES: { id: Mode; label: string; description: string }[] = [
  { id: "learn", label: "学习", description: "听单音、看答案、熟悉音高" },
  { id: "practice", label: "练习", description: "听组合并输入顺序" },
  { id: "match", label: "家庭赛", description: "轮流答题，自动记分" },
];

const PRESETS: { label: string; notes: NoteId[] }[] = [
  { label: "入门四音", notes: ["do4", "re4", "mi4", "fa4"] },
  { label: "三和弦感", notes: ["do4", "mi4", "sol4", "do5"] },
  { label: "五声音阶", notes: ["do4", "re4", "mi4", "sol4", "la4"] },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createSequence(noteIds: NoteId[]): NoteId[] {
  return shuffle(noteIds);
}

function formatSequence(noteIds: NoteId[]): string {
  return noteIds.map(id => NOTE_BY_ID[id].shortLabel).join(" - ");
}

export default function ChordEarGame() {
  const [mode, setMode] = useState<Mode>("learn");
  const [selectedNotes, setSelectedNotes] = useState<NoteId[]>(PRESETS[0].notes);
  const [sequence, setSequence] = useState<NoteId[]>(() => createSequence(PRESETS[0].notes));
  const [answer, setAnswer] = useState<NoteId[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState<EarStats>(DEFAULT_STATS);
  const [players, setPlayers] = useState<MatchPlayer[]>([
    { id: 1, name: "玩家 1", score: 0, attempts: 0 },
    { id: 2, name: "玩家 2", score: 0, attempts: 0 },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [matchRound, setMatchRound] = useState(0);
  const [matchTarget, setMatchTarget] = useState(8);
  const audioRef = useRef<AudioContext | null>(null);

  const selectedSet = useMemo(() => new Set(selectedNotes), [selectedNotes]);
  const answerSet = useMemo(() => new Set(answer), [answer]);
  const accuracy = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
  const matchComplete = mode === "match" && matchRound >= matchTarget;
  const activePlayer = players[currentPlayerIndex] ?? players[0];
  const winners = useMemo(() => {
    if (!matchComplete) return [];
    const best = Math.max(...players.map(player => player.score));
    return players.filter(player => player.score === best);
  }, [matchComplete, players]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STATS_KEY);
      if (raw) setStats({ ...DEFAULT_STATS, ...JSON.parse(raw) });
    } catch {
      setStats(DEFAULT_STATS);
    }
  }, []);

  const saveStats = (next: EarStats) => {
    setStats(next);
    try {
      window.localStorage.setItem(STATS_KEY, JSON.stringify(next));
    } catch {
      // localStorage can be unavailable in private browsing.
    }
  };

  const getAudioContext = () => {
    if (audioRef.current) return audioRef.current;
    const win = window as typeof window & { webkitAudioContext?: typeof AudioContext };
    const AudioCtor = win.AudioContext ?? win.webkitAudioContext;
    if (!AudioCtor) return null;
    audioRef.current = new AudioCtor();
    return audioRef.current;
  };

  const playNotes = async (noteIds: NoteId[], asChord = false) => {
    const ctx = getAudioContext();
    if (!ctx || isPlaying) return;
    await ctx.resume();
    setIsPlaying(true);

    const now = ctx.currentTime + 0.04;
    const duration = asChord ? 1.2 : 0.52;
    const gap = asChord ? 0 : 0.18;

    noteIds.forEach((id, index) => {
      const note = NOTE_BY_ID[id];
      const start = asChord ? now : now + index * (duration + gap);
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(note.hz, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(asChord ? CHORD_NOTE_VOLUME : SINGLE_NOTE_VOLUME, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.04);
    });

    const totalMs = asChord
      ? Math.ceil((duration + 0.1) * 1000)
      : Math.ceil((noteIds.length * duration + Math.max(0, noteIds.length - 1) * gap + 0.1) * 1000);
    window.setTimeout(() => setIsPlaying(false), totalMs);
  };

  const startRound = (autoPlay = true) => {
    const next = createSequence(selectedNotes);
    setSequence(next);
    setAnswer([]);
    setFeedback(null);
    setShowAnswer(false);
    if (autoPlay) void playNotes(next);
  };

  const choosePreset = (notes: NoteId[]) => {
    setSelectedNotes(notes);
    setSequence(createSequence(notes));
    setAnswer([]);
    setFeedback(null);
    setShowAnswer(false);
  };

  const toggleNote = (noteId: NoteId) => {
    const exists = selectedSet.has(noteId);
    if (exists && selectedNotes.length <= 4) return;
    if (!exists && selectedNotes.length >= 5) return;

    const next = exists
      ? selectedNotes.filter(id => id !== noteId)
      : NOTES.filter(note => selectedSet.has(note.id) || note.id === noteId).map(note => note.id);

    setSelectedNotes(next);
    setSequence(createSequence(next));
    setAnswer([]);
    setFeedback(null);
    setShowAnswer(false);
  };

  const updateScore = (isCorrect: boolean) => {
    if (mode === "learn") return;

    const nextStats: EarStats = {
      total: stats.total + 1,
      correct: stats.correct + (isCorrect ? 1 : 0),
      streak: isCorrect ? stats.streak + 1 : 0,
      bestStreak: isCorrect ? Math.max(stats.bestStreak, stats.streak + 1) : stats.bestStreak,
      matches: stats.matches,
    };
    saveStats(nextStats);

    if (mode === "match") {
      setPlayers(prev =>
        prev.map((player, index) =>
          index === currentPlayerIndex
            ? {
                ...player,
                score: player.score + (isCorrect ? 1 : 0),
                attempts: player.attempts + 1,
              }
            : player
        )
      );
      setMatchRound(prev => prev + 1);
      setCurrentPlayerIndex(prev => (prev + 1) % players.length);
    }
  };

  const enterNote = (noteId: NoteId) => {
    if (feedback || answerSet.has(noteId) || !selectedSet.has(noteId)) return;
    const next = [...answer, noteId];
    setAnswer(next);

    if (next.length === sequence.length) {
      const isCorrect = next.join(",") === sequence.join(",");
      setFeedback(isCorrect ? "correct" : "wrong");
      setShowAnswer(true);
      updateScore(isCorrect);
    }
  };

  const removeLastAnswer = () => {
    if (feedback) return;
    setAnswer(prev => prev.slice(0, -1));
  };

  const clearAnswer = () => {
    if (feedback) return;
    setAnswer([]);
  };

  const resetStats = () => {
    saveStats(DEFAULT_STATS);
  };

  const updatePlayerName = (id: number, name: string) => {
    setPlayers(prev =>
      prev.map(player =>
        player.id === id ? { ...player, name: name.trimStart().slice(0, 10) } : player
      )
    );
  };

  const addPlayer = () => {
    if (players.length >= 4) return;
    const nextId = Math.max(...players.map(player => player.id)) + 1;
    setPlayers(prev => [...prev, { id: nextId, name: `玩家 ${nextId}`, score: 0, attempts: 0 }]);
  };

  const removePlayer = (id: number) => {
    if (players.length <= 2) return;
    setPlayers(prev => prev.filter(player => player.id !== id));
    setCurrentPlayerIndex(0);
  };

  const resetMatch = (countAsMatch = false) => {
    setPlayers(prev => prev.map(player => ({ ...player, score: 0, attempts: 0 })));
    setCurrentPlayerIndex(0);
    setMatchRound(0);
    setFeedback(null);
    setShowAnswer(false);
    setAnswer([]);
    setSequence(createSequence(selectedNotes));
    if (countAsMatch) saveStats({ ...stats, matches: stats.matches + 1 });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <section className="mb-5 sm:mb-6">
        <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-300 to-rose-300" />
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-4xl mb-2">🎹</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">和弦听辨</h2>
                <p className="text-slate-400 text-sm mt-1">
                  选择 4 或 5 个唱名，听随机排列，再按顺序输入答案。
                </p>
              </div>
              <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-slate-900/70 p-2 min-w-[220px]">
                {selectedNotes.map((id, index) => (
                  <div
                    key={`${id}-${index}`}
                    className={`h-14 rounded-lg border flex items-center justify-center text-sm font-bold ${NOTE_BY_ID[id].color}`}
                  >
                    {NOTE_BY_ID[id].shortLabel}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
            <div className="flex flex-wrap gap-2 mb-4">
              {MODES.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setMode(item.id);
                    setFeedback(null);
                    setAnswer([]);
                    setShowAnswer(false);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    mode === item.id
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-400">
              {MODES.find(item => item.id === mode)?.description}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-white font-semibold">选择音符</h3>
                <p className="text-xs text-slate-400 mt-1">当前 {selectedNotes.length} 个音符，只能选择 4 或 5 个。</p>
              </div>
              <button
                onClick={() => void playNotes(selectedNotes, true)}
                disabled={isPlaying}
                className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 text-sm font-semibold"
              >
                同时听
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
              {NOTES.map(note => {
                const active = selectedSet.has(note.id);
                const disabled = (!active && selectedNotes.length >= 5) || (active && selectedNotes.length <= 4);
                return (
                  <button
                    key={note.id}
                    onClick={() => toggleNote(note.id)}
                    disabled={disabled}
                    className={`h-16 rounded-xl border text-sm font-bold transition-all ${
                      active
                        ? note.color
                        : disabled
                          ? "border-slate-700 bg-slate-900 text-slate-600 cursor-not-allowed"
                          : "border-slate-600 bg-slate-900 text-slate-300 hover:border-cyan-400"
                    }`}
                  >
                    {note.shortLabel}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => choosePreset(preset.notes)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs font-medium"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold">听题</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === "match" && activePlayer ? `当前答题：${activePlayer.name || "未命名"}` : "播放后按听到的顺序输入。"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => void playNotes(sequence)}
                  disabled={isPlaying}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-sm font-bold"
                >
                  {isPlaying ? "播放中" : "播放题目"}
                </button>
                <button
                  onClick={() => startRound(true)}
                  disabled={matchComplete}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 text-sm font-semibold"
                >
                  新题
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-700 p-3 mb-4">
              <div className="grid grid-cols-5 gap-2 min-h-[64px]">
                {Array.from({ length: selectedNotes.length }).map((_, index) => {
                  const noteId = answer[index];
                  return (
                    <div
                      key={index}
                      className={`h-14 rounded-lg border flex items-center justify-center text-sm font-bold ${
                        noteId ? NOTE_BY_ID[noteId].color : "border-slate-700 bg-slate-800 text-slate-500"
                      }`}
                    >
                      {noteId ? NOTE_BY_ID[noteId].shortLabel : index + 1}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-4">
              {selectedNotes.map(noteId => {
                const note = NOTE_BY_ID[noteId];
                const used = answerSet.has(noteId);
                return (
                  <button
                    key={noteId}
                    onClick={() => enterNote(noteId)}
                    disabled={used || !!feedback}
                    className={`h-14 rounded-xl border text-sm font-bold transition-all ${
                      used || feedback
                        ? "border-slate-700 bg-slate-900 text-slate-600"
                        : `${note.color} hover:brightness-125`
                    }`}
                  >
                    {note.shortLabel}
                  </button>
                );
              })}
              <button
                onClick={removeLastAnswer}
                disabled={answer.length === 0 || !!feedback}
                className="h-14 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 text-sm font-semibold"
              >
                退格
              </button>
              <button
                onClick={clearAnswer}
                disabled={answer.length === 0 || !!feedback}
                className="h-14 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 text-sm font-semibold"
              >
                清空
              </button>
            </div>

            {feedback && (
              <div
                className={`rounded-xl border px-4 py-3 mb-4 ${
                  feedback === "correct"
                    ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-200"
                    : "border-rose-400/50 bg-rose-500/15 text-rose-200"
                }`}
              >
                <p className="font-semibold">{feedback === "correct" ? "答对了" : "顺序不对"}</p>
                <p className="text-sm mt-1">正确顺序：{formatSequence(sequence)}</p>
              </div>
            )}

            {mode === "learn" && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowAnswer(prev => !prev)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold"
                >
                  {showAnswer ? "隐藏答案" : "显示答案"}
                </button>
                {selectedNotes.map(noteId => (
                  <button
                    key={noteId}
                    onClick={() => void playNotes([noteId])}
                    disabled={isPlaying}
                    className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-sm"
                  >
                    听 {NOTE_BY_ID[noteId].shortLabel}
                  </button>
                ))}
              </div>
            )}

            {showAnswer && !feedback && (
              <div className="mt-4 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-3 text-cyan-100 text-sm">
                标准答案：{formatSequence(sequence)}
              </div>
            )}

            {matchComplete && (
              <div className="mt-4 rounded-xl border border-amber-400/50 bg-amber-500/15 px-4 py-3 text-amber-100">
                <p className="font-semibold">比赛结束：{winners.map(player => player.name || `玩家 ${player.id}`).join("、")} 胜出</p>
                <button
                  onClick={() => resetMatch(true)}
                  className="mt-3 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold"
                >
                  再赛一局
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">成绩统计</h3>
              <button
                onClick={resetStats}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium"
              >
                重置
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-xs text-slate-500">正确率</p>
                <p className="text-2xl font-bold text-white mt-1">{accuracy}%</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-xs text-slate-500">答题数</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-xs text-slate-500">当前连对</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.streak}</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-700 p-3">
                <p className="text-xs text-slate-500">最佳连对</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.bestStreak}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-white font-semibold">家庭赛</h3>
              <span className="text-xs text-slate-400">{Math.min(matchRound, matchTarget)} / {matchTarget} 题</span>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-slate-400">题数</span>
              {[8, 12, 16].map(count => (
                <button
                  key={count}
                  onClick={() => {
                    setMatchTarget(count);
                    resetMatch();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    matchTarget === count ? "bg-cyan-500 text-slate-950" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>

            <div className="space-y-2 mb-4">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`rounded-xl border p-3 ${
                    mode === "match" && index === currentPlayerIndex && !matchComplete
                      ? "border-cyan-400/60 bg-cyan-500/10"
                      : "border-slate-700 bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      value={player.name}
                      onChange={event => updatePlayerName(player.id, event.target.value)}
                      className="min-w-0 flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                    <span className="w-12 text-right text-lg font-bold text-white">{player.score}</span>
                    <button
                      onClick={() => removePlayer(player.id)}
                      disabled={players.length <= 2}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-400"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">已答 {player.attempts} 题</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={addPlayer}
                disabled={players.length >= 4}
                className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 text-sm font-semibold"
              >
                加玩家
              </button>
              <button
                onClick={() => resetMatch()}
                className="py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-semibold"
              >
                重开赛
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-4 sm:p-5">
            <h3 className="text-white font-semibold mb-3">玩法提示</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>1. 先选择 4 或 5 个音符。</p>
              <p>2. 点击“播放题目”，听系统随机排列。</p>
              <p>3. 按听到的顺序点击音符，完成后自动判定。</p>
              <p>4. 家庭赛会轮流切换答题者，适合家长和孩子一起玩。</p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
