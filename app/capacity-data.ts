export type SkillId = "compare" | "measure" | "compose" | "numberUnit" | "sense" | "relation" | "unitChoice" | "convert" | "calculate";

export type Problem = {
  problemId: string;
  unitId: "capacity";
  stageId: string;
  skillId: SkillId;
  prompt: string;
  hint: string;
  kind: "compare" | "cups" | "makeMl" | "parts" | "sense" | "relation" | "unit" | "makeDl" | "calc";
  answer: string | number;
  options?: string[];
  values?: number[];
  meta?: Record<string, number | string>;
};

export type Stage = {
  id: string;
  number: number;
  phase: "ためす" | "気づく" | "ミッション" | "わかった？" | "チャレンジ";
  title: string;
  short: string;
  skillId: SkillId;
  color: string;
  problems: Problem[];
};

const p = (problem: Omit<Problem, "unitId">): Problem => ({ ...problem, unitId: "capacity" });

export const skillNames: Record<SkillId, string> = {
  compare: "量のくらべ方", measure: "同じ基準で測る", compose: "量を組み合わせる", numberUnit: "数と単位",
  sense: "1L・1dL・1mLの量感", relation: "単位の関係", unitChoice: "単位をえらぶ", convert: "LとdLのつながり", calculate: "かさの計算",
};

export const stages: Stage[] = [
  { id: "compare", number: 1, phase: "ためす", title: "どっちが多い？", short: "形にまどわされず、うつしてくらべる", skillId: "compare", color: "#0ea5e9", problems: [
    p({ problemId: "cap-compare-01", stageId: "compare", skillId: "compare", kind: "compare", prompt: "どちらの 水が 多い？", hint: "おなじ形の ものさしコップに うつすと くらべられるよ。", answer: "B", meta: { a: 620, b: 760, shapeA: "wide", shapeB: "narrow" } }),
    p({ problemId: "cap-compare-02", stageId: "compare", skillId: "compare", kind: "compare", prompt: "こんどは どちらが 多い？", hint: "水の高さだけでなく、ようきの太さも見てみよう。", answer: "A", meta: { a: 840, b: 700, shapeA: "wide", shapeB: "narrow" } }),
  ]},
  { id: "measure", number: 2, phase: "気づく", title: "同じもの何杯分？", short: "同じコップをくり返して測る", skillId: "measure", color: "#14b8a6", problems: [
    p({ problemId: "cap-measure-01", stageId: "measure", skillId: "measure", kind: "cups", prompt: "コップ 4はい分に しよう", hint: "おなじコップを、あと何回入れればいいかな。", answer: 4, meta: { target: 4 } }),
    p({ problemId: "cap-measure-02", stageId: "measure", skillId: "measure", kind: "cups", prompt: "コップ 6はい分に しよう", hint: "1回入れるたびに、目もりが1つ上がるよ。", answer: 6, meta: { target: 6 } }),
  ]},
  { id: "make-1l", number: 3, phase: "ミッション", title: "1Lを作ろう", short: "小さい量を組み合わせて1000mL", skillId: "compose", color: "#06b6d4", problems: [
    p({ problemId: "cap-compose-01", stageId: "make-1l", skillId: "compose", kind: "makeMl", prompt: "ちょうど 1Lを 作ろう", hint: "1Lは1000mL。いま何mLかを見ながら足そう。", answer: 1000, values: [100, 200, 300, 500] }),
    p({ problemId: "cap-compose-02", stageId: "make-1l", skillId: "compose", kind: "makeMl", prompt: "べつの入れ方で 1Lを 作ろう", hint: "500mLを使わない作り方もあるよ。", answer: 1000, values: [100, 200, 300] }),
  ]},
  { id: "number-unit", number: 4, phase: "気づく", title: "数字と単位", short: "数と、ものさしの名前を分ける", skillId: "numberUnit", color: "#8b5cf6", problems: [
    p({ problemId: "cap-parts-01", stageId: "number-unit", skillId: "numberUnit", kind: "parts", prompt: "『どれだけ』を あらわす 数をタップ", hint: "1Lのうち、数えているところはどっち？", answer: "1", options: ["1", "L"] }),
    p({ problemId: "cap-parts-02", stageId: "number-unit", skillId: "numberUnit", kind: "parts", prompt: "『はかるものさし』の 名前をタップ", hint: "dLは、かさをはかる単位の名前だよ。", answer: "dL", options: ["3", "dL"] }),
  ]},
  { id: "three-units", number: 5, phase: "ためす", title: "L・dL・mL", short: "3つの単位の大きさを感じる", skillId: "sense", color: "#f59e0b", problems: [
    p({ problemId: "cap-sense-01", stageId: "three-units", skillId: "sense", kind: "sense", prompt: "1Lと おなじ量は どれ？", hint: "大きなピッチャー1つ分くらい。", answer: "1000mL", options: ["1mL", "100mL", "1000mL"] }),
    p({ problemId: "cap-sense-02", stageId: "three-units", skillId: "sense", kind: "sense", prompt: "スプーンの先の ひとしずくに 近いのは？", hint: "いちばん小さい単位をえらぼう。", answer: "1mL", options: ["1L", "1dL", "1mL"] }),
  ]},
  { id: "relations", number: 6, phase: "気づく", title: "単位のつながり", short: "小さい量を集めて式を完成", skillId: "relation", color: "#10b981", problems: [
    p({ problemId: "cap-relation-01", stageId: "relations", skillId: "relation", kind: "relation", prompt: "1dLずつ入れて 1Lを 作ろう", hint: "1dLを10こ集めると、1Lになるよ。", answer: 10, meta: { step: 100, label: "1dL", target: 1000 } }),
    p({ problemId: "cap-relation-02", stageId: "relations", skillId: "relation", kind: "relation", prompt: "100mLずつ入れて 1dLを 作ろう", hint: "1dLと100mLは同じ量。", answer: 1, meta: { step: 100, label: "100mL", target: 100 } }),
  ]},
  { id: "natural-unit", number: 7, phase: "わかった？", title: "どの単位が自然？", short: "量に合う単位を選ぶ", skillId: "unitChoice", color: "#f97316", problems: [
    p({ problemId: "cap-unit-01", stageId: "natural-unit", skillId: "unitChoice", kind: "unit", prompt: "おふろの 水を はかるなら？", hint: "とてもたくさんの水に合う単位は？", answer: "L", options: ["L", "dL", "mL"], meta: { object: "bath" } }),
    p({ problemId: "cap-unit-02", stageId: "natural-unit", skillId: "unitChoice", kind: "unit", prompt: "目ぐすり 1てきを はかるなら？", hint: "ほんの少しの液に合う単位は？", answer: "mL", options: ["L", "dL", "mL"], meta: { object: "drop" } }),
  ]},
  { id: "make-capacity", number: 8, phase: "ミッション", title: "かさを作る", short: "LとdLを組み合わせる", skillId: "convert", color: "#6366f1", problems: [
    p({ problemId: "cap-convert-01", stageId: "make-capacity", skillId: "convert", kind: "makeDl", prompt: "1L 3dLを 作ろう", hint: "1Lは10dL。ぜんぶで何dLになるかな。", answer: 13, meta: { liters: 1, dl: 3 } }),
    p({ problemId: "cap-convert-02", stageId: "make-capacity", skillId: "convert", kind: "makeDl", prompt: "2L 1dLを 作ろう", hint: "2Lは20dL。そこに1dLを足そう。", answer: 21, meta: { liters: 2, dl: 1 } }),
  ]},
  { id: "calculate", number: 9, phase: "チャレンジ", title: "かさの計算", short: "同じ単位をそろえて考える", skillId: "calculate", color: "#ec4899", problems: [
    p({ problemId: "cap-calc-01", stageId: "calculate", skillId: "calculate", kind: "calc", prompt: "1L 2dL + 3dL は？", hint: "Lはそのまま。dLどうしを足そう。", answer: "1L 5dL", options: ["1L 5dL", "4L 2dL", "15L"] }),
    p({ problemId: "cap-calc-02", stageId: "calculate", skillId: "calculate", kind: "calc", prompt: "2L 6dL − 4dL は？", hint: "dLどうしを引くと、いくつ残る？", answer: "2L 2dL", options: ["2L 2dL", "2L 10dL", "6dL"] }),
  ]},
];

