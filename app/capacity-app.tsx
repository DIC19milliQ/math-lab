"use client";

import { useEffect, useMemo, useState } from "react";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left.mjs";
import BarChart3 from "lucide-react/dist/esm/icons/chart-no-axes-column.mjs";
import Check from "lucide-react/dist/esm/icons/check.mjs";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right.mjs";
import Droplets from "lucide-react/dist/esm/icons/droplets.mjs";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical.mjs";
import Info from "lucide-react/dist/esm/icons/info.mjs";
import Lightbulb from "lucide-react/dist/esm/icons/lightbulb.mjs";
import LockKeyhole from "lucide-react/dist/esm/icons/lock-keyhole.mjs";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw.mjs";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.mjs";
import { Button } from "@/components/ui/button";
import { stages, skillNames, vessels, type Problem, type SkillId, type Stage, type VesselId } from "./capacity-data";

type Attempt = { problemId: string; unitId: string; stageId: string; skillId: SkillId; firstCorrect: boolean; hintUsed: boolean; retries: number; completed: boolean; lastResult: boolean; playedAt: string };
type SaveData = { version: 2; attempts: Attempt[]; completedStages: string[]; lastPlayed?: { unitId: string; stageId: string; problemId: string; at: string } };
type View = "home" | "stages" | "learn" | "progress";
const STORAGE_KEY = "math-lab-progress-v1";
const EMPTY: SaveData = { version: 2, attempts: [], completedStages: [] };
const LEGACY_CAPACITY_STAGES = new Set(["compare", "measure", "make-1l", "number-unit", "three-units", "relations", "natural-unit", "make-capacity", "calculate"]);

function migrateSave(raw: unknown): SaveData {
  if (!raw || typeof raw !== "object") return EMPTY;
  const old = raw as Partial<SaveData> & { version?: number };
  if (old.version === 2 && Array.isArray(old.attempts) && Array.isArray(old.completedStages)) return old as SaveData;
  const attempts = Array.isArray(old.attempts) ? old.attempts.filter(attempt => attempt?.unitId !== "capacity") : [];
  const completedStages = Array.isArray(old.completedStages) ? old.completedStages.filter(id => !LEGACY_CAPACITY_STAGES.has(id)) : [];
  return { version: 2, attempts, completedStages };
}

function Vessel({ amountMl, vesselId, label, marks = 0, maxMl }: { amountMl: number; vesselId?: VesselId; label?: string; marks?: number; maxMl?: number }) {
  const spec = vesselId ? vessels[vesselId] : { capacityMl: maxMl ?? 1000, width: 120, height: 190, label: "入れもの" };
  const capacity = maxMl ?? spec.capacityMl;
  const fill = Math.max(0, Math.min(100, amountMl / capacity * 100));
  return <div className="vessel-wrap">
    <div className="vessel" style={{ width: `min(${spec.width}px, 30vw)`, height: spec.height }} aria-label={`${label ?? spec.label}、${Math.round(fill)}パーセント`}>
      {marks > 1 && <div className="measure-marks" aria-hidden="true">{Array.from({ length: marks - 1 }, (_, i) => <i key={i} style={{ bottom: `${(i + 1) / marks * 100}%` }} />)}</div>}
      <div className="water" style={{ height: `${fill}%` }} /><div className="shine" />
    </div>
    <strong className="vessel-label">{label ?? spec.label}</strong>
  </div>;
}

