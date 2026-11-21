import type { Language } from '../context/LanguageContext';
import type { SimulatorMeta } from '../types/simulator';
import type { TutorialFaq, TutorialStep } from '../types/tutorial';

export interface HelperAnswer {
  text: string;
  suggestedStepIndex?: number;
  suggestedStepTitle?: string;
}

function pickLang(
  lang: Language,
  text: { en: string; id: string; ja: string }
): string {
  return text[lang] || text.en;
}

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s.+-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(input: string): string[] {
  return normalize(input)
    .split(' ')
    .filter((w) => w.length >= 2);
}

function scoreOverlap(queryTokens: string[], corpus: string): number {
  if (queryTokens.length === 0) return 0;
  const hay = normalize(corpus);
  let score = 0;
  for (const tok of queryTokens) {
    if (hay.includes(tok)) {
      score += tok.length >= 4 ? 2 : 1;
    }
  }
  return score;
}

function scoreFaq(query: string, queryTokens: string[], faq: TutorialFaq, lang: Language): number {
  const normQ = normalize(query);
  const faqQ = normalize(pickLang(lang, faq.q));
  if (normQ === faqQ) return 100;

  let score = scoreOverlap(
    queryTokens,
    `${faq.q.en} ${faq.q.id} ${faq.q.ja} ${faq.a.en} ${faq.a.id} ${faq.a.ja}`
  );

  if (faq.keywords) {
    for (const kw of faq.keywords) {
      if (normQ.includes(normalize(kw))) {
        score += 4;
      }
    }
  }
  return score;
}

export function getQuickQuestionsForStep(
  step: TutorialStep,
  lang: Language
): string[] {
  const out: string[] = [];

  if (step.faqs && step.faqs.length > 0) {
    for (const faq of step.faqs.slice(0, 2)) {
      out.push(pickLang(lang, faq.q));
    }
  }

  const defaults =
    lang === 'id'
      ? ['Bagaimana cara menggunakannya?', 'Bagaimana cara troubleshoot jika salah?']
      : lang === 'ja'
        ? ['使い方を教えて', 'トラブル時の確認方法は？']
        : ['How do I use this feature?', 'How do I troubleshoot errors?'];

  for (const d of defaults) {
    if (out.length < 3 && !out.includes(d)) {
      out.push(d);
    }
  }

  return out;
}

