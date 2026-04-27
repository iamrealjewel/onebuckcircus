// ============================================================
// SETTLE IT — Argument Court Engine
// ============================================================

const JUDGES = ["The Honorable Judge Merciless", "Chief Justice Callous", "Judge Absolutely Not", "The Honorable Judge Side-Eye"];
const PLAINTIFF_WINS = [
  "The evidence is overwhelming. The defendant's logic has more holes than a string cheese.",
  "This court finds the plaintiff's argument airtight, bulletproof, and frankly, obvious.",
  "After careful deliberation, this court rules: the defendant was wrong, is wrong, and will continue to be wrong.",
  "The plaintiff wins. The defendant is advised to reflect on their choices in silence.",
];
const DEFENDANT_WINS = [
  "The plaintiff's case collapses under the weight of its own absurdity.",
  "This court finds the defendant not guilty. The plaintiff is advised to touch grass.",
  "After careful review, the court sides with the defendant. The plaintiff may lodge a formal complaint with their diary.",
  "The defendant prevails. The plaintiff's feelings, while valid, are not facts.",
];
const BOTH_WRONG = [
  "Both parties are wrong. This court is tired. Please grow up.",
  "In a stunning twist, this court finds BOTH sides equally unreasonable. A plague on both your houses.",
  "Neither party wins. The real loser is this court for having to hear this.",
];

function scoreArgument(side: string): number {
  let score = 50;
  const longer = side.length > 100 ? 10 : 0;
  const hasEmoji = /\p{Emoji}/u.test(side) ? -5 : 0;
  const hasCapitals = (side.match(/[A-Z]/g)?.length || 0) > 5 ? -8 : 0;
  const hasFacts = /always|never|everyone|research|science|statistic/i.test(side) ? 12 : 0;
  const hasWhining = /unfair|deserve|supposed to|should have/i.test(side) ? -10 : 0;
  return Math.max(10, Math.min(90, score + longer + hasEmoji + hasCapitals + hasFacts + hasWhining));
}

export function settleArgument(plaintiffSide: string, defendantSide: string, topic: string) {
  const pScore = scoreArgument(plaintiffSide);
  const dScore = scoreArgument(defendantSide);
  const diff = Math.abs(pScore - dScore);
  const caseNumber = `OBC-${Date.now().toString().slice(-6)}`;
  const judge = JUDGES[Math.floor(Math.random() * JUDGES.length)];

  let winner: "plaintiff" | "defendant" | "neither";
  let verdict: string;
  let ruling: string;

  if (diff < 8) {
    winner = "neither";
    verdict = "CASE DISMISSED — WITH PREJUDICE TOWARD BOTH PARTIES";
    ruling = BOTH_WRONG[Math.floor(Math.random() * BOTH_WRONG.length)];
  } else if (pScore > dScore) {
    winner = "plaintiff";
    verdict = "RULING IN FAVOR OF THE PLAINTIFF";
    ruling = PLAINTIFF_WINS[Math.floor(Math.random() * PLAINTIFF_WINS.length)];
  } else {
    winner = "defendant";
    verdict = "RULING IN FAVOR OF THE DEFENDANT";
    ruling = DEFENDANT_WINS[Math.floor(Math.random() * DEFENDANT_WINS.length)];
  }

  const penalties = [
    "The losing party must acknowledge this ruling within 24 hours.",
    "The losing party owes the winning party one (1) sincere apology.",
    "The losing party must remain quiet about this topic for 30 days.",
    "The losing party must buy the winning party a coffee. (Or just admit it.)",
  ];

  return {
    caseNumber,
    judge,
    topic,
    plaintiffScore: pScore,
    defendantScore: dScore,
    winner,
    verdict,
    ruling,
    penalty: penalties[Math.floor(Math.random() * penalties.length)],
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  };
}

// ============================================================
// LIFE AS A MOVIE — Hollywood Pitch Engine
// ============================================================

