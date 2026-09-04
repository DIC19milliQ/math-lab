"use client";

import { useEffect, useMemo, useState } from "react";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left.mjs";
import BarChart3 from "lucide-react/dist/esm/icons/chart-no-axes-column.mjs";
import Check from "lucide-react/dist/esm/icons/check.mjs";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right.mjs";
import Droplets from "lucide-react/dist/esm/icons/droplets.mjs";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical.mjs";
import Lightbulb from "lucide-react/dist/esm/icons/lightbulb.mjs";
import LockKeyhole from "lucide-react/dist/esm/icons/lock-keyhole.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.mjs";
import { Button } from "@/components/ui/button";
import { stages, skillNames, type Problem, type SkillId, type Stage } from "./capacity-data";

type Attempt = { problemId: string; unitId: string; stageId: string; skillId: SkillId; firstCorrect: boolean; hintUsed: boolean; retries: number; completed: boolean; lastResult: boolean; playedAt: string };
type SaveData = { version: 1; attempts: Attempt[]; completedStages: string[]; lastPlayed?: { unitId: string; stageId: string; problemId: string; at: string } };
type View = "home" | "stages" | "learn" | "progress";
const STORAGE_KEY = "math-lab-progress-v1";
const EMPTY: SaveData = { version: 1, attempts: [], completedStages: [] };
const SHAPE_CAPACITY: Record<string, number> = { wide: 1.15, normal: 1, narrow: 0.86 };

function Vessel({ amount, max = 1000, shape = "normal", label }: { amount: number; max?: number; shape?: string; label?: string }) {
  const width = shape === "wide" ? "w-32" : shape === "narrow" ? "w-24" : "w-28";
  const capacity = max * (SHAPE_CAPACITY[shape] ?? 1);
  const fill = Math.min(100, amount / capacity * 100);
  return <div className="flex flex-col items-center gap-2"><div className={`vessel ${width}`}><div className="water" style={{ height: `${fill}%` }} /><div className="shine" /></div>{label && <span className="font-black text-slate-600">{label}</span>}</div>;
}

