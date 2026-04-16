#!/usr/bin/env node

console.log("🔥 git-pandit is working!");
import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG_DIR = join(homedir(), '.git-pandit');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

function getConfig() {
  if (!existsSync(CONFIG_FILE)) return {};
  try { return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')); }
  catch { return {}; }
}

function saveConfig(data) {
  if (!existsSync(CONFIG_DIR)) mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2));
}

export function configureSettings(options) {
  const config = getConfig();
  if (options.key) { config.openaiApiKey = options.key; console.log(chalk.green('✅  API key saved!')); }
  if (options.provider) { config.defaultProvider = options.provider; console.log(chalk.green(`✅  Default provider: ${options.provider}`)); }
  if (options.mood) { config.defaultMood = options.mood; console.log(chalk.green(`✅  Default mood: ${options.mood}`)); }
  if (options.lang) { config.defaultLang = options.lang; console.log(chalk.green(`✅  Default language: ${options.lang}`)); }
  saveConfig(config);
}

export function showConfig() {
  const config = getConfig();
  console.log('');
  console.log(chalk.bold.magenta('  🧙 git-pandit config'));
  console.log(chalk.gray('  ─────────────────────────────'));
  const key = config.openaiApiKey;
  console.log(chalk.cyan('  API Key:  '), key ? chalk.gray(key.slice(0, 7) + '...' + key.slice(-4)) : chalk.red('Not set'));
  console.log(chalk.cyan('  Provider: '), chalk.white(config.defaultProvider || 'not set (will ask)'));
  console.log(chalk.cyan('  Mood:     '), chalk.white(config.defaultMood || 'professional'));
  console.log(chalk.cyan('  Language: '), chalk.white(config.defaultLang || 'english'));
  console.log('');
}

// ─── Mood Prompts ─────────────────────────────────────────────────────────────

const MOOD_PROMPTS = {
  professional: `You are a senior software engineer writing clean, professional git commit messages.
Follow Conventional Commits strictly. Be precise, clear, and concise.`,

  savage: `You are a brutally honest, sarcastic developer writing git commit messages.
Be funny, savage, and real — but still describe the actual change.
Examples of style:
- "fix: undid what someone broke at 2am again"
- "feat: added feature nobody asked for but PM insisted"
- "chore: deleted 500 lines of spaghetti called architecture"
Still follow conventional commits format but make it spicy and real!`,

  poetic: `You are a poetic, dramatic developer who writes commit messages like literature.
Be creative and metaphorical but the message must still convey the actual change.
Examples of style:
- "feat: and thus the user could finally login, as dawn breaks"
- "fix: slayed the null pointer dragon haunting production"
- "refactor: untangled the web of chaos into elegant simplicity"
Still use conventional commits format.`
};

// ─── Language Prompts ─────────────────────────────────────────────────────────

const LANG_PROMPTS = {
  english: `Write commit messages in clear English.`,

  hinglish: `Write commit messages in Hinglish (mix of Hindi + English in Roman script).
This is how Indian developers actually talk to each other.
Examples of style:
- "feat(auth): login ka jugaad laga diya, ab kaam karega"
- "fix: woh wala bug thik kiya jo pata nahi kahan se aaya tha"
- "chore: purana code saaf kar diya, bahut gandagi thi yaar"
- "feat: naya feature add kiya, PM khush ho jayenge"
Keep it natural, relatable, and fun like real desi dev chat!`,

  hindi: `Write commit messages in Hindi using Devanagari script.
Examples:
- "feat: उपयोगकर्ता लॉगिन सुविधा जोड़ी"
- "fix: प्रमाणीकरण त्रुटि को ठीक किया"
Keep it clear and professional.`
};

// ─── Git Helpers ──────────────────────────────────────────────────────────────

function getStagedDiff() {
  try { return execSync('git diff --cached', { encoding: 'utf-8' }).trim(); }
  catch { return null; }
}

function isGitRepo() {
  try { execSync('git rev-parse --git-dir', { stdio: 'ignore' }); return true; }
  catch { return false; }
}

function getChangedFiles() {
  try { return execSync('git diff --cached --name-only', { encoding: 'utf-8' }).trim(); }
  catch { return ''; }
}

// ─── AI Providers ─────────────────────────────────────────────────────────────

async function callOpenAI(apiKey, prompt) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 400,
    }),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API error');
  }
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function callOllama(prompt) {
  try {
    const health = await fetch('http://localhost:11434/api/tags');
    if (!health.ok) throw new Error();
  } catch {
    throw new Error(
      'Ollama is not running!\n' +
      '  Start it with: ollama serve\n' +
      '  Pull a model:  ollama pull llama3'
    );
  }

  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3',
      prompt,
      stream: false,
      options: { temperature: 0.8 }
    }),
  });

  if (!response.ok) throw new Error('Ollama request failed. Is llama3 installed? Run: ollama pull llama3');
  const data = await response.json();
  return data.response?.trim();
}

// ─── Build Prompt ─────────────────────────────────────────────────────────────

function buildPrompt(diff, count, type, mood, lang) {
  const moodInstr = MOOD_PROMPTS[mood] || MOOD_PROMPTS.professional;
  const langInstr = LANG_PROMPTS[lang] || LANG_PROMPTS.english;
  const typeInstr = type
    ? `Use the conventional commit type: "${type}".`
    : 'Choose the best conventional commit type (feat, fix, docs, style, refactor, test, chore).';

  return `${moodInstr}

${langInstr}

${typeInstr}

Analyze this git diff and generate EXACTLY ${count} different commit message suggestions.

CRITICAL: Return ONLY a raw JSON array of strings. No explanation, no markdown, no backticks.
Correct format: ["message one", "message two", "message three"]

Git diff:
${diff.slice(0, 4000)}`;
}