const GENRES = ["Gritty Indie Drama", "Absurdist Dark Comedy", "Underdog Sports Film", "Coming-of-Age Epic", "Heist Thriller", "Romantic Tragicomedy", "Surrealist Art Film", "Feel-Good Disaster Movie"];
const ACTORS_MALE = ["Timothée Chalamet", "Pedro Pascal", "Paul Mescal", "Andrew Garfield", "Dev Patel", "Oscar Isaac", "Cillian Murphy"];
const ACTORS_FEMALE = ["Zendaya", "Florence Pugh", "Sydney Sweeney", "Anya Taylor-Joy", "Daisy Edgar-Jones", "Phoebe Dynevor", "Emma Stone"];
const DIRECTORS = ["A24", "Christopher Nolan's fever dream", "a very confused Wes Anderson", "Bong Joon-ho", "a documentary crew that got lost"];
const TAGLINES = [
  "They said it couldn't be done. They were probably right.",
  "One person. Zero plans. Somehow still going.",
  "Based on a true story. Unfortunately.",
  "The odds were against them. The odds were correct.",
  "Some stories need to be told. This is not one of them. And yet.",
  "A journey no one asked for, documented for everyone.",
];
const SOUNDTRACK_ARTISTS = ["Phoebe Bridgers", "Tyler, the Creator", "Mitski", "Kendrick Lamar", "Bon Iver", "Hozier", "SZA"];

export function generateMoviePitch(name: string, job: string, biggestMistake: string, dream: string, quirk: string, currentMood: string) {
  const genre = GENRES[Math.floor(Math.random() * GENRES.length)];
  const actor = Math.random() > 0.5 ? ACTORS_MALE[Math.floor(Math.random() * ACTORS_MALE.length)] : ACTORS_FEMALE[Math.floor(Math.random() * ACTORS_FEMALE.length)];
  const director = DIRECTORS[Math.floor(Math.random() * DIRECTORS.length)];
  const tagline = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
  const soundtrack = SOUNDTRACK_ARTISTS[Math.floor(Math.random() * SOUNDTRACK_ARTISTS.length)];
  const rating = ["PG-13", "R", "R (for emotional damage)", "PG-13 (barely)"][Math.floor(Math.random() * 4)];
  const runtime = `${90 + Math.floor(Math.random() * 50)} minutes`;

  const title = `${name}: ${dream.split(" ").slice(0, 3).join(" ")}`;

  const actOne = `We meet ${name}, a ${job} who ${quirk.toLowerCase()}. Life is fine. Not good. Just fine. Then everything changes when ${biggestMistake.toLowerCase()} — and suddenly fine is no longer an option.`;
  const actTwo = `Halfway through their journey, ${name} realizes the dream (${dream.toLowerCase()}) was never really about the destination. It was about the increasingly questionable decisions made along the way. The audience is simultaneously rooting for and deeply concerned about them.`;
  const actThree = `In the third act — feeling ${currentMood.toLowerCase()} — ${name} finally confronts the truth. The resolution is messy, real, and slightly unsatisfying in the best possible way. The credits roll. ${soundtrack} plays. Everyone in the theater needs a moment.`;

  return {
    title,
    genre,
    tagline,
    actor,
    director,
    rating,
    runtime,
    actOne,
    actTwo,
    actThree,
    soundtrack,
    trailerDesc: `The trailer opens on a montage of ${name}'s best and worst moments, soundtracked by ${soundtrack}. Text on screen: "${tagline}". Cut to black. One more scene. The audience gasps.`,
    awardsChance: `${30 + Math.floor(Math.random() * 60)}% chance of a Sundance nomination`,
    pitchNumber: `OBC-${Date.now().toString().slice(-6)}`,
  };
}

// ============================================================
// ROAST MY IDEA — Brutal Feedback Engine
// ============================================================

const ROASTS = [
  (idea: string) => `"${idea.slice(0,40)}..." — Ah yes, another visionary who confused 'interesting shower thought' with 'business model'.`,
  (idea: string) => `The market for this is either everyone or no one. Based on how you described it, definitely no one.`,
  () => `Three people have already built this. Two of them pivoted. One of them cried.`,
  (idea: string) => `You've essentially invented a solution to a problem that 7 billion people have survived without solving.`,
  () => `The elevator pitch would require an elevator that goes up 47 floors minimum.`,
  () => `The TAM (Total Addressable Market) on this is approximately your group chat.`,
  () => `If this was a movie it would be called 'Good Will Hunting But For Business Ideas That Shouldn't Exist.'`,
];