function CapacityApp() {
  const [view, setView] = useState<View>("home");
  const [activeStage, setActiveStage] = useState<Stage>(stages[0]);
  const [problemIndex, setProblemIndex] = useState(0);
  const [save, setSave] = useState<SaveData>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => { queueMicrotask(() => { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setSave(JSON.parse(raw)); } catch {} setReady(true); }); }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); }, [save, ready]);
  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const life = new AbortController();
    void Promise.resolve(context.registerTool?.({ name: "start_capacity_stage", title: "かさのステージを始める", description: "指定した1〜9のステージを画面で開始します。", inputSchema: { type: "object", properties: { stageNumber: { type: "integer", minimum: 1, maximum: 9 } }, required: ["stageNumber"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: (input: unknown) => { const n = Number((input as { stageNumber?: number })?.stageNumber); const found = stages.find(s => s.number === n); if (!found) throw new Error("stageNumber must be 1 to 9"); setActiveStage(found); setProblemIndex(0); setView("learn"); return { opened: true, stageId: found.id, title: found.title }; } }, { signal: life.signal })).catch(() => {});
    return () => life.abort();
  }, []);

  const startStage = (stage: Stage) => { setActiveStage(stage); setProblemIndex(0); setView("learn"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const record = (problem: Problem, firstCorrect: boolean, hintUsed: boolean, retries: number) => {
    const attempt: Attempt = { problemId: problem.problemId, unitId: problem.unitId, stageId: problem.stageId, skillId: problem.skillId, firstCorrect, hintUsed, retries, completed: true, lastResult: true, playedAt: new Date().toISOString() };
    setSave(prev => ({ ...prev, attempts: [...prev.attempts, attempt], lastPlayed: { unitId: problem.unitId, stageId: problem.stageId, problemId: problem.problemId, at: attempt.playedAt } }));
  };
  const completeProblem = (firstCorrect: boolean, hintUsed: boolean, retries: number) => {
    const problem = activeStage.problems[problemIndex]; record(problem, firstCorrect, hintUsed, retries);
    if (problemIndex < activeStage.problems.length - 1) setProblemIndex(i => i + 1);
    else { setSave(prev => ({ ...prev, completedStages: [...new Set([...prev.completedStages, activeStage.id])] })); setView("stages"); }
  };
  const clearProgress = () => { if (confirm("このたんまつの きろくを ぜんぶけしますか？")) setSave(EMPTY); };

  if (view === "home") return <HomeScreen save={save} onStart={() => setView("stages")} onProgress={() => setView("progress")} />;
  if (view === "progress") return <ProgressScreen save={save} onBack={() => setView("home")} onClear={clearProgress} />;
  if (view === "stages") return <StageScreen save={save} onHome={() => setView("home")} onStart={startStage} onProgress={() => setView("progress")} />;
  return <LessonShell stage={activeStage} index={problemIndex} total={activeStage.problems.length} onBack={() => setView("stages")}><ProblemPlayer key={activeStage.problems[problemIndex].problemId} problem={activeStage.problems[problemIndex]} onComplete={completeProblem} /></LessonShell>;
}

function Header({ onHome, onProgress }: { onHome: () => void; onProgress?: () => void }) {
  return <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-5 py-5 sm:px-8"><button onClick={onHome} className="flex min-h-12 items-center gap-3 rounded-2xl px-2 text-left"><span className="grid size-11 place-items-center rounded-2xl bg-cyan-600 text-white shadow-sm"><FlaskConical /></span><span><span className="eyebrow block">MATH LAB</span><strong className="text-lg">算数ラボ</strong></span></button>{onProgress && <Button variant="outline" onClick={onProgress} className="h-12 rounded-2xl bg-white/70 px-4 text-base font-bold"><BarChart3 /> きろく</Button>}</header>;
}

function HomeScreen({ save, onStart, onProgress }: { save: SaveData; onStart: () => void; onProgress: () => void }) {
  const pct = Math.round(save.completedStages.length / stages.length * 100);
  return <main className="min-h-dvh"><Header onHome={() => {}} onProgress={onProgress} /><div className="mx-auto max-w-6xl px-5 pb-12 sm:px-8"><section className="mt-5 grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-center"><div><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 font-bold text-cyan-800"><Sparkles className="size-5" /> さわって、ためして、見つけよう</div><h1 className="text-balance text-4xl font-black leading-[1.15] tracking-tight text-slate-800 sm:text-6xl">水のりょうには、<br/><span className="text-cyan-600">ひみつ</span>がある。</h1><p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-slate-600">うつしたり、そろえたり。水をさわって「かさ」のしくみを見つけよう。</p></div><div className="lab-card relative overflow-hidden p-6 sm:p-8"><div className="absolute -right-10 -top-10 size-36 rounded-full bg-cyan-100/80"/><Droplets className="relative size-10 text-cyan-600"/><p className="relative mt-4 text-sm font-extrabold tracking-widest text-cyan-700">いま できる じっけん</p><h2 className="relative mt-1 text-4xl font-black">かさ</h2><div className="relative mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${pct}%` }}/></div><p className="relative mt-2 font-bold text-slate-500">{save.completedStages.length} / 9 ステージ</p><Button onClick={onStart} className="big-action relative mt-7 w-full">{pct ? "つづきから" : "はじめる"}<ChevronRight /></Button></div></section><section className="mt-12"><p className="mb-4 text-sm font-extrabold tracking-widest text-slate-500">これから ふえる じっけん</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{["とけい", "ながさ", "かけ算", "図形"].map(name => <div key={name} className="flex min-h-24 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/55 p-4 text-slate-500"><span className="font-bold">{name}</span><LockKeyhole className="size-4"/></div>)}</div></section></div></main>;
}

function StageScreen({ save, onHome, onStart, onProgress }: { save: SaveData; onHome: () => void; onStart: (s: Stage) => void; onProgress: () => void }) {
  return <main className="min-h-dvh"><Header onHome={onHome} onProgress={onProgress}/><div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8"><div className="mt-4 flex items-end justify-between"><div><p className="eyebrow">かさの じっけん</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">どこから ためす？</h1></div><span className="font-black text-cyan-700">{save.completedStages.length} / 9</span></div><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stages.map(stage => { const done = save.completedStages.includes(stage.id); return <button key={stage.id} onClick={() => onStart(stage)} className="stage-card group text-left" style={{ "--stage": stage.color } as React.CSSProperties}><div className="flex items-start justify-between"><span className="stage-number">{done ? <Check/> : stage.number}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{stage.phase}</span></div><h2 className="mt-5 text-xl font-black">{stage.title}</h2><p className="mt-2 min-h-12 font-medium leading-relaxed text-slate-500">{stage.short}</p><div className="mt-5 flex items-center justify-between text-sm font-black" style={{ color: stage.color }}><span>{done ? "もういちど" : "ためす"}</span><ChevronRight className="transition-transform group-hover:translate-x-1"/></div></button>})}</div></div></main>;
}

