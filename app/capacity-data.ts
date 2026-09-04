export type SkillId = "compare" | "measure" | "standardNeed" | "units" | "numberUnit" | "relation" | "composeOneLiter" | "sense" | "compose" | "calculate";
export type LearningPhase = "導入" | "基礎" | "確認" | "応用";
export type VesselId = "compare-wide" | "compare-tall" | "compare-medium" | "compare-cylinder" | "reference-cup" | "pail-4" | "jug-6" | "tank-8";
export type PourOption = { label: string; ml: number };
export type Problem = {
  problemId: string; unitId: "capacity"; stageId: string; skillId: SkillId; learningPhase: LearningPhase;
  prompt: string; hint: string; explanation: string;
  kind: "compare" | "cups" | "standardNeed" | "unitExplore" | "numberUnit" | "relation" | "compose" | "unitSense" | "choice";
  answer: string | number; options?: string[]; pours?: PourOption[]; meta?: Record<string, number | string | boolean>;
};
export type Stage = {
  id: string; number: number; phase: "ためす" | "気づく" | "ミッション" | "わかった？" | "チャレンジ";
  title: string; short: string; skillId: SkillId; color: string; objective: string; prerequisite: string; mastery: string; problems: Problem[];
};

export const vessels: Record<VesselId, { capacityMl: number; width: number; height: number; label: string }> = {
  "compare-wide": { capacityMl: 900, width: 150, height: 150, label: "ひろい入れもの" },
  "compare-tall": { capacityMl: 720, width: 88, height: 205, label: "ほそい入れもの" },
  "compare-medium": { capacityMl: 700, width: 118, height: 174, label: "中くらいの入れもの" },
  "compare-cylinder": { capacityMl: 900, width: 104, height: 196, label: "くらべる入れもの" },
  "reference-cup": { capacityMl: 100, width: 76, height: 76, label: "同じ大きさのコップ" },
  "pail-4": { capacityMl: 400, width: 126, height: 142, label: "小さいバケツ" },
  "jug-6": { capacityMl: 600, width: 116, height: 185, label: "中くらいの水さし" },
  "tank-8": { capacityMl: 800, width: 158, height: 176, label: "大きい水そう" },
};

const p = (problem: Omit<Problem, "unitId">): Problem => ({ ...problem, unitId: "capacity" });
export const skillNames: Record<SkillId, string> = {
  compare: "かさのくらべ方", measure: "同じ大きさで測る", standardNeed: "みんなで同じに測る", units: "かさの単位", numberUnit: "数と単位の役わり",
  relation: "単位のつながり", composeOneLiter: "1Lの作り方", sense: "くらしの中のかさ", compose: "かさを組み立てる", calculate: "かさの換算と計算",
};