const IMPROVEMENTS = [
  ["Niche down hard", "You're trying to serve everyone. Serve 100 specific people obsessively well first."],
  ["Validate before you build", "Find 10 people willing to pay for this before writing a single line of code."],
  ["Name it better", "The name needs to tell people what it does in 2 seconds. Yours does not."],
  ["Add a viral loop", "How does one user naturally bring in another? Answer this or you'll spend your life on paid ads."],
  ["Charge more", "Whatever price you're thinking — double it. Seriously. Then validate if people flinch."],
  ["Pick your villain", "Who are you taking customers FROM? Great products have a clear villain they beat."],
  ["Ship in 2 weeks", "Stop planning. Build the ugliest version that works, show 10 strangers, record their reactions."],
  ["Talk to churned users", "Don't ask people who like it why they like it. Ask people who quit why they quit."],
  ["Focus on the moment of magic", "What's the ONE moment where the user goes 'oh wow'? Build everything around that."],
  ["Pick a revenue model before features", "Features are opinions. Revenue is facts. Know exactly how dollar 1 will enter your account."],
];

export function roastIdea(idea: string, stage: string, targetAudience: string) {
  const roastFn = ROASTS[Math.floor(Math.random() * ROASTS.length)];
  const mainRoast = roastFn(idea);

  const improvements = IMPROVEMENTS.sort(() => 0.5 - Math.random()).slice(0, 5);
  const survivalChance = Math.floor(Math.random() * 40) + 10;
  const pivotSuggestion = `What if instead of targeting ${targetAudience}, you went after [obsessive niche]? They pay more and complain less.`;
  const verdict = survivalChance > 35 ? "Roasted but Rescuable" : survivalChance > 20 ? "Critical Condition" : "Flatline (for now)";

  return {
    mainRoast,
    pivotSuggestion,
    survivalChance,
    verdict,
    improvements: improvements.map(([title, detail]) => ({ title, detail })),
    closingLine: `The good news: every great company started as a terrible idea. The bad news: most terrible ideas stay terrible. You decide which category you're in.`,
    caseId: `OBC-${Date.now().toString().slice(-6)}`,
  };
}

// ============================================================
// NAME IT — Naming Oracle Engine
// ============================================================

const NAME_DATA: Record<string, { names: string[]; meanings: string[] }> = {
  baby: {
    names: ["Aurelia", "Caspian", "Isadora", "Emrys", "Solène", "Caelum", "Vesper", "Idris", "Isolde", "Evander"],
    meanings: ["golden", "from the Caspian Sea", "gift of Isis", "immortal", "sun", "sky", "evening star", "ardent lord", "ice ruler", "good man"],
  },
  pet: {
    names: ["Biscuit", "Archimedes", "Mango", "Professor Flop", "Duchess", "Barnaby", "Clementine", "Sir Borks", "Noodles", "Copernicus"],
    meanings: ["crumbly & sweet", "pure genius", "tropical chaos", "distinguished drooper", "noble chaos", "gentle bear", "citrus royalty", "vocal lord", "slippery speed", "stellar navigator"],
  },
  startup: {
    names: ["Nexara", "Loopli", "Vantiq", "Thrumble", "Quellix", "Driftly", "Clarix", "Spunto", "Veloxr", "Orbify"],
    meanings: ["next era", "continuous loop", "vantage point", "something that thrums", "quality helix", "go with the drift", "clarity", "starting point (Italian)", "velocity", "orbital clarity"],
  },
  band: {
    names: ["The Hollow Chorus", "Static Reverie", "Glasswork", "The Borrowed Hours", "Pale Architecture", "Drift & Theorem", "The Quiet Riot (Original)", "Velvet Static", "The Underscore", "Fault Line"],
    meanings: ["echo of nothing", "beautiful noise", "transparent strength", "stolen time", "minimal grandeur", "moving theory", "softly loud", "soft chaos", "beneath everything", "where things break"],
  },
  default: {
    names: ["Luminos", "Arcway", "Velantis", "Corium", "Thraxis", "Quelara", "Dravex", "Sophos", "Nullum", "Erevon"],
    meanings: ["light", "gateway", "veil + atlantis", "core", "thrace + axis", "quality + clarity", "draw + vex", "wisdom", "nothing (Latin)", "ever + on"],
  },
};