function LessonShell({ stage, index, total, onBack, children }: { stage: Stage; index: number; total: number; onBack: () => void; children: React.ReactNode }) {
  return <main className="min-h-dvh"><div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-8"><Button variant="outline" onClick={onBack} className="size-12 rounded-2xl bg-white/80" aria-label="ステージ一覧へ"><ArrowLeft/></Button><div className="flex-1"><div className="flex justify-between text-sm font-black text-slate-500"><span>STAGE {stage.number} ・ {stage.phase}</span><span>{index + 1} / {total}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full transition-all" style={{ width: `${(index + 1) / total * 100}%`, background: stage.color }}/></div></div></div><div className="mx-auto max-w-5xl px-4 pb-10 sm:px-8"><section className="lesson-card"><p className="eyebrow">{skillNames[stage.skillId]}</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">{stage.title}</h1><div className="mt-6">{children}</div></section></div></main>;
}

function ProblemPlayer({ problem, onComplete }: { problem: Problem; onComplete: (first: boolean, hint: boolean, retries: number) => void }) {
  const [amount, setAmount] = useState(0); const [choice, setChoice] = useState<string | null>(null); const [status, setStatus] = useState<"idle"|"try"|"correct">("idle"); const [hint, setHint] = useState(false); const [retries, setRetries] = useState(0); const [first, setFirst] = useState<boolean | null>(null); const [checkedCompare, setCheckedCompare] = useState(false);
  const m = problem.meta ?? {};
  const currentAnswer = problem.kind === "relation" ? amount / Number(m.step) : problem.kind === "cups" || problem.kind === "makeDl" || problem.kind === "makeMl" ? amount : choice;
  const check = () => { const correct = String(currentAnswer) === String(problem.answer); if (first === null) setFirst(correct); if (correct) setStatus("correct"); else { setStatus("try"); setRetries(r => r + 1); if (problem.kind === "compare") setCheckedCompare(true); } };
  const add = (n: number) => { setStatus("idle"); setAmount(v => v + n); };
  const finish = () => onComplete(first ?? true, hint, retries);
  return <div><h2 className="text-center text-2xl font-black leading-snug text-slate-800 sm:text-3xl">{problem.prompt}</h2><div className="mt-7 min-h-[280px]">{problem.kind === "compare" && <ComparePlay problem={problem} choice={choice} choose={v => { setChoice(v); setStatus("idle"); }} checked={checkedCompare}/>} {problem.kind === "cups" && <CupPlay amount={amount} target={Number(m.target)} add={() => add(1)} undo={() => setAmount(Math.max(0, amount - 1))}/>} {problem.kind === "makeMl" && <MakeMlPlay amount={amount} values={problem.values ?? []} add={add} reset={() => setAmount(0)}/>} {(problem.kind === "parts" || problem.kind === "sense" || problem.kind === "unit" || problem.kind === "calc") && <ChoicePlay problem={problem} choice={choice} choose={v => { setChoice(v); setStatus("idle"); }}/>} {problem.kind === "relation" && <RelationPlay amount={amount} target={Number(m.target)} step={Number(m.step)} label={String(m.label)} add={() => add(Number(m.step))} reset={() => setAmount(0)}/>} {problem.kind === "makeDl" && <MakeDlPlay amount={amount} addL={() => add(10)} addDl={() => add(1)} reset={() => setAmount(0)} target={`${m.liters}L ${m.dl}dL`}/>}</div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><Button variant="ghost" onClick={() => setHint(true)} className="h-12 rounded-xl px-4 text-base font-bold text-amber-700"><Lightbulb/> ヒント</Button>{status !== "correct" ? <Button onClick={check} disabled={currentAnswer === null || currentAnswer === 0} className="big-action min-w-40">たしかめる</Button> : <Button onClick={finish} className="big-action min-w-44">つぎへ <ChevronRight/></Button>}</div>{hint && <div className="hint-box mt-4"><Lightbulb className="size-5 shrink-0"/><span>{problem.hint}</span></div>}{status === "try" && <div className="try-box mt-4"><span className="font-black">おしい！</span> 水や目もりを見て、もういちどためそう。</div>}{status === "correct" && <div className="correct-box mt-4"><Check className="size-6"/><span><strong>ぴったり！</strong> {explanation(problem)}</span></div>}</div>;
}