export const stages: Stage[] = [
  { id: "compare", number: 1, phase: "ためす", title: "うつして くらべよう", short: "形がちがう水も、同じ入れものへ", skillId: "compare", color: "#0284c7",
    objective: "水の多い・少ないを比べ、形がちがうときは同じ形にうつすと分かる。", prerequisite: "水の高さを見て、多い・少ないと言える。", mastery: "高さだけで決めず、必要なときに同じ形へうつして比べられる。", problems: [
      p({ problemId: "cap-compare-01", stageId: "compare", skillId: "compare", learningPhase: "導入", kind: "compare", prompt: "同じ形です。水が 多いのは どっち？", hint: "同じ形なら、水の高さを見くらべよう。", explanation: "同じ形なら、水の高さを見るとくらべやすいね。", answer: "B", meta: { a: 360, b: 560, vesselA: "compare-cylinder", vesselB: "compare-cylinder", transfer: false } }),
      p({ problemId: "cap-compare-02", stageId: "compare", skillId: "compare", learningPhase: "基礎", kind: "compare", prompt: "形が ちがいます。多いのは どっちだろう？", hint: "「同じ形に うつす」を押して、ならべてみよう。", explanation: "うつしても水の量は同じ。同じ形なら、Aのほうが高いね。", answer: "A", meta: { a: 610, b: 500, vesselA: "compare-wide", vesselB: "compare-tall", transfer: true } }),
      p({ problemId: "cap-compare-03", stageId: "compare", skillId: "compare", learningPhase: "確認", kind: "compare", prompt: "水面が 高いB。本当に Bが多い？", hint: "ほそい入れものは、水面が高くなりやすいよ。うつしてたしかめよう。", explanation: "Bは高く見えたけれど、同じ形にうつすとAのほうが多いね。", answer: "A", meta: { a: 650, b: 520, vesselA: "compare-wide", vesselB: "compare-tall", transfer: true } }),
      p({ problemId: "cap-compare-04", stageId: "compare", skillId: "compare", learningPhase: "応用", kind: "compare", prompt: "こんどは どちらが 多い？", hint: "見た目だけで決めず、同じ形にうつしてたしかめよう。", explanation: "同じ形にうつすとBの水面が高い。Bのほうが多いね。", answer: "B", meta: { a: 430, b: 570, vesselA: "compare-tall", vesselB: "compare-medium", transfer: true } }),
    ] },
  { id: "measure", number: 2, phase: "気づく", title: "同じコップで はかろう", short: "1ぱいずつ入れて、満ぱいまで数える", skillId: "measure", color: "#0d9488",
    objective: "同じ大きさのコップをくり返し使うと、かさを杯数で表せると分かる。", prerequisite: "1、2、3…と順に数えられる。", mastery: "基準コップを変えず、満杯までの杯数を正しく測れる。", problems: [
      p({ problemId: "cap-measure-01", stageId: "measure", skillId: "measure", learningPhase: "導入", kind: "cups", prompt: "このバケツは、同じコップ 何ばいで 満ぱい？", hint: "左のコップ1ぱいを、空のバケツへ入れて数えよう。", explanation: "同じコップを4はい入れると満ぱい。4はい分のかさだね。", answer: 4, meta: { vessel: "pail-4", reference: "reference-cup" } }),
      p({ problemId: "cap-measure-02", stageId: "measure", skillId: "measure", learningPhase: "基礎", kind: "cups", prompt: "水さしは、同じコップ 何ばいで 満ぱい？", hint: "入れるたびに、はい数を1ふやそう。", explanation: "この水さしは、同じコップ6はい分。", answer: 6, meta: { vessel: "jug-6", reference: "reference-cup" } }),
      p({ problemId: "cap-measure-03", stageId: "measure", skillId: "measure", learningPhase: "確認", kind: "cups", prompt: "大きい水そうを 満ぱいにしよう。何ばい入る？", hint: "同じコップを使い、満ぱいになるまで入れよう。", explanation: "大きい水そうは8はい分。大きい入れものほど、たくさん入ったね。", answer: 8, meta: { vessel: "tank-8", reference: "reference-cup" } }),
      p({ problemId: "cap-measure-04", stageId: "measure", skillId: "measure", learningPhase: "応用", kind: "cups", prompt: "もう一度、水さしを はかろう。", hint: "同じ見た目の水さしは、いつも同じかさだよ。", explanation: "同じ水さしと同じコップなら、いつでも6はいで満ぱいになるね。", answer: 6, meta: { vessel: "jug-6", reference: "reference-cup" } }),
    ] },
  { id: "shared-standard", number: 3, phase: "気づく", title: "コップが ちがうと？", short: "同じ4はいでも、量がちがうわけ", skillId: "standardNeed", color: "#0891b2",
    objective: "杯数だけでは基準の大きさによって答えが変わるため、共通の単位が必要だと気づく。", prerequisite: "同じコップの杯数でかさを測れる。", mastery: "「何杯分」にはコップの大きさも必要だと説明できる。", problems: [
      p({ problemId: "cap-standard-01", stageId: "shared-standard", skillId: "standardNeed", learningPhase: "導入", kind: "standardNeed", prompt: "小さいコップ4はいと、大きいコップ4はい。水の量は 同じ？", hint: "両方を同じ入れものへ入れて、水面を見よう。", explanation: "同じ4はいでも、大きいコップ4はいのほうが多いね。", answer: "ちがう", options: ["同じ", "ちがう"], meta: { smallCup: 70, largeCup: 120, count: 4 } }),
      p({ problemId: "cap-standard-02", stageId: "shared-standard", skillId: "standardNeed", learningPhase: "基礎", kind: "choice", prompt: "なぜ、同じ4はいなのに 水の量が ちがったの？", hint: "使ったコップを見くらべよう。", explanation: "コップの大きさがちがうと、同じ杯数でも水の量がかわるね。", answer: "コップの大きさが ちがうから", options: ["コップの大きさが ちがうから", "数え方が ちがうから"] }),
      p({ problemId: "cap-standard-03", stageId: "shared-standard", skillId: "standardNeed", learningPhase: "確認", kind: "choice", prompt: "だれと はかっても 同じ答えにするには？", hint: "みんなが同じ大きさを使えたらどうかな。", explanation: "みんなが同じ大きさを使えば、かさを同じ答えで伝えられるね。", answer: "みんなで同じ大きさを使う", options: ["好きなコップを使う", "みんなで同じ大きさを使う"] }),
    ] },
  { id: "units", number: 4, phase: "ためす", title: "L・dL・mLを 見てみよう", short: "大・中・小、3つのかさの単位", skillId: "units", color: "#d97706",
    objective: "L・dL・mLがかさを表す共通の単位で、それぞれ大きさが違うと感じる。", prerequisite: "共通の大きさで測る必要があると分かる。", mastery: "3つを量の大きい順に捉え、身近な見本と結びつけられる。", problems: [
      p({ problemId: "cap-units-01", stageId: "units", skillId: "units", learningPhase: "導入", kind: "unitExplore", prompt: "3つの 見本を さわって、大きさを 見くらべよう。", hint: "カードを1つずつ押すと、その量が見えるよ。", explanation: "L・dL・mLは、どれもかさを表す単位。大きさはずいぶんちがうね。", answer: "見た", meta: { exploreAll: true } }),
      p({ problemId: "cap-units-02", stageId: "units", skillId: "units", learningPhase: "基礎", kind: "unitExplore", prompt: "牛乳パック1本くらいの 見本は？", hint: "いちばん大きい見本をさわってみよう。", explanation: "1Lは、牛乳パック1本くらいのかさ。", answer: "1L", options: ["1L", "1dL", "1mL"], meta: { focus: "L" } }),
      p({ problemId: "cap-units-03", stageId: "units", skillId: "units", learningPhase: "基礎", kind: "unitExplore", prompt: "小さいコップ1ぱいくらいの 見本は？", hint: "まん中の大きさの見本を見よう。", explanation: "1dLは、小さいコップ1ぱいくらいのかさ。", answer: "1dL", options: ["1L", "1dL", "1mL"], meta: { focus: "dL" } }),
      p({ problemId: "cap-units-04", stageId: "units", skillId: "units", learningPhase: "確認", kind: "unitExplore", prompt: "スポイトで はかるような 少ない見本は？", hint: "いちばん小さい見本を見よう。", explanation: "1mLは、スポイトで量るような少ないかさ。", answer: "1mL", options: ["1L", "1dL", "1mL"], meta: { focus: "mL" } }),
      p({ problemId: "cap-units-05", stageId: "units", skillId: "units", learningPhase: "応用", kind: "choice", prompt: "かさが 大きい順に ならんでいるのは？", hint: "牛乳パック、小さいコップ、スポイトの順に考えよう。", explanation: "大きい順は L、dL、mL。どれもかさの単位だね。", answer: "L → dL → mL", options: ["L → dL → mL", "mL → dL → L", "dL → L → mL"] }),
    ] },
  { id: "number-unit", number: 5, phase: "気づく", title: "3dLは どんなかさ？", short: "3つ分の量を、数と単位で表す", skillId: "numberUnit", color: "#7c3aed",
    objective: "数は単位量がいくつあるか、単位はどの大きさで測ったかを表すと理解する。", prerequisite: "L・dL・mLがかさの単位だと知っている。", mastery: "実際のまとまりを見て、数と単位それぞれの役割を説明できる。", problems: [
      p({ problemId: "cap-number-unit-01", stageId: "number-unit", skillId: "numberUnit", learningPhase: "導入", kind: "numberUnit", prompt: "1dLのコップを 3こ まとめよう。", hint: "「1dLを1こ」を3回押そう。", explanation: "1dLが3こ集まったかさを、3dLと書くよ。", answer: 3, meta: { unit: "dL", count: 3 } }),
      p({ problemId: "cap-number-unit-02", stageId: "number-unit", skillId: "numberUnit", learningPhase: "基礎", kind: "numberUnit", prompt: "3dLの「3」は 何を表している？", hint: "画面には、1dLのコップがいくつあるかな。", explanation: "3は、1dLが3こあることを表す数。", answer: "1dLが 3こある", options: ["1dLが 3こある", "単位の名前"], meta: { unit: "dL", count: 3, showReady: true } }),
      p({ problemId: "cap-number-unit-03", stageId: "number-unit", skillId: "numberUnit", learningPhase: "確認", kind: "numberUnit", prompt: "3dLの「dL」は 何を表している？", hint: "どの大きさを1ことして数えたかな。", explanation: "dLは、どの大きさで測ったかを表す単位。", answer: "かさを表す 単位", options: ["3この 3", "かさを表す 単位"], meta: { unit: "dL", count: 3, showReady: true } }),
      p({ problemId: "cap-number-unit-04", stageId: "number-unit", skillId: "numberUnit", learningPhase: "応用", kind: "numberUnit", prompt: "1Lの入れものを 2こ まとめると？", hint: "1Lがいくつあるかを、数と単位で表そう。", explanation: "1Lが2こだから2L。数と単位を合わせると、かさを表せるね。", answer: "2L", options: ["1L", "2L", "2dL"], meta: { unit: "L", count: 2, showReady: true } }),
    ] },
  { id: "relations", number: 6, phase: "気づく", title: "集めて つながり発見", short: "小さい単位を集めて、大きい単位へ", skillId: "relation", color: "#059669",
    objective: "具体的に集める操作から、1L=10dL、1dL=100mL、1L=1000mLを理解する。", prerequisite: "L・dL・mLの大きさと、数・単位の役割が分かる。", mastery: "操作結果を3つの単位関係の式と結びつけられる。", problems: [
      p({ problemId: "cap-relation-01", stageId: "relations", skillId: "relation", learningPhase: "導入", kind: "relation", prompt: "1dLを 集めて、1Lを 作ろう。", hint: "1dLずつ入れて、いっぱいになるまで数えよう。", explanation: "1dLを10こ集めると1L。だから 1L = 10dL。", answer: 10, meta: { stepMl: 100, stepLabel: "1dL", targetMl: 1000, targetLabel: "1L" } }),
      p({ problemId: "cap-relation-02", stageId: "relations", skillId: "relation", learningPhase: "基礎", kind: "relation", prompt: "100mLを 集めて、1Lを 作ろう。", hint: "100mLずつ入れて、入れた数を見よう。", explanation: "100mLを10こ集めると1000mL。これが1Lだね。", answer: 10, meta: { stepMl: 100, stepLabel: "100mL", targetMl: 1000, targetLabel: "1L" } }),
      p({ problemId: "cap-relation-03", stageId: "relations", skillId: "relation", learningPhase: "確認", kind: "relation", prompt: "100mLを入れて、1dLと 見くらべよう。", hint: "100mLを1こ入れると、どこまで来るかな。", explanation: "100mLと1dLは同じかさ。だから 1dL = 100mL。", answer: 1, meta: { stepMl: 100, stepLabel: "100mL", targetMl: 100, targetLabel: "1dL" } }),
      p({ problemId: "cap-relation-04", stageId: "relations", skillId: "relation", learningPhase: "応用", kind: "choice", prompt: "集めた結果に 合う式を えらぼう。", hint: "1Lまでに100mLが10こ。ぜんぶで何mLだったかな。", explanation: "1Lは1000mL。集めた操作と式がつながったね。", answer: "1L = 1000mL", options: ["1L = 100mL", "1L = 1000mL", "1dL = 1000mL"] }),
    ] },
  { id: "make-1l", number: 7, phase: "ミッション", title: "1Lを 作ろう", short: "いろいろな量を組み合わせて1L", skillId: "composeOneLiter", color: "#2563eb",
    objective: "単位関係を使い、複数の組み合わせで1Lを構成する。", prerequisite: "1L=10dL、1L=1000mLが分かる。", mastery: "100mL、2dL、500mLなどから1Lを作り、別解も見つけられる。", problems: [
      p({ problemId: "cap-make1l-01", stageId: "make-1l", skillId: "composeOneLiter", learningPhase: "導入", kind: "compose", prompt: "100mLずつ入れて、1Lを 作ろう。", hint: "100mLを10回入れると、いくつになるかな。", explanation: "100mLを10こで1000mL。ちょうど1L。", answer: 1000, pours: [{ label: "100mL", ml: 100 }], meta: { targetMl: 1000, targetLabel: "1L" } }),
      p({ problemId: "cap-make1l-02", stageId: "make-1l", skillId: "composeOneLiter", learningPhase: "基礎", kind: "compose", prompt: "2dLずつ入れて、1Lを 作ろう。", hint: "2dLを5回入れると、10dLになるよ。", explanation: "2dLを5こで10dL。これも1L。", answer: 1000, pours: [{ label: "2dL", ml: 200 }], meta: { targetMl: 1000, targetLabel: "1L" } }),
      p({ problemId: "cap-make1l-03", stageId: "make-1l", skillId: "composeOneLiter", learningPhase: "基礎", kind: "compose", prompt: "500mLを使って、1Lを 作ろう。", hint: "500mLは、1Lの半分くらい。", explanation: "500mLを2こで1000mL。ちょうど1L。", answer: 1000, pours: [{ label: "500mL", ml: 500 }], meta: { targetMl: 1000, targetLabel: "1L" } }),
      p({ problemId: "cap-make1l-04", stageId: "make-1l", skillId: "composeOneLiter", learningPhase: "確認", kind: "compose", prompt: "好きな組み合わせで、1Lを 作ろう。", hint: "どのボタンも何回でも使えるよ。合計を見ながら考えよう。", explanation: "組み合わせがちがっても、合計が1000mLなら1L。", answer: 1000, pours: [{ label: "100mL", ml: 100 }, { label: "2dL", ml: 200 }, { label: "500mL", ml: 500 }], meta: { targetMl: 1000, targetLabel: "1L" } }),
      p({ problemId: "cap-make1l-05", stageId: "make-1l", skillId: "composeOneLiter", learningPhase: "応用", kind: "compose", prompt: "500mLを使わずに、1Lを 作ろう。", hint: "100mLと2dLを組み合わせよう。作り方は1つではないよ。", explanation: "小さい量を合わせても1Lを作れる。いくつもの作り方があるね。", answer: 1000, pours: [{ label: "100mL", ml: 100 }, { label: "2dL", ml: 200 }], meta: { targetMl: 1000, targetLabel: "1L" } }),
    ] },
  { id: "sense", number: 8, phase: "わかった？", title: "くらしの かさ図かん", short: "ものの量と、自然な単位をつなぐ", skillId: "sense", color: "#ea580c",
    objective: "身近な量を見本と比較し、L・dL・mLのどれで表すと分かりやすいか判断する。", prerequisite: "3単位の大きさと関係を、実際の量として経験している。", mastery: "明確な日用品の量に、自然な単位を理由とともに選べる。", problems: [
      p({ problemId: "cap-sense-01", stageId: "sense", skillId: "sense", learningPhase: "導入", kind: "unitSense", prompt: "牛乳パック1本、1をつけるなら どの単位？", hint: "1Lの見本は、牛乳パック1本くらいだったね。", explanation: "牛乳パック1本は1L。Lで表すと分かりやすいね。", answer: "L", options: ["L", "dL", "mL"], meta: { object: "carton", amountText: "1 □", recommendedUnit: "L", scale: 70 } }),
      p({ problemId: "cap-sense-02", stageId: "sense", skillId: "sense", learningPhase: "基礎", kind: "unitSense", prompt: "500のペットボトル、どの単位を入れる？", hint: "500Lならおふろ何杯分にもなる。500mLなら手で持てる量だよ。", explanation: "よく見る小さいペットボトルは500mL。", answer: "mL", options: ["L", "dL", "mL"], meta: { object: "bottle", amountText: "500 □", recommendedUnit: "mL", scale: 48 } }),
      p({ problemId: "cap-sense-03", stageId: "sense", skillId: "sense", learningPhase: "基礎", kind: "unitSense", prompt: "小さいコップに 2。自然な単位は？", hint: "2Lでは大きなペットボトルくらい。コップなら2dLくらい。", explanation: "小さいコップ1ぱいは、およそ2dL。", answer: "dL", options: ["L", "dL", "mL"], meta: { object: "glass", amountText: "2 □", recommendedUnit: "dL", scale: 26 } }),
      p({ problemId: "cap-sense-04", stageId: "sense", skillId: "sense", learningPhase: "確認", kind: "unitSense", prompt: "小さじ1ぱいに 5。自然な単位は？", hint: "スプーンの少ない量には、いちばん小さい単位が合うよ。", explanation: "小さじ1ぱいは、およそ5mL。少ない量はmLで表すと分かりやすいね。", answer: "mL", options: ["L", "dL", "mL"], meta: { object: "spoon", amountText: "5 □", recommendedUnit: "mL", scale: 6 } }),
      p({ problemId: "cap-sense-05", stageId: "sense", skillId: "sense", learningPhase: "確認", kind: "unitSense", prompt: "大きな浴そうに 200。自然な単位は？", hint: "とてもたくさんの水は、大きい単位で表そう。", explanation: "大きな浴そうの水は、およそ200L。たくさんの水はLが自然だね。", answer: "L", options: ["L", "dL", "mL"], meta: { object: "bath", amountText: "200 □", recommendedUnit: "L", scale: 100 } }),
      p({ problemId: "cap-sense-06", stageId: "sense", skillId: "sense", learningPhase: "応用", kind: "unitSense", prompt: "計量カップの 少ない水に 100。自然な単位は？", hint: "100mLは1dLと同じ。目盛りで細かく読むときはmLが分かりやすいよ。", explanation: "計量カップの目盛りはmLで読むことが多いね。100mLは1dLと同じ量。", answer: "mL", options: ["L", "dL", "mL"], meta: { object: "measuring-cup", amountText: "100 □", recommendedUnit: "mL", scale: 16 } }),
    ] },
  { id: "compose", number: 9, phase: "ミッション", title: "めざす かさを 作ろう", short: "まず量を作り、そのあと数で表す", skillId: "compose", color: "#4f46e5",
    objective: "L・dL・mLで示された量を具体的に構成し、操作結果を数表現に結びつける。", prerequisite: "単位関係を使って1Lを複数の方法で作れる。", mastery: "示された量を部品から作り、合計の表し方を選べる。", problems: [
      p({ problemId: "cap-compose-01", stageId: "compose", skillId: "compose", learningPhase: "導入", kind: "compose", prompt: "1Lと3dLを入れて、めざす量を作ろう。", hint: "1Lを1こ、1dLを3こ入れよう。", explanation: "1Lと3dLを合わせたかさが1L3dL。", answer: 1300, pours: [{ label: "1L", ml: 1000 }, { label: "1dL", ml: 100 }], meta: { targetMl: 1300, targetLabel: "1L3dL" } }),
      p({ problemId: "cap-compose-02", stageId: "compose", skillId: "compose", learningPhase: "基礎", kind: "compose", prompt: "1dLを使って、8dLを作ろう。", hint: "1dLを8回入れよう。", explanation: "1dLが8こで8dL。水の量と表し方がつながったね。", answer: 800, pours: [{ label: "1dL", ml: 100 }], meta: { targetMl: 800, targetLabel: "8dL" } }),
      p({ problemId: "cap-compose-03", stageId: "compose", skillId: "compose", learningPhase: "基礎", kind: "compose", prompt: "100mLと200mLを使って、500mLを作ろう。", hint: "合計が500になる組み合わせをためそう。", explanation: "100mLと200mLを組み合わせて500mL。作り方は1つではないね。", answer: 500, pours: [{ label: "100mL", ml: 100 }, { label: "200mL", ml: 200 }], meta: { targetMl: 500, targetLabel: "500mL" } }),
      p({ problemId: "cap-compose-04", stageId: "compose", skillId: "compose", learningPhase: "確認", kind: "compose", prompt: "2L4dLを作ろう。", hint: "1Lを2こ、2dLを2こでも作れるよ。", explanation: "合わせた水は2L4dL。1LとdLを組み合わせて表せたね。", answer: 2400, pours: [{ label: "1L", ml: 1000 }, { label: "2dL", ml: 200 }], meta: { targetMl: 2400, targetLabel: "2L4dL" } }),
      p({ problemId: "cap-compose-05", stageId: "compose", skillId: "compose", learningPhase: "応用", kind: "compose", prompt: "ちがう単位を組み合わせて、1L5dLを作ろう。", hint: "500mLは5dLと同じ。1Lに合わせてみよう。", explanation: "1Lと500mLを合わせても1L5dL。単位がちがっても量で考えられたね。", answer: 1500, pours: [{ label: "1L", ml: 1000 }, { label: "500mL", ml: 500 }, { label: "1dL", ml: 100 }], meta: { targetMl: 1500, targetLabel: "1L5dL" } }),
    ] },
  { id: "calculate", number: 10, phase: "チャレンジ", title: "かさを 数で とこう", short: "操作で分かったことを、換算と計算へ", skillId: "calculate", color: "#db2777",
    objective: "具体的な量の理解を基に、L・dLの換算と同じ単位同士の加減ができる。", prerequisite: "量を構成し、L・dL・mLの関係を説明できる。", mastery: "単位をそろえ、教科書範囲の換算・加減問題を正しく解ける。", problems: [
      p({ problemId: "cap-calc-01", stageId: "calculate", skillId: "calculate", learningPhase: "導入", kind: "choice", prompt: "1Lは 何dL？", hint: "1dLを10こ集めた操作を思い出そう。", explanation: "1L = 10dL。", answer: "10dL", options: ["1dL", "10dL", "100dL"] }),
      p({ problemId: "cap-calc-02", stageId: "calculate", skillId: "calculate", learningPhase: "基礎", kind: "choice", prompt: "2Lは 何dL？", hint: "1Lが10dLなら、2Lは10dLが2つ。", explanation: "10dLが2つだから、2L = 20dL。", answer: "20dL", options: ["2dL", "12dL", "20dL"] }),
      p({ problemId: "cap-calc-03", stageId: "calculate", skillId: "calculate", learningPhase: "基礎", kind: "choice", prompt: "2L3dLは 何dL？", hint: "2Lを20dLになおして、3dLを合わせよう。", explanation: "20dL + 3dL = 23dL。", answer: "23dL", options: ["5dL", "23dL", "203dL"] }),
      p({ problemId: "cap-calc-04", stageId: "calculate", skillId: "calculate", learningPhase: "基礎", kind: "choice", prompt: "1L2dL + 3dL は？", hint: "dLどうしを足して、Lはそのまま。", explanation: "2dL + 3dL = 5dL。答えは1L5dL。", answer: "1L5dL", options: ["1L5dL", "4L2dL", "15L"] }),
      p({ problemId: "cap-calc-05", stageId: "calculate", skillId: "calculate", learningPhase: "確認", kind: "choice", prompt: "2L6dL − 4dL は？", hint: "6dLから4dLをひこう。", explanation: "6dL − 4dL = 2dL。答えは2L2dL。", answer: "2L2dL", options: ["2L2dL", "2L10dL", "6dL"] }),
      p({ problemId: "cap-calc-06", stageId: "calculate", skillId: "calculate", learningPhase: "確認", kind: "choice", prompt: "3L + 5L は？", hint: "同じLどうしを足そう。", explanation: "3L + 5L = 8L。", answer: "8L", options: ["8L", "8dL", "35L"] }),
      p({ problemId: "cap-calc-07", stageId: "calculate", skillId: "calculate", learningPhase: "応用", kind: "choice", prompt: "4L7dL − 2L3dL は？", hint: "Lどうし、dLどうしに分けてひこう。", explanation: "4L−2L、7dL−3dLで、答えは2L4dL。", answer: "2L4dL", options: ["2L4dL", "2L10dL", "6L4dL"] }),
      p({ problemId: "cap-calc-08", stageId: "calculate", skillId: "calculate", learningPhase: "応用", kind: "choice", prompt: "水が1L4dLあります。2dL使うと のこりは？", hint: "4dLから2dLをひこう。", explanation: "1L4dL − 2dL = 1L2dL。", answer: "1L2dL", options: ["1L2dL", "1L6dL", "2dL"] }),
    ] },
];