export function generateNames(thingToName: string, category: string, personality: string, style: string) {
  const key = Object.keys(NAME_DATA).find(k => category.toLowerCase().includes(k)) || "default";
  const data = NAME_DATA[key];

  const shuffled = data.names
    .map((n, i) => ({ name: n, meaning: data.meanings[i], score: Math.random() }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const topPick = shuffled[0];
  const wildcard = shuffled[shuffled.length - 1];

  return {
    topPick: { ...topPick, reason: `"${topPick.name}" fits the ${style.toLowerCase()} vibe perfectly. The meaning (${topPick.meaning}) aligns with what you're going for with ${thingToName}.` },
    names: shuffled,
    wildcard: { ...wildcard, reason: `This one's a wildcard. It doesn't make obvious sense, which is exactly why it'll stick.` },
    namingCertificate: `OBC-${Date.now().toString().slice(-6)}`,
    domainHint: `${topPick.name.toLowerCase().replace(/\s/g, "")}.com might be available. Check Namecheap.`,
  };
}

// ============================================================
// BREAKUP RECEIPT — Emotional Closure Engine
// ============================================================

const REFUND_STATUSES = ["DENIED", "DENIED (appeal pending)", "DENIED (permanently)", "UNDER REVIEW (estimated: never)", "APPROVED — FOR LESSONS ONLY"];
const LESSONS = [
  "You now know exactly which red flags to photograph, frame, and hang on your wall as art.",
  "Your standards have been recalibrated. They have nowhere to go but up.",
  "You are now immune to at least 3 specific types of nonsense.",
  "The time spent was not wasted. It was research.",
  "You have earned the right to say 'I've been through worse' at every future inconvenience.",
];

export function generateReceipt(name: string, theirName: string, duration: string, type: string, redFlags: string, bestMemory: string) {
  const months = parseFloat(duration) || 12;
  const years = months >= 12 ? `${(months / 12).toFixed(1)} years` : `${months} months`;
  const redFlagCount = redFlags.split(",").length + Math.floor(Math.random() * 5);
  const refundStatus = REFUND_STATUSES[Math.floor(Math.random() * REFUND_STATUSES.length)];
  const lesson = LESSONS[Math.floor(Math.random() * LESSONS.length)];
  const receiptNumber = `OBC-${Date.now().toString().slice(-6)}`;

  const items = [
    { label: "Time invested", value: years, note: "Non-refundable" },
    { label: "Red flags ignored", value: `${redFlagCount}`, note: "Inexplicably" },
    { label: "\"Last chance\" chances given", value: `${2 + Math.floor(Math.random() * 8)}`, note: "Too many" },
    { label: "Emotional labor performed", value: "Incalculable", note: "Unreciprocated" },
    { label: "Texts left on read", value: `${Math.floor(Math.random() * 200) + 10}`, note: "Approximate" },
    { label: "Personal growth achieved", value: "Significant", note: "Unwillingly" },
    { label: "Best memory retained", value: bestMemory.slice(0, 40) + "...", note: "Keep it" },
    { label: "Late fees (recovery period)", value: "TBD", note: "Be patient" },
  ];

  return {
    receiptNumber,
    from: name,
    regarding: theirName,
    type,
    items,
    subtotal: years,
    tax: "Emotional damage (varies by region)",
    refundStatus,
    lesson,
    closingStatement: `This receipt certifies that ${name} has officially processed, documented, and closed the account titled "${theirName}." All remaining feelings have been transferred to the Department of Growth. The account is hereby sealed.`,
    futureDiscount: "You've earned it. Next one's going to be different. We believe in you.",
    timestamp: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  };
}