function ComparePlay({ problem, choice, choose, checked }: { problem: Problem; choice: string|null; choose: (v: string)=>void; checked: boolean }) { const m = problem.meta!; return <div><div className="flex items-end justify-center gap-8 sm:gap-20">{["A","B"].map(k => { const amount = Number(m[k.toLowerCase()]); const shape = String(m[`shape${k}`]); return <button key={k} onClick={() => choose(k)} className={`choice-vessel ${choice === k ? "selected" : ""}`}><Vessel amount={amount} shape={shape} label={k}/></button>})}</div>{checked && <div className="mt-7 rounded-2xl bg-cyan-50 p-4"><p className="mb-3 text-center font-black text-cyan-800">おなじ形へ うつすと…</p><div className="flex items-end justify-center gap-12"><Vessel amount={Number(m.a)} label="A"/><Vessel amount={Number(m.b)} label="B"/></div></div>}</div> }
function CupPlay({ amount, target, add, undo }: { amount:number; target:number; add:()=>void; undo:()=>void }) { return <div className="grid items-center gap-6 sm:grid-cols-2"><div className="flex justify-center"><Vessel amount={amount} max={target} label={`${amount}はい分`}/></div><div className="space-y-3"><Button onClick={add} className="pour-button" disabled={amount >= target + 2}><Droplets/> コップ1はい 入れる</Button><Button variant="outline" onClick={undo} disabled={!amount} className="h-12 w-full rounded-2xl bg-white"><RotateCcw/> 1はい もどす</Button></div></div> }
function MakeMlPlay({ amount, values, add, reset }: { amount:number; values:number[]; add:(n:number)=>void; reset:()=>void }) { return <div className="grid gap-7 sm:grid-cols-[1fr_1.2fr] sm:items-center"><div className="flex justify-center"><Vessel amount={amount} max={1000} label={`${amount}mL / 1000mL`}/></div><div><div className="grid grid-cols-2 gap-3">{values.map(v => <Button key={v} onClick={() => add(v)} disabled={amount + v > 1200} className="volume-chip">+ {v}mL</Button>)}</div><Button variant="ghost" onClick={reset} className="mt-3 h-11 w-full"><RotateCcw/> からにする</Button></div></div> }
function ChoicePlay({ problem, choice, choose }: { problem:Problem; choice:string|null; choose:(v:string)=>void }) { const object = problem.meta?.object; return <div>{object && <div className={`object-cue ${object}`}><Droplets/></div>}<div className={`mx-auto grid max-w-2xl gap-3 ${problem.options?.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>{problem.options?.map(opt => <button key={opt} onClick={() => choose(opt)} className={`answer-tile ${choice === opt ? "selected" : ""}`}>{opt}</button>)}</div></div> }
function RelationPlay({ amount, target, step, label, add, reset }: { amount:number; target:number; step:number; label:string; add:()=>void; reset:()=>void }) { const count = amount / step; return <div className="grid items-center gap-6 sm:grid-cols-2"><div className="flex justify-center"><Vessel amount={amount} max={target} label={`${amount}mL`}/></div><div><div className="mb-3 flex min-h-16 flex-wrap gap-2">{Array.from({length:count}).map((_,i)=><span key={i} className="unit-block">{label}</span>)}</div><Button onClick={add} className="pour-button" disabled={amount >= target + step}>+ {label}</Button><Button variant="ghost" onClick={reset} className="mt-2 h-11 w-full"><RotateCcw/> からにする</Button></div></div> }
function MakeDlPlay({ amount, addL, addDl, reset, target }: { amount:number; addL:()=>void; addDl:()=>void; reset:()=>void; target:string }) { return <div className="grid items-center gap-6 sm:grid-cols-2"><div className="flex justify-center"><Vessel amount={amount} max={25} label={`${amount}dL`}/></div><div><p className="mb-4 text-center text-lg font-black text-indigo-700">めざす量：{target}</p><div className="grid grid-cols-2 gap-3"><Button onClick={addL} className="volume-chip">+ 1L</Button><Button onClick={addDl} className="volume-chip">+ 1dL</Button></div><Button variant="ghost" onClick={reset} className="mt-3 h-11 w-full"><RotateCcw/> からにする</Button></div></div> }
function explanation(p: Problem) { if (p.kind === "compare") return "同じ形にうつすと、かさをくらべやすいね。"; if (p.kind === "cups") return "同じコップを基準にすると、数で表せるね。"; if (p.kind === "makeMl") return "合わせて1000mL。これが1Lだね。"; if (p.kind === "parts") return p.answer === "dL" ? "dLが単位。3が数だね。" : "1が数。Lが単位だね。"; if (p.kind === "relation") return p.answer === 10 ? "1dLが10こで1L。" : "100mLと1dLは同じ量。"; if (p.kind === "makeDl") return `LをdLになおすと${p.answer}dL。`; if (p.kind === "sense") return `${p.answer}が、この量に合うね。`; if (p.kind === "unit") return `${p.answer}で表すのが自然だね。`; if (p.kind === "calc") return `同じ単位どうしで計算すると、${p.answer}。`; return "量に合う考え方ができたね。"; }

function ProgressScreen({ save, onBack, onClear }: { save:SaveData; onBack:()=>void; onClear:()=>void }) {
  const stats = useMemo(() => (Object.keys(skillNames) as SkillId[]).map(id => { const a = save.attempts.filter(x => x.skillId === id); const clean = a.filter(x => x.firstCorrect && !x.hintUsed).length; const score = a.length ? Math.round(clean / a.length * 100) : null; return { id, count:a.length, score }; }), [save]);
  const weak = stats.filter(s => s.count && (s.score ?? 0) < 70);
  return <main className="min-h-dvh"><Header onHome={onBack}/><div className="mx-auto max-w-4xl px-5 pb-16 sm:px-8"><Button variant="ghost" onClick={onBack} className="h-12 rounded-xl"><ArrowLeft/> もどる</Button><div className="mt-4 flex items-end justify-between"><div><p className="eyebrow">おうちの人と見る</p><h1 className="mt-1 text-3xl font-black">まなびの きろく</h1></div><span className="text-lg font-black text-cyan-700">{save.completedStages.length}/9 完了</span></div><div className="mt-7 grid gap-3 sm:grid-cols-2">{stats.map(s => <div key={s.id} className="rounded-2xl border border-white bg-white/75 p-4 shadow-sm"><div className="flex justify-between gap-3"><strong>{skillNames[s.id]}</strong><span className="font-black text-slate-500">{s.score === null ? "まだ" : `${s.score}%`}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{width:`${s.score ?? 0}%`}}/></div><p className="mt-2 text-xs font-bold text-slate-400">記録 {s.count}回</p></div>)}</div><section className="mt-6 rounded-3xl bg-slate-800 p-6 text-white"><h2 className="text-xl font-black">つぎの復習候補</h2><p className="mt-2 text-slate-300">初回正解・ヒント・再挑戦を合わせて見ています。</p><div className="mt-4 flex flex-wrap gap-2">{weak.length ? weak.map(s => <span key={s.id} className="rounded-full bg-white/10 px-4 py-2 font-bold">{skillNames[s.id]}</span>) : <span className="rounded-full bg-emerald-400/20 px-4 py-2 font-bold text-emerald-200">いまは記録をためているところ</span>}</div></section><Button variant="ghost" onClick={onClear} className="mt-8 text-slate-400">このたんまつの記録を消す</Button></div></main>;
}

export default CapacityApp;