function CapacityApp() {
  const [view, setView] = useState<View>("home");
  const [activeStage, setActiveStage] = useState<Stage>(stages[0]);
  const [problemIndex, setProblemIndex] = useState(0);
  const [save, setSave] = useState<SaveData>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => { queueMicrotask(() => { try { const raw = localStorage.getItem(STORAGE_KEY); if (raw) setSave(migrateSave(JSON.parse(raw))); } catch { setSave(EMPTY); } setReady(true); }); }, []);
  useEffect(() => { if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(save)); }, [save, ready]);
  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: { signal: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const life = new AbortController();
    void Promise.resolve(context.registerTool({ name: "start_capacity_stage", title: "かさのステージを始める", description: "指定した1〜10のステージを画面で開始します。", inputSchema: { type: "object", properties: { stageNumber: { type: "integer", minimum: 1, maximum: 10 } }, required: ["stageNumber"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute: (input: unknown) => { const n = Number((input as { stageNumber?: number })?.stageNumber); const found = stages.find(s => s.number === n); if (!found) throw new Error("stageNumber must be 1 to 10"); setActiveStage(found); setProblemIndex(0); setView("learn"); return { opened: true, stageId: found.id, title: found.title }; } }, { signal: life.signal })).catch(() => {});
    return () => life.abort();
  }, []);

  const startStage = (stage: Stage) => { setActiveStage(stage); setProblemIndex(0); setView("learn"); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const completeProblem = (firstCorrect: boolean, hintUsed: boolean, retries: number) => {
    const problem = activeStage.problems[problemIndex]; const playedAt = new Date().toISOString();
    const attempt: Attempt = { problemId: problem.problemId, unitId: problem.unitId, stageId: problem.stageId, skillId: problem.skillId, firstCorrect, hintUsed, retries, completed: true, lastResult: true, playedAt };
    setSave(prev => ({ ...prev, attempts: [...prev.attempts, attempt], lastPlayed: { unitId: problem.unitId, stageId: problem.stageId, problemId: problem.problemId, at: playedAt }, completedStages: problemIndex === activeStage.problems.length - 1 ? [...new Set([...prev.completedStages, activeStage.id])] : prev.completedStages }));
    if (problemIndex < activeStage.problems.length - 1) { setProblemIndex(i => i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else setView("stages");
  };
  const clearProgress = () => { if (confirm("このたんまつの かさのきろくを けしますか？")) setSave(prev => ({ ...EMPTY, attempts: prev.attempts.filter(x => x.unitId !== "capacity") })); };

  if (view === "home") return <HomeScreen save={save} onStart={() => setView("stages")} onProgress={() => setView("progress")} />;
  if (view === "progress") return <ProgressScreen save={save} onBack={() => setView("home")} onClear={clearProgress} />;
  if (view === "stages") return <StageScreen save={save} onHome={() => setView("home")} onStart={startStage} onProgress={() => setView("progress")} />;
  return <LessonShell stage={activeStage} index={problemIndex} total={activeStage.problems.length} onBack={() => setView("stages")}><ProblemPlayer key={activeStage.problems[problemIndex].problemId} problem={activeStage.problems[problemIndex]} onComplete={completeProblem} /></LessonShell>;
}

function Header({ onHome, onProgress }: { onHome: () => void; onProgress?: () => void }) {
  return <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5"><button onClick={onHome} className="flex min-h-12 items-center gap-3 rounded-2xl px-2 text-left"><span className="grid size-11 place-items-center rounded-2xl bg-cyan-600 text-white shadow-sm"><FlaskConical /></span><span><span className="eyebrow block">MATH LAB</span><strong className="text-lg">算数ラボ</strong></span></button>{onProgress && <Button variant="outline" onClick={onProgress} className="h-12 rounded-2xl bg-white/70 px-4 text-base font-bold"><BarChart3 /> きろく</Button>}</header>;
}

function HomeScreen({ save, onStart, onProgress }: { save: SaveData; onStart: () => void; onProgress: () => void }) {
  const done = stages.filter(stage => save.completedStages.includes(stage.id)).length; const pct = Math.round(done / stages.length * 100);
  return <main className="min-h-dvh"><Header onHome={() => {}} onProgress={onProgress} /><div className="mx-auto max-w-6xl px-5 pb-12 sm:px-8"><section className="mt-5 grid gap-8 lg:grid-cols-[1.25fr_.75fr] lg:items-center"><div><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 font-bold text-cyan-800"><Sparkles className="size-5" /> 見る → ためす → 気づく</div><h1 className="text-balance text-4xl font-black leading-[1.15] tracking-tight text-slate-800 sm:text-6xl">水のりょうには、<br/><span className="text-cyan-600">ひみつ</span>がある。</h1><p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-slate-600">うつしてくらべ、同じもので測り、単位のつながりを作って見つけよう。</p></div><div className="lab-card relative overflow-hidden p-6 sm:p-8"><div className="absolute -right-10 -top-10 size-36 rounded-full bg-cyan-100/80"/><Droplets className="relative size-10 text-cyan-600"/><p className="relative mt-4 text-sm font-extrabold tracking-widest text-cyan-700">いま できる じっけん</p><h2 className="relative mt-1 text-4xl font-black">かさ</h2><div className="relative mt-4 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500 transition-all" style={{ width: `${pct}%` }}/></div><p className="relative mt-2 font-bold text-slate-500">{done} / {stages.length} ステージ</p><Button onClick={onStart} className="big-action relative mt-7 w-full">{pct ? "つづきから" : "はじめる"}<ChevronRight /></Button></div></section><section className="mt-12"><p className="mb-4 text-sm font-extrabold tracking-widest text-slate-500">これから ふえる じっけん</p><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{["とけい", "ながさ", "かけ算", "図形"].map(name => <div key={name} className="flex min-h-24 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/55 p-4 text-slate-500"><span className="font-bold">{name}</span><LockKeyhole className="size-4"/></div>)}</div></section></div></main>;
}

function StageScreen({ save, onHome, onStart, onProgress }: { save: SaveData; onHome: () => void; onStart: (s: Stage) => void; onProgress: () => void }) {
  const doneCount = stages.filter(s => save.completedStages.includes(s.id)).length;
  return <main className="min-h-dvh"><Header onHome={onHome} onProgress={onProgress}/><div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8"><div className="mt-4 flex items-end justify-between gap-4"><div><p className="eyebrow">かさの じっけん</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">じゅんばんに 見つけよう</h1></div><span className="whitespace-nowrap font-black text-cyan-700">{doneCount} / {stages.length}</span></div><div className="learning-path mt-7">{stages.map((stage, index) => { const done = save.completedStages.includes(stage.id); const unlocked = index === 0 || save.completedStages.includes(stages[index - 1].id) || done; return <article key={stage.id} className={`stage-card ${!unlocked ? "locked" : ""}`} style={{ "--stage": stage.color } as React.CSSProperties}><div className="flex items-start justify-between gap-3"><span className="stage-number">{done ? <Check/> : unlocked ? stage.number : <LockKeyhole className="size-5"/>}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{stage.phase} ・ {stage.problems.length}こ</span></div><h2 className="mt-4 text-xl font-black">{stage.title}</h2><p className="mt-2 font-medium leading-relaxed text-slate-500">{stage.short}</p><p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm font-bold leading-relaxed text-slate-600"><span className="text-slate-400">見つけること：</span>{stage.objective}</p><button disabled={!unlocked} onClick={() => onStart(stage)} className="stage-start mt-4" style={{ color: stage.color }}>{done ? "もういちど" : unlocked ? "はじめる" : "前のステージから"}<ChevronRight className="size-5"/></button></article>})}</div></div></main>;
}

function LessonShell({ stage, index, total, onBack, children }: { stage: Stage; index: number; total: number; onBack: () => void; children: React.ReactNode }) {
  return <main className="min-h-dvh"><div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-4 sm:px-8"><Button variant="outline" onClick={onBack} className="size-12 shrink-0 rounded-2xl bg-white/80" aria-label="ステージ一覧へ"><ArrowLeft/></Button><div className="min-w-0 flex-1"><div className="flex justify-between gap-3 text-sm font-black text-slate-500"><span className="truncate">STAGE {stage.number} ・ {stage.phase}</span><span>{index + 1} / {total}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full transition-all" style={{ width: `${(index + 1) / total * 100}%`, background: stage.color }}/></div></div></div><div className="mx-auto max-w-5xl px-4 pb-10 sm:px-8"><section className="lesson-card"><div className="flex flex-wrap items-center justify-between gap-2"><p className="eyebrow">{skillNames[stage.skillId]}</p><span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-black text-cyan-700">{stage.problems[index].learningPhase}</span></div><h1 className="mt-1 text-3xl font-black sm:text-4xl">{stage.title}</h1><details className="learning-contract mt-4"><summary><Info className="size-4"/> このステージで わかること</summary><div><p><strong>まえに分かっていること：</strong>{stage.prerequisite}</p><p><strong>できた！のめやす：</strong>{stage.mastery}</p></div></details><div className="mt-6">{children}</div></section></div></main>;
}

function ProblemPlayer({ problem, onComplete }: { problem: Problem; onComplete: (first: boolean, hint: boolean, retries: number) => void }) {
  const [amount, setAmount] = useState(problem.kind === "numberUnit" && problem.meta?.showReady ? Number(problem.meta.count) : 0);
  const [choice, setChoice] = useState<string | null>(null); const [status, setStatus] = useState<"idle"|"try"|"correct">("idle");
  const [hint, setHint] = useState(false); const [retries, setRetries] = useState(0); const [first, setFirst] = useState<boolean | null>(null);
  const [transferred, setTransferred] = useState(false); const [explored, setExplored] = useState<string[]>([]);
  const m = problem.meta ?? {};
  const interactiveAnswer = problem.kind === "cups" || problem.kind === "relation" || problem.kind === "numberUnit" && !problem.options ? amount : problem.kind === "compose" ? amount : problem.kind === "unitExplore" && m.exploreAll ? (explored.length === 3 ? "見た" : null) : choice;
  const needsAction = problem.kind === "compare" && Boolean(m.transfer) ? transferred : problem.kind === "standardNeed" ? amount === 1 : true;
  const canCheck = interactiveAnswer !== null && interactiveAnswer !== 0 && needsAction;
  const choose = (value: string) => { setChoice(value); setStatus("idle"); };
  const add = (value: number, maximum?: number) => { setStatus("idle"); setAmount(current => maximum === undefined ? current + value : Math.min(maximum, current + value)); };
  const check = () => { const correct = String(interactiveAnswer) === String(problem.answer); if (first === null) setFirst(correct); if (correct) setStatus("correct"); else { setStatus("try"); setRetries(r => r + 1); } };
  return <div><h2 className="text-center text-2xl font-black leading-snug text-slate-800 sm:text-3xl">{problem.prompt}</h2><div className="mt-7 min-h-[280px]">
    {problem.kind === "compare" && <ComparePlay problem={problem} choice={choice} choose={choose} transferred={transferred} transfer={() => setTransferred(true)}/>}
    {problem.kind === "cups" && <CupPlay problem={problem} count={amount} add={() => add(1, Number(problem.answer))} undo={() => setAmount(Math.max(0, amount - 1))}/>}
    {problem.kind === "standardNeed" && <StandardNeedPlay problem={problem} revealed={amount === 1} reveal={() => setAmount(1)} choice={choice} choose={choose}/>}
    {problem.kind === "unitExplore" && <UnitExplorePlay problem={problem} explored={explored} explore={unit => setExplored(old => old.includes(unit) ? old : [...old, unit])} choice={choice} choose={choose}/>}
    {problem.kind === "numberUnit" && <NumberUnitPlay problem={problem} count={amount} add={() => add(1, Number(m.count))} choice={choice} choose={choose}/>}
    {problem.kind === "relation" && <RelationPlay problem={problem} count={amount} add={() => add(1, Number(problem.answer))} reset={() => setAmount(0)}/>}
    {problem.kind === "compose" && <ComposePlay problem={problem} amount={amount} add={n => add(n, Number(m.targetMl) + Math.max(...(problem.pours ?? []).map(x => x.ml)))} reset={() => setAmount(0)}/>}
    {problem.kind === "unitSense" && <UnitSensePlay problem={problem} choice={choice} choose={choose}/>}
    {problem.kind === "choice" && <ChoicePlay problem={problem} choice={choice} choose={choose}/>}
  </div><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><Button variant="ghost" onClick={() => setHint(true)} className="h-12 rounded-xl px-4 text-base font-bold text-amber-700"><Lightbulb/> ヒント</Button>{status !== "correct" ? <Button onClick={check} disabled={!canCheck} className="big-action min-w-40">たしかめる</Button> : <Button onClick={() => onComplete(first ?? true, hint, retries)} className="big-action min-w-44">つぎへ <ChevronRight/></Button>}</div>
  {hint && <div className="hint-box mt-4"><Lightbulb className="size-5 shrink-0"/><span>{problem.hint}</span></div>}
  {status === "try" && <div className="try-box mt-4"><span><strong>もう一度 ためそう。</strong> {retryGuide(problem)}</span></div>}
  {status === "correct" && <div className="correct-box mt-4"><Check className="size-6 shrink-0"/><span><strong>わかった！</strong> {problem.explanation}</span></div>}
  </div>;
}

function ComparePlay({ problem, choice, choose, transferred, transfer }: { problem: Problem; choice: string|null; choose: (v:string)=>void; transferred:boolean; transfer:()=>void }) {
  const m = problem.meta!; const items = (["A", "B"] as const);
  return <div><p className="action-prompt">① まず予想して AかBをえらぼう</p><div className="flex items-end justify-center gap-3 sm:gap-16">{items.map(key => <button key={key} onClick={() => choose(key)} className={`choice-vessel ${choice === key ? "selected" : ""}`}><Vessel amountMl={Number(m[key.toLowerCase()])} vesselId={String(m[`vessel${key}`]) as VesselId} label={key}/></button>)}</div>{Boolean(m.transfer) && <div className="mt-5 text-center"><Button onClick={transfer} disabled={!choice || transferred} className="pour-button max-w-sm"><Droplets/> ② 同じ形に うつす</Button></div>}{transferred && <div className="transfer-result"><p>③ 同じ形で 水面を見よう</p><div className="flex items-end justify-center gap-8"><Vessel amountMl={Number(m.a)} vesselId="compare-cylinder" label="A"/><Vessel amountMl={Number(m.b)} vesselId="compare-cylinder" label="B"/></div></div>}</div>;
}
function CupPlay({ problem, count, add, undo }: { problem:Problem; count:number; add:()=>void; undo:()=>void }) {
  const target = Number(problem.answer); const vesselId = String(problem.meta?.vessel) as VesselId;
  return <div className="grid items-center gap-7 sm:grid-cols-[.8fr_1.2fr]"><div className="reference-card"><p>これを いつも使うよ</p><Vessel amountMl={100} vesselId="reference-cup" label="きじゅんコップ 1ぱい"/></div><div className="flex flex-col items-center"><Vessel amountMl={count * 100} vesselId={vesselId} marks={target} label={`${vessels[vesselId].label}：${count}はい`}/><div className="mt-4 grid w-full max-w-sm grid-cols-2 gap-3"><Button onClick={add} disabled={count >= target} className="pour-button"><Droplets/> 1ぱい入れる</Button><Button variant="outline" onClick={undo} disabled={!count} className="h-14 rounded-2xl bg-white"><RotateCcw/> 1ぱいもどす</Button></div><p className="mt-3 text-sm font-bold text-slate-500">線1つぶん ＝ コップ1ぱい</p></div></div>;
}
function StandardNeedPlay({ problem, revealed, reveal, choice, choose }: { problem:Problem; revealed:boolean; reveal:()=>void; choice:string|null; choose:(v:string)=>void }) {
  const small = Number(problem.meta?.smallCup); const large = Number(problem.meta?.largeCup); const count = Number(problem.meta?.count);
  return <div><div className="flex items-end justify-center gap-10"><MiniCup size="small" label={`小さいコップ × ${count}`}/><MiniCup size="large" label={`大きいコップ × ${count}`}/></div><div className="my-5 text-center"><Button onClick={reveal} disabled={revealed} className="pour-button max-w-sm"><Droplets/> 両方を 同じ入れものへ</Button></div>{revealed && <div className="transfer-result"><div className="flex items-end justify-center gap-8"><Vessel amountMl={small * count} maxMl={600} label="小さいコップ4はい"/><Vessel amountMl={large * count} maxMl={600} label="大きいコップ4はい"/></div><ChoiceTiles options={problem.options ?? []} choice={choice} choose={choose}/></div>}</div>;
}
function MiniCup({ size, label }: { size:"small"|"large"; label:string }) { return <div className="text-center"><div className={`mini-cup ${size}`}><div className="water h-full"/></div><strong className="mt-2 block text-sm text-slate-600">{label}</strong></div>; }
function UnitExplorePlay({ problem, explored, explore, choice, choose }: { problem:Problem; explored:string[]; explore:(u:string)=>void; choice:string|null; choose:(v:string)=>void }) {
  const samples = [{ unit:"1L", name:"牛乳パックくらい", level:100 }, { unit:"1dL", name:"小さいコップくらい", level:42 }, { unit:"1mL", name:"スポイトで量るくらい", level:12 }];
  return <div><div className="unit-samples">{samples.map(sample => <button key={sample.unit} onClick={() => { explore(sample.unit); if (!problem.meta?.exploreAll) choose(sample.unit); }} className={`unit-sample ${explored.includes(sample.unit) || choice === sample.unit ? "seen" : ""}`}><div className="sample-liquid" style={{ height: sample.level }}/><strong>{sample.unit}</strong><span>{sample.name}</span></button>)}</div>{problem.meta?.exploreAll && <p className="mt-4 text-center font-bold text-slate-500">{explored.length} / 3 さわった</p>}</div>;
}
function NumberUnitPlay({ problem, count, add, choice, choose }: { problem:Problem; count:number; add:()=>void; choice:string|null; choose:(v:string)=>void }) {
  const target = Number(problem.meta?.count); const unit = String(problem.meta?.unit);
  return <div><div className="unit-blocks">{Array.from({length: count}, (_, i) => <div className="unit-cup" key={i}><Droplets/><strong>1{unit}</strong></div>)}</div>{!problem.meta?.showReady && <div className="mt-5 text-center"><Button onClick={add} disabled={count >= target} className="pour-button max-w-sm">+ 1{unit}を1こ</Button></div>}{count === target && <div className="number-unit-equation"><span className="number-part">{count}<small>いくつ分</small></span><span className="unit-part">{unit}<small>かさの単位</small></span></div>}{problem.options && <ChoiceTiles options={problem.options} choice={choice} choose={choose}/>}</div>;
}
function RelationPlay({ problem, count, add, reset }: { problem:Problem; count:number; add:()=>void; reset:()=>void }) {
  const stepMl = Number(problem.meta?.stepMl); const targetMl = Number(problem.meta?.targetMl); const label = String(problem.meta?.stepLabel); const target = String(problem.meta?.targetLabel);
  return <div className="grid items-center gap-6 sm:grid-cols-2"><div className="flex justify-center"><Vessel amountMl={count * stepMl} maxMl={targetMl} marks={Number(problem.answer)} label={`${target}の入れもの`}/></div><div><div className="unit-blocks compact">{Array.from({length:count},(_,i)=><span className="unit-block" key={i}>{label}</span>)}</div><p className="my-3 text-center text-lg font-black text-emerald-700">{label} × {count}</p><Button onClick={add} disabled={count >= Number(problem.answer)} className="pour-button">+ {label}</Button><Button variant="ghost" onClick={reset} disabled={!count} className="mt-2 h-11 w-full"><RotateCcw/> からにする</Button></div></div>;
}
function ComposePlay({ problem, amount, add, reset }: { problem:Problem; amount:number; add:(n:number)=>void; reset:()=>void }) {
  const target = Number(problem.meta?.targetMl); return <div className="grid gap-7 sm:grid-cols-[1fr_1.2fr] sm:items-center"><div className="flex justify-center"><Vessel amountMl={amount} maxMl={target} label={`いま ${displayAmount(amount)} / めざす ${problem.meta?.targetLabel}`}/></div><div><div className="grid grid-cols-2 gap-3">{problem.pours?.map(pour => <Button key={pour.label} onClick={() => add(pour.ml)} disabled={amount + pour.ml > target} className="volume-chip">+ {pour.label}</Button>)}</div><div className="mt-4 rounded-2xl bg-indigo-50 p-4 text-center"><span className="block text-sm font-bold text-indigo-500">入れた量</span><strong className="text-2xl text-indigo-800">{displayAmount(amount)}</strong></div><Button variant="ghost" onClick={reset} disabled={!amount} className="mt-2 h-11 w-full"><RotateCcw/> からにする</Button></div></div>;
}
function UnitSensePlay({ problem, choice, choose }: { problem:Problem; choice:string|null; choose:(v:string)=>void }) {
  return <div><div className="sense-board"><div className={`object-shape ${problem.meta?.object}`} aria-hidden="true"><Droplets/></div><div><span className="text-sm font-black text-slate-500">このくらいの量</span><strong className="block text-4xl">{problem.meta?.amountText}</strong></div><div className="scale-compare"><span>スプーン</span><i style={{width:"8%"}}/><span>コップ</span><i style={{width:"32%"}}/><span>パック</span><i style={{width:"62%"}}/><span>浴そう</span><i style={{width:"100%"}}/></div></div><ChoiceTiles options={problem.options ?? []} choice={choice} choose={choose}/></div>;
}
function ChoicePlay({ problem, choice, choose }: { problem:Problem; choice:string|null; choose:(v:string)=>void }) { return <ChoiceTiles options={problem.options ?? []} choice={choice} choose={choose}/>; }
function ChoiceTiles({ options, choice, choose }: { options:string[]; choice:string|null; choose:(v:string)=>void }) { return <div className={`choice-grid ${options.length === 2 ? "two" : ""}`}>{options.map(option => <button key={option} onClick={() => choose(option)} className={`answer-tile ${choice === option ? "selected" : ""}`}>{option}</button>)}</div>; }
function displayAmount(ml:number) { if (!ml) return "0"; if (ml >= 1000 && ml % 100 === 0) { const liters = Math.floor(ml / 1000); const dl = ml % 1000 / 100; return dl ? `${liters}L ${dl}dL` : `${liters}L`; } return `${ml}mL`; }
function retryGuide(problem:Problem) { if (problem.kind === "compare") return "同じ形にうつした水面を、もう一度ならべて見よう。"; if (problem.kind === "unitSense") return "下の量くらべで、ものの大きさがどこに近いか見よう。"; if (problem.kind === "choice" && problem.skillId === "calculate") return "LとdLを分け、同じ単位どうしで考えよう。"; return problem.hint; }

function ProgressScreen({ save, onBack, onClear }: { save:SaveData; onBack:()=>void; onClear:()=>void }) {
  const stats = useMemo(() => (Object.keys(skillNames) as SkillId[]).map(id => { const attempts = save.attempts.filter(x => x.skillId === id); const clean = attempts.filter(x => x.firstCorrect && !x.hintUsed).length; return { id, count:attempts.length, score:attempts.length ? Math.round(clean / attempts.length * 100) : null }; }), [save]);
  const weak = stats.filter(s => s.count && (s.score ?? 0) < 70); const done = stages.filter(s => save.completedStages.includes(s.id)).length;
  return <main className="min-h-dvh"><Header onHome={onBack}/><div className="mx-auto max-w-4xl px-5 pb-16 sm:px-8"><Button variant="ghost" onClick={onBack} className="h-12 rounded-xl"><ArrowLeft/> もどる</Button><div className="mt-4 flex items-end justify-between gap-3"><div><p className="eyebrow">おうちの人と見る</p><h1 className="mt-1 text-3xl font-black">まなびの きろく</h1></div><span className="whitespace-nowrap text-lg font-black text-cyan-700">{done}/{stages.length} 完了</span></div><div className="mt-7 grid gap-3 sm:grid-cols-2">{stats.map(s => <div key={s.id} className="rounded-2xl border border-white bg-white/75 p-4 shadow-sm"><div className="flex justify-between gap-3"><strong>{skillNames[s.id]}</strong><span className="font-black text-slate-500">{s.score === null ? "まだ" : `${s.score}%`}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-cyan-500" style={{width:`${s.score ?? 0}%`}}/></div><p className="mt-2 text-xs font-bold text-slate-400">記録 {s.count}回</p></div>)}</div><section className="mt-6 rounded-3xl bg-slate-800 p-6 text-white"><h2 className="text-xl font-black">つぎの復習候補</h2><p className="mt-2 text-slate-300">初回正解・ヒント・再挑戦を合わせて見ています。</p><div className="mt-4 flex flex-wrap gap-2">{weak.length ? weak.map(s => <span key={s.id} className="rounded-full bg-white/10 px-4 py-2 font-bold">{skillNames[s.id]}</span>) : <span className="rounded-full bg-emerald-400/20 px-4 py-2 font-bold text-emerald-200">いまは記録をためているところ</span>}</div></section><Button variant="ghost" onClick={onClear} className="mt-8 text-slate-400">かさの記録を消す</Button></div></main>;
}

export default CapacityApp;