function parseMessages(raw) {
  const match = raw.match(/\[[\s\S]*?\]/);
  if (!match) throw new Error('Could not parse AI response. Try again!');
  return JSON.parse(match[0]);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOOD_EMOJI = { professional: '💼', savage: '💀', poetic: '🌸' };
const LANG_EMOJI = { english: '🇬🇧', hinglish: '🇮🇳', hindi: '🇮🇳' };

async function askProvider() {
  const { provider } = await inquirer.prompt([{
    type: 'list',
    name: 'provider',
    message: chalk.bold('  Choose AI provider:'),
    choices: [
      { name: '  💻 Ollama — FREE, runs offline (needs Ollama installed)', value: 'ollama' },
      { name: '  🤖 OpenAI — Best quality (needs API key)', value: 'openai' },
    ]
  }]);
  return provider;
}

// ─── Main Command ─────────────────────────────────────────────────────────────

export async function generateCommitMessage(options) {
  const config = getConfig();

  const mood = options.mood || config.defaultMood || 'professional';
  const lang = options.lang || config.defaultLang || 'english';
  let provider = options.provider || config.defaultProvider || null;

  console.log('');
  console.log(chalk.bold.magenta('  🧙 git-pandit v2.0'));
  console.log(chalk.gray('  ─────────────────────────────'));
  console.log(`  ${MOOD_EMOJI[mood] || '💼'} Mood: ${chalk.cyan(mood)}   ${LANG_EMOJI[lang] || '🌐'} Lang: ${chalk.cyan(lang)}`);
  console.log(chalk.gray('  ─────────────────────────────'));

  // Git checks
  if (!isGitRepo()) {
    console.log(chalk.red('\n  ❌  Not a git repository.\n'));
    process.exit(1);
  }

  const diff = getStagedDiff();
  const files = getChangedFiles();

  if (!diff) {
    console.log(chalk.yellow('\n  ⚠️  No staged changes found.'));
    console.log(chalk.gray('  Stage files first: git add <files>\n'));
    process.exit(0);
  }

  // Show staged files
  console.log(chalk.cyan('  📂 Staged files:'));
  files.split('\n').filter(Boolean).forEach(f => console.log(chalk.gray(`     • ${f}`)));
  console.log('');

  // Pick provider if not set
  if (!provider) provider = await askProvider();
  console.log('');

  // Validate OpenAI key
  if (provider === 'openai') {
    const apiKey = process.env.OPENAI_API_KEY || config.openaiApiKey;
    if (!apiKey) {
      console.log(chalk.red('  ❌  No OpenAI API key found!'));
      console.log(chalk.yellow('  Run: git-pandit config --key sk-...'));
      console.log(chalk.gray('  Or use Ollama for free: git-pandit config --provider ollama'));
      process.exit(1);
    }
  }

  // Generate messages
  const spinner = ora({
    text: chalk.gray(provider === 'ollama'
      ? '  Thinking locally (Ollama)...'
      : '  Asking OpenAI...'),
    prefixText: ' ',
  }).start();

  let messages;
  try {
    const prompt = buildPrompt(diff, parseInt(options.count), options.type, mood, lang);
    const apiKey = process.env.OPENAI_API_KEY || config.openaiApiKey;
    const raw = provider === 'ollama'
      ? await callOllama(prompt)
      : await callOpenAI(apiKey, prompt);
    messages = parseMessages(raw);
    spinner.succeed(chalk.green('  Done! Here are your suggestions:'));
  } catch (err) {
    spinner.fail(chalk.red(`  Failed: ${err.message}`));
    process.exit(1);
  }

  console.log('');

  // Interactive picker
  const { chosen } = await inquirer.prompt([{
    type: 'list',
    name: 'chosen',
    message: chalk.bold('  Pick your commit message:'),
    choices: [
      ...messages.map(msg => ({ name: `  ${msg}`, value: msg })),
      new inquirer.Separator(),
      { name: '  ✏️  Write my own', value: '__custom__' },
      { name: '  🔄  Regenerate suggestions', value: '__regen__' },
      { name: '  ❌  Cancel', value: '__cancel__' },
    ],
    pageSize: 12,
  }]);

  if (chosen === '__cancel__') {
    console.log(chalk.gray('\n  Cancelled. Nothing committed.\n'));
    process.exit(0);
  }

  if (chosen === '__regen__') {
    console.log(chalk.yellow('\n  Regenerating...\n'));
    return generateCommitMessage(options);
  }

  let finalMessage = chosen;

  if (chosen === '__custom__') {
    const { custom } = await inquirer.prompt([{
      type: 'input',
      name: 'custom',
      message: '  Your commit message:',
      validate: v => v.trim().length > 0 || 'Please enter a message',
    }]);
    finalMessage = custom.trim();
  }

  // Confirm
  const { confirm } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirm',
    message: chalk.bold(`  Commit with: "${chalk.cyan(finalMessage)}"?`),
    default: true,
  }]);

  if (!confirm) {
    console.log(chalk.gray('\n  Cancelled.\n'));
    process.exit(0);
  }

  // Run git commit
  try {
    execSync(`git commit -m "${finalMessage.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
    console.log('');
    console.log(chalk.green.bold('  ✅  Committed successfully!'));
    console.log(chalk.gray(`  "${finalMessage}"\n`));
  } catch {
    console.log(chalk.red('\n  ❌  Commit failed.\n'));
    process.exit(1);
  }
}