export function answerTutorialQuestion(params: {
  question: string;
  language: Language;
  meta: SimulatorMeta;
  currentStep: TutorialStep;
  currentStepIndex: number;
  allSteps: TutorialStep[];
}): HelperAnswer {
  const { question, language, meta, currentStep, currentStepIndex, allSteps } = params;
  const normQ = normalize(question);
  const tokens = tokenize(question);

  if (!normQ) {
    return {
      text: pickLang(language, {
        en: `Ask me anything about "${currentStep.title.en}" — how it works, how to operate it, or how to troubleshoot errors.`,
        id: `Tanyakan apa saja tentang "${currentStep.title.id}" — cara kerja, cara menggunakan, atau cara troubleshoot masalah.`,
        ja: `「${currentStep.title.ja}」について、使い方やトラブル対策など何でも質問してください。`,
      }),
    };
  }

  // 1. Check current step FAQs first
  if (currentStep.faqs && currentStep.faqs.length > 0) {
    let bestFaq: TutorialFaq | null = null;
    let bestScore = 0;
    for (const faq of currentStep.faqs) {
      const s = scoreFaq(question, tokens, faq, language);
      if (s > bestScore) {
        bestScore = s;
        bestFaq = faq;
      }
    }
    if (bestFaq && bestScore >= 3) {
      return { text: pickLang(language, bestFaq.a) };
    }
  }

  // 2. Check FAQs across all steps in this simulator
  let bestCrossFaq: { faq: TutorialFaq; stepIdx: number; score: number } | null = null;
  allSteps.forEach((step, idx) => {
    if (!step.faqs) return;
    for (const faq of step.faqs) {
      const s = scoreFaq(question, tokens, faq, language);
      if (s >= 4 && (!bestCrossFaq || s > bestCrossFaq.score)) {
        bestCrossFaq = { faq, stepIdx: idx, score: s };
      }
    }
  });
  if (bestCrossFaq !== null) {
    const match = bestCrossFaq as { faq: TutorialFaq; stepIdx: number; score: number };
    const targetStep = allSteps[match.stepIdx];
    return {
      text: pickLang(language, match.faq.a),
      suggestedStepIndex: match.stepIdx !== currentStepIndex ? match.stepIdx : undefined,
      suggestedStepTitle:
        match.stepIdx !== currentStepIndex
          ? pickLang(language, targetStep.title)
          : undefined,
    };
  }

  // 3. Intent: Troubleshooting / Error / Wrong / Off
  const isTroubleshootIntent =
    /(troubleshoot|error|wrong|fault|problem|issue|off|drift|fix|why|salah|rusak|kenapa|masalah|galat|perbaiki|エラー|トラブル|ズレ|原因|直し)/.test(
      normQ
    );

  if (isTroubleshootIntent) {
    const troubleshootStepIdx = allSteps.findIndex(
      (s) =>
        /troubleshoot|fault|error|diag/i.test(s.id) ||
        /troubleshoot|fault|error/i.test(s.badge.en)
    );
    const currentTip = currentStep.tip ? pickLang(language, currentStep.tip) : '';
    const baseDesc = pickLang(language, currentStep.description);

    if (
      troubleshootStepIdx !== -1 &&
      troubleshootStepIdx !== currentStepIndex &&
      scoreOverlap(tokens, `${currentStep.title.en} ${currentStep.description.en}`) < 2
    ) {
      const tStep = allSteps[troubleshootStepIdx];
      return {
        text: `${pickLang(language, tStep.title)}: ${pickLang(language, tStep.description)}${
          tStep.tip ? `\n\n💡 ${pickLang(language, tStep.tip)}` : ''
        }`,
        suggestedStepIndex: troubleshootStepIdx,
        suggestedStepTitle: pickLang(language, tStep.title),
      };
    }

    return {
      text: pickLang(language, {
        en: `For "${currentStep.title.en}": ${currentTip || baseDesc} Double-check your control inputs, reset to baseline if readings look off, and verify in the live readout panel.`,
        id: `Untuk "${currentStep.title.id}": ${currentTip || baseDesc} Periksa ulang pengaturan kontrol Anda, reset ke kondisi awal jika pembacaan tampak meleset, lalu verifikasi di panel pembacaan.`,
        ja: `「${currentStep.title.ja}」の確認ポイント: ${currentTip || baseDesc} 設定値を見直し、数値がずれている場合は基準状態にリセットして読取パネルで再確認してください。`,
      }),
    };
  }

  // 4. Intent: How to use / Operate
  const isHowToIntent =
    /(how|use|operate|step|guide|click|drag|cara|pakai|gunakan|langkah|どう|使い方|操作)/.test(
      normQ
    );

  if (isHowToIntent) {
    const desc = pickLang(language, currentStep.description);
    const tip = currentStep.tip ? pickLang(language, currentStep.tip) : '';
    return {
      text: tip ? `${desc}\n\n💡 ${tip}` : desc,
    };
  }

  // 5. Cross-step semantic match by title/description/tip
  let bestStepIdx = currentStepIndex;
  let bestStepScore = 0;
  allSteps.forEach((step, idx) => {
    const corpus = `${step.badge.en} ${step.title.en} ${step.description.en} ${step.tip?.en ?? ''} ${step.title.id} ${step.description.id} ${step.title.ja} ${step.description.ja}`;
    const s = scoreOverlap(tokens, corpus);
    if (s > bestStepScore) {
      bestStepScore = s;
      bestStepIdx = idx;
    }
  });

  if (bestStepScore >= 2 && bestStepIdx !== currentStepIndex) {
    const matched = allSteps[bestStepIdx];
    return {
      text: `${pickLang(language, matched.title)} — ${pickLang(language, matched.description)}${
        matched.tip ? `\n\n💡 ${pickLang(language, matched.tip)}` : ''
      }`,
      suggestedStepIndex: bestStepIdx,
      suggestedStepTitle: pickLang(language, matched.title),
    };
  }

  // 5b. Native Explore-section & formula lookup (zero network/API calls)
  let bestExploreIdx = -1;
  let bestExploreScore = 0;
  meta.explore.forEach((sec, idx) => {
    const eqText = sec.equations.map((e) => `${e.label} ${e.formula}`).join(' ');
    const s = scoreOverlap(tokens, `${sec.title} ${sec.summary} ${eqText}`);
    if (s > bestExploreScore) {
      bestExploreScore = s;
      bestExploreIdx = idx;
    }
  });

  if (bestExploreScore >= 2 && bestExploreIdx !== -1) {
    const sec = meta.explore[bestExploreIdx];
    const topEq = sec.equations[0];
    return {
      text: `${sec.title}: ${sec.summary}${
        topEq ? `\n\n📐 ${topEq.label}: ${topEq.formula}` : ''
      }`,
    };
  }

  // 6. Contextual summary fallback for current step
  const desc = pickLang(language, currentStep.description);
  const tip = currentStep.tip ? pickLang(language, currentStep.tip) : '';
  return {
    text: pickLang(language, {
      en: `Here’s what "${currentStep.title.en}" does in ${meta.title}: ${desc}${
        tip ? `\n\n💡 Tip: ${tip}` : ''
      }`,
      id: `Ringkasan "${currentStep.title.id}" di ${meta.title}: ${desc}${
        tip ? `\n\n💡 Tips: ${tip}` : ''
      }`,
      ja: `${meta.title}の「${currentStep.title.ja}」について: ${desc}${
        tip ? `\n\n💡 ヒント: ${tip}` : ''
      }`,
    }),
  };
}
