import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

// ─── Git History Helpers ──────────────────────────────────────────────────────

function getAllCommits() {
  try {
    const raw = execSync(
      'git log --pretty=format:"%an|%ae|%s|%ai" --no-merges',
      { encoding: 'utf-8' }
    ).trim();
    if (!raw) return [];
    return raw.split('\n').map(line => {
      const [name, email, message, date] = line.split('|');
      return { name: name?.trim(), email: email?.trim(), message: message?.trim(), date: new Date(date) };
    }).filter(c => c.message);
  } catch { return []; }
}

function isGitRepo() {
  try { execSync('git rev-parse --git-dir', { stdio: 'ignore' }); return true; }
  catch { return false; }
}

// ─── Commit Classifiers ───────────────────────────────────────────────────────

const LAZY_PATTERNS = [
  /^fix$/i, /^fixes$/i, /^fixed$/i, /^update$/i, /^updated$/i,
  /^changes$/i, /^misc/i, /^wip/i, /^temp/i, /^test$/i,
  /^asdf/i, /^asd/i, /^lol/i, /^idk/i, /^done$/i, /^ok$/i,
  /^working/i, /^blah/i, /^stuff$/i, /^things$/i, /^hm/i,
  /^oops/i, /^whoops/i, /^ugh/i, /^yolo/i, /^please work/i,
  /^god/i, /^wtf/i, /^ffs/i, /^no idea/i, /^\?\?/,
  /^\.+$/, /^\d+$/, /^[a-z]$/i
];

const FIRE_PATTERNS = [
  /hotfix/i, /urgent/i, /production/i, /prod/i, /critical/i,
  /emergency/i, /revert/i, /rollback/i, /on fire/i, /burning/i,
  /crash/i, /broke/i, /breaking/i, /disaster/i
];

const SAVAGE_PATTERNS = [
  /finally/i, /idk why/i, /somehow/i, /magic/i, /no idea why/i,
  /hack/i, /please/i, /again/i, /still/i, /why/i, /sigh/i,
  /cursed/i, /should work/i, /maybe/i, /hopefully/i, /pray/i
];

const CONVENTIONAL_PATTERN = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{5,}/;

const LATE_NIGHT_HOURS = [22, 23, 0, 1, 2, 3, 4];

function classifyCommit(commit) {
  const msg = commit.message;
  const hour = commit.date.getHours();
  return {
    isLazy:        LAZY_PATTERNS.some(p => p.test(msg)) || msg.length < 5,
    isFire:        FIRE_PATTERNS.some(p => p.test(msg)),
    isSavage:      SAVAGE_PATTERNS.some(p => p.test(msg)),
    isConventional: CONVENTIONAL_PATTERN.test(msg),
    isLateNight:   LATE_NIGHT_HOURS.includes(hour),
    isWeekend:     [0, 6].includes(commit.date.getDay()),
    hour
  };
}

// ─── Awards ───────────────────────────────────────────────────────────────────

function getAwards(stats) {
  const awards = [];
  const authors = Object.values(stats);

  // Most lazy commits
  const laziestPerson = authors.sort((a, b) => b.lazy - a.lazy)[0];
  if (laziestPerson?.lazy > 0) {
    awards.push({
      emoji: '🏆',
      title: '"What does this even mean?" Award',
      winner: laziestPerson.name,
      reason: `${laziestPerson.lazy} lazy commits like "fix", "update", "misc"`
    });
  }

  // Most late night commits
  const nightOwl = [...authors].sort((a, b) => b.lateNight - a.lateNight)[0];
  if (nightOwl?.lateNight > 2) {
    awards.push({
      emoji: '🦉',
      title: '"Neend Kisko Chahiye?" Award',
      winner: nightOwl.name,
      reason: `${nightOwl.lateNight} commits after 10pm. Bhai so ja!`
    });
  }

  // Most fire/production commits
  const fireman = [...authors].sort((a, b) => b.fire - a.fire)[0];
  if (fireman?.fire > 0) {
    awards.push({
      emoji: '🚒',
      title: '"Production Pe Aag" Award',
      winner: fireman.name,
      reason: `${fireman.fire} hotfix/emergency commits. Chaos specialist!`
    });
  }

  // Most conventional commits (best writer)
  const bestWriter = [...authors].sort((a, b) => b.conventional - a.conventional)[0];
  if (bestWriter?.conventional > 3) {
    awards.push({
      emoji: '🎖️',
      title: '"Seedha Saadha Dev" Award',
      winner: bestWriter.name,
      reason: `${bestWriter.conventional} clean conventional commits. Respect!`
    });
  }

  // Weekend warrior
  const weekendDev = [...authors].sort((a, b) => b.weekend - a.weekend)[0];
  if (weekendDev?.weekend > 2) {
    awards.push({
      emoji: '😵',
      title: '"Weekend Ka Kya Matlab?" Award',
      winner: weekendDev.name,
      reason: `${weekendDev.weekend} commits on weekends. Bhai chutti le!`
    });
  }

  return awards;
}