function canCompose(target: number, values: number[]) {
  const reachable = Array(target + 1).fill(false) as boolean[];
  reachable[0] = true;
  for (let n = 1; n <= target; n++) reachable[n] = values.some(value => n >= value && reachable[n - value]);
  return reachable[target];
}

function validateProblemBank(bank: Stage[]) {
  const ids = new Set<string>();
  for (const stage of bank) {
    if (stage.problems.length < 2) throw new Error(`${stage.id}: at least two problems are required`);
    for (const problem of stage.problems) {
      if (ids.has(problem.problemId)) throw new Error(`${problem.problemId}: duplicate problemId`);
      ids.add(problem.problemId);
      if (problem.unitId !== "capacity" || problem.stageId !== stage.id || problem.skillId !== stage.skillId) throw new Error(`${problem.problemId}: metadata mismatch`);
      if (problem.options && !problem.options.some(option => String(option) === String(problem.answer))) throw new Error(`${problem.problemId}: answer is missing from options`);
      if (problem.kind === "compare") {
        const expected = Number(problem.meta?.a) > Number(problem.meta?.b) ? "A" : "B";
        if (problem.answer !== expected) throw new Error(`${problem.problemId}: comparison answer must be ${expected}`);
      }
      if (problem.kind === "cups" && Number(problem.answer) !== Number(problem.meta?.target)) throw new Error(`${problem.problemId}: cup target mismatch`);
      if (problem.kind === "makeMl" && !canCompose(Number(problem.answer), problem.values ?? [])) throw new Error(`${problem.problemId}: target cannot be composed`);
      if (problem.kind === "relation" && Number(problem.answer) !== Number(problem.meta?.target) / Number(problem.meta?.step)) throw new Error(`${problem.problemId}: relation mismatch`);
      if (problem.kind === "makeDl" && Number(problem.answer) !== Number(problem.meta?.liters) * 10 + Number(problem.meta?.dl)) throw new Error(`${problem.problemId}: L/dL conversion mismatch`);
    }
  }
}

validateProblemBank(stages);