const phaseOrder: Record<LearningPhase, number> = { "導入": 0, "基礎": 1, "確認": 2, "応用": 3 };
const learnerText = (problem: Problem) => [problem.prompt, problem.hint, problem.explanation, ...(problem.options ?? []), ...(problem.pours ?? []).map(x => x.label), String(problem.meta?.targetLabel ?? ""), String(problem.meta?.stepLabel ?? "")].join(" ");
function canCompose(target: number, pours: PourOption[]) {
  const reachable = Array(target + 1).fill(false) as boolean[]; reachable[0] = true;
  for (let n = 1; n <= target; n += 1) reachable[n] = pours.some(({ ml }) => n >= ml && reachable[n - ml]);
  return reachable[target];
}
export function validateProblemBank(bank: Stage[]) {
  const problemIds = new Set<string>(); const stageIds = new Set<string>(); const expectedCounts = [4, 4, 3, 5, 4, 4, 5, 6, 5, 8];
  if (bank.length !== 10) throw new Error("capacity: exactly ten learning stages are required");
  bank.forEach((stage, stageIndex) => {
    if (stage.number !== stageIndex + 1) throw new Error(`${stage.id}: stage numbers must be sequential`);
    if (stageIds.has(stage.id)) throw new Error(`${stage.id}: duplicate stageId`); stageIds.add(stage.id);
    if (!stage.objective || !stage.prerequisite || !stage.mastery) throw new Error(`${stage.id}: learning contract is incomplete`);
    if (stage.problems.length !== expectedCounts[stageIndex]) throw new Error(`${stage.id}: expected ${expectedCounts[stageIndex]} problems`);
    let previousPhase = -1;
    stage.problems.forEach(problem => {
      if (problemIds.has(problem.problemId)) throw new Error(`${problem.problemId}: duplicate problemId`); problemIds.add(problem.problemId);
      if (problem.unitId !== "capacity" || problem.stageId !== stage.id || problem.skillId !== stage.skillId) throw new Error(`${problem.problemId}: problemId/stageId/skillId metadata mismatch`);
      if (!problem.prompt || !problem.hint || !problem.explanation) throw new Error(`${problem.problemId}: learner-facing text is incomplete`);
      if (phaseOrder[problem.learningPhase] < previousPhase) throw new Error(`${problem.problemId}: learning phases are out of order`); previousPhase = phaseOrder[problem.learningPhase];
      if (stage.number < 4 && /(?:mL|dL|L)(?![a-z])/i.test(learnerText(problem))) throw new Error(`${problem.problemId}: uses an untaught unit`);
      if (problem.options && !problem.options.some(option => String(option) === String(problem.answer))) throw new Error(`${problem.problemId}: answer is missing from options`);
      if (problem.kind === "compare") {
        const expected = Number(problem.meta?.a) > Number(problem.meta?.b) ? "A" : "B"; if (problem.answer !== expected) throw new Error(`${problem.problemId}: comparison answer must be ${expected}`);
        const vesselA = vessels[String(problem.meta?.vesselA) as VesselId]; const vesselB = vessels[String(problem.meta?.vesselB) as VesselId];
        if (!vesselA || !vesselB || Number(problem.meta?.a) > vesselA.capacityMl || Number(problem.meta?.b) > vesselB.capacityMl) throw new Error(`${problem.problemId}: comparison amount exceeds vessel capacity`);
      }
      if (problem.kind === "cups") {
        const vessel = vessels[String(problem.meta?.vessel) as VesselId]; const reference = vessels[String(problem.meta?.reference) as VesselId];
        if (!vessel || !reference || problem.meta?.reference !== "reference-cup") throw new Error(`${problem.problemId}: visible reference cup is required`);
        if (vessel.capacityMl % reference.capacityMl !== 0 || Number(problem.answer) !== vessel.capacityMl / reference.capacityMl) throw new Error(`${problem.problemId}: cup count and vessel capacity disagree`);
      }
      if (problem.kind === "standardNeed" && Number(problem.meta?.smallCup) >= Number(problem.meta?.largeCup)) throw new Error(`${problem.problemId}: standard cup comparison is invalid`);
      if (problem.kind === "relation") { const expected = Number(problem.meta?.targetMl) / Number(problem.meta?.stepMl); if (!Number.isInteger(expected) || Number(problem.answer) !== expected) throw new Error(`${problem.problemId}: unit relation is inconsistent`); }
      if (problem.kind === "compose") { const target = Number(problem.meta?.targetMl); if (Number(problem.answer) !== target || !problem.pours?.length || !canCompose(target, problem.pours)) throw new Error(`${problem.problemId}: target cannot be composed`); }
      if (problem.kind === "unitSense" && problem.answer !== problem.meta?.recommendedUnit) throw new Error(`${problem.problemId}: natural unit answer mismatch`);
    });
    if (stage.problems[0]?.learningPhase !== "導入" || !stage.problems.some(x => x.learningPhase === "確認" || x.learningPhase === "応用")) throw new Error(`${stage.id}: stage needs introduction and understanding check`);
  });
  return { stages: bank.length, problems: problemIds.size };
}
export const validationSummary = validateProblemBank(stages);