// ─── Personality Label ────────────────────────────────────────────────────────

function getPersonality(s) {
  const ratio = s.total > 0 ? s.conventional / s.total : 0;

  if (s.fire > 5)         return { label: '🚒 Firefighter',    desc: 'Production ka rakhwala' };
  if (ratio > 0.8)        return { label: '💼 The Professional', desc: 'Clean commits, clean life' };
  if (s.lateNight > 10)   return { label: '🦉 Night Owl',       desc: 'Raat ko jeevan milta hai' };
  if (s.lazy > s.total * 0.5) return { label: '😴 The Lazy Dev', desc: '"fix" aur "update" fan' };
  if (s.savage > 5)       return { label: '💀 The Savage',      desc: '"idk why this works" energy' };
  if (s.weekend > 5)      return { label: '😵 No Life Dev',     desc: 'Weekend? Kya hota hai?' };
  if (ratio > 0.5)        return { label: '📚 The Learner',     desc: 'Improving every day' };
  return                         { label: '🎲 The Chaotic',     desc: 'Unpredictable but creative' };
}

// ─── Score Calculator ─────────────────────────────────────────────────────────

function calcScore(s) {
  if (s.total === 0) return 0;
  let score = 50;
  score += Math.min(30, (s.conventional / s.total) * 50);
  score -= Math.min(30, (s.lazy / s.total) * 40);
  score -= Math.min(10, s.fire * 2);
  score += Math.min(10, s.streak * 2);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function scoreBar(score) {
  const filled = Math.round(score / 10);
  const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
  const color = score >= 70 ? chalk.green : score >= 40 ? chalk.yellow : chalk.red;
  return color(bar) + chalk.gray(` ${score}/100`);
}

// ─── Streak Calculator ────────────────────────────────────────────────────────

function calcStreak(commits) {
  if (!commits.length) return 0;
  const days = [...new Set(commits.map(c =>
    c.date.toISOString().split('T')[0]
  ))].sort().reverse();

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i-1]) - new Date(days[i])) / 86400000;
    if (diff <= 1) streak++;
    else break;
  }
  return streak;
}

// ─── Main Report ──────────────────────────────────────────────────────────────

export async function showPersonalityReport(options) {
  console.log('');

  if (!isGitRepo()) {
    console.log(chalk.red('  ❌  Not a git repository.'));
    process.exit(1);
  }

  const spinner = ora({ text: chalk.gray('  Analyzing commit history...'), prefixText: ' ' }).start();
  const commits = getAllCommits();

  if (!commits.length) {
    spinner.fail(chalk.yellow('  No commits found in this repo!'));
    process.exit(0);
  }

  // Build per-author stats
  const stats = {};
  for (const commit of commits) {
    const key = commit.email || commit.name;
    if (!stats[key]) {
      stats[key] = {
        name: commit.name,
        total: 0, lazy: 0, fire: 0, savage: 0,
        conventional: 0, lateNight: 0, weekend: 0,
        commits: [], streak: 0
      };
    }
    const s = stats[key];
    const cls = classifyCommit(commit);
    s.total++;
    s.commits.push(commit);
    if (cls.isLazy)         s.lazy++;
    if (cls.isFire)         s.fire++;
    if (cls.isSavage)       s.savage++;
    if (cls.isConventional) s.conventional++;
    if (cls.isLateNight)    s.lateNight++;
    if (cls.isWeekend)      s.weekend++;
  }

  // Calc streaks
  for (const key of Object.keys(stats)) {
    stats[key].streak = calcStreak(stats[key].commits);
  }

  spinner.succeed(chalk.green(`  Analyzed ${commits.length} commits across ${Object.keys(stats).length} author(s)!`));

  const isSingle = options?.single || Object.keys(stats).length === 1;

  if (isSingle) {
    // ── Single author mode ──
    const s = Object.values(stats)[0];
    const score = calcScore(s);
    const personality = getPersonality(s);

    console.log('');
    console.log(chalk.bold.magenta('  🧙 commitpilot-ai — Personality Report'));
    console.log(chalk.gray('  ══════════════════════════════════════'));
    console.log(`  ${chalk.bold(personality.label)}`);
    console.log(`  ${chalk.gray(personality.desc)}`);
    console.log('');
    console.log(`  ${chalk.cyan('Commit Score:')}  ${scoreBar(score)}`);
    console.log('');
    console.log(`  ${chalk.cyan('Total commits:')}    ${chalk.white(s.total)}`);
    console.log(`  ${chalk.cyan('Conventional:')}     ${chalk.green(s.conventional)} ${chalk.gray(`(${Math.round(s.conventional/s.total*100)}%)`)}`);
    console.log(`  ${chalk.cyan('Lazy commits:')}     ${chalk.red(s.lazy)} ${s.lazy > 5 ? chalk.red('← bhai yeh theek karo') : ''}`);
    console.log(`  ${chalk.cyan('Hotfixes:')}         ${s.fire > 3 ? chalk.red(s.fire + ' 🔥') : chalk.white(s.fire)}`);
    console.log(`  ${chalk.cyan('Late night:')}       ${s.lateNight > 5 ? chalk.yellow(s.lateNight + ' 🦉') : chalk.white(s.lateNight)}`);
    console.log(`  ${chalk.cyan('Weekend commits:')} ${s.weekend > 3 ? chalk.yellow(s.weekend + ' 😵') : chalk.white(s.weekend)}`);
    console.log(`  ${chalk.cyan('Current streak:')}  ${chalk.bold.green(s.streak + ' days 🔥')}`);

    // Laziest commit
    const lazyCommits = s.commits
      .filter(c => LAZY_PATTERNS.some(p => p.test(c.message)) || c.message.length < 5)
      .slice(0, 3);
    if (lazyCommits.length) {
      console.log('');
      console.log(chalk.gray('  😬 Your "best" commits:'));
      lazyCommits.forEach(c => console.log(chalk.red(`     • "${c.message}"`)));
    }

    // Tip
    console.log('');
    if (s.lazy > s.total * 0.4) {
      console.log(chalk.yellow('  💡 Tip: Bahut lazy commits hain. commitpilot-ai regularly use karo!'));
    } else if (score >= 70) {
      console.log(chalk.green('  🏆 Bhai clean commits likhta hai tu! Keep it up!'));
    } else {
      console.log(chalk.cyan('  💡 Tip: More conventional commits = better score!'));
    }

  } else {
    // ── Team report mode ──
    const authors = Object.values(stats).sort((a, b) => calcScore(b) - calcScore(a));

    console.log('');
    console.log(chalk.bold.magenta('  🧙 commitpilot-ai — Team Report'));
    console.log(chalk.gray('  ══════════════════════════════════════════════════'));

    for (const s of authors) {
      const score = calcScore(s);
      const personality = getPersonality(s);
      console.log('');
      console.log(`  ${chalk.bold.white(s.name)}  ${chalk.gray(personality.label)}`);
      console.log(`  ${scoreBar(score)}  ${chalk.gray('streak: ' + s.streak + 'd 🔥')}`);
      console.log(
        `  ${chalk.gray('total:')} ${chalk.white(s.total)}  ` +
        `${chalk.gray('clean:')} ${chalk.green(s.conventional)}  ` +
        `${chalk.gray('lazy:')} ${chalk.red(s.lazy)}  ` +
        `${chalk.gray('3am:')} ${s.lateNight > 3 ? chalk.yellow(s.lateNight + '🦉') : chalk.white(s.lateNight)}`
      );
    }

    // Awards
    const awards = getAwards(stats);
    if (awards.length) {
      console.log('');
      console.log(chalk.gray('  ══════════════════════════════════════════════════'));
      console.log(chalk.bold.yellow('  🏅 Weekly Awards'));
      console.log(chalk.gray('  ══════════════════════════════════════════════════'));
      for (const award of awards) {
        console.log('');
        console.log(`  ${award.emoji}  ${chalk.bold(award.title)}`);
        console.log(`     ${chalk.cyan('Winner:')} ${chalk.white(award.winner)}`);
        console.log(`     ${chalk.gray(award.reason)}`);
      }
    }
  }

  console.log('');
  console.log(chalk.gray('  ══════════════════════════════════════════════════'));
  console.log(chalk.gray('  Run: commitpilot-ai score --team  for full team view'));
  console.log(chalk.gray('  Run: commitpilot-ai score --single for your own score'));
  console.log('');
}

// ─── Streak Command ───────────────────────────────────────────────────────────

export function showStreak() {
  if (!isGitRepo()) {
    console.log(chalk.red('\n  ❌  Not a git repository.\n'));
    process.exit(1);
  }

  const commits = getAllCommits();
  if (!commits.length) {
    console.log(chalk.yellow('\n  No commits found!\n'));
    return;
  }

  // Get current user's commits
  let currentUser;
  try {
    currentUser = execSync('git config user.email', { encoding: 'utf-8' }).trim();
  } catch { currentUser = null; }

  const myCommits = currentUser
    ? commits.filter(c => c.email === currentUser)
    : commits;

  const streak = calcStreak(myCommits);
  const days = [...new Set(myCommits.map(c => c.date.toISOString().split('T')[0]))].sort().reverse();
  const todayCommits = myCommits.filter(c =>
    c.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]
  );

  console.log('');
  console.log(chalk.bold.magenta('  🔥 commitpilot-ai — Streak Report'));
  console.log(chalk.gray('  ─────────────────────────────'));

  const flames = '🔥'.repeat(Math.min(streak, 7));
  console.log(`  ${chalk.bold.yellow(`${streak}-day streak`)}  ${flames}`);
  console.log('');
  console.log(`  ${chalk.cyan('Today\'s commits:')}  ${chalk.white(todayCommits.length)}`);
  console.log(`  ${chalk.cyan('Active days:')}      ${chalk.white(days.length)}`);
  console.log(`  ${chalk.cyan('Total commits:')}    ${chalk.white(myCommits.length)}`);

  if (todayCommits.length === 0) {
    console.log('');
    console.log(chalk.yellow('  ⚠️  Aaj commit nahi kiya! Streak toot jayegi!'));
    console.log(chalk.gray('  Kuch bhi karo, commit karo! 😄'));
  } else {
    console.log('');
    console.log(chalk.green('  ✅  Aaj commit kar diya! Streak safe hai!'));
  }

  // Last broken streak message
  if (days.length > 1) {
    const lastCommit = myCommits[myCommits.length - 1];
    const worstCommit = myCommits
      .filter(c => LAZY_PATTERNS.some(p => p.test(c.message)))
      .sort(() => Math.random() - 0.5)[0];

    if (worstCommit) {
      console.log('');
      console.log(chalk.gray(`  😅 Your most "creative" commit ever:`));
      console.log(chalk.red(`     "${worstCommit.message}"`));
    }
  }

  console.log('');
}