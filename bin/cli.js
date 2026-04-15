#!/usr/bin/env node

import { program } from 'commander';
import { generateCommitMessage, configureSettings, showConfig } from '../src/index.js';
import { showPersonalityReport, showStreak } from '../src/personality.js';

program
  .name('commit-sage')
  .description('🧙 AI-powered git commit generator with personality scoring!')
  .version('2.0.0');

// ── Default: generate commit message ──
program
  .command('generate', { isDefault: true })
  .alias('g')
  .description('Generate a commit message from staged changes')
  .option('-t, --type <type>', 'Commit type (feat, fix, docs, etc.)')
  .option('-n, --count <number>', 'Number of suggestions to generate', '3')
  .option('-m, --mood <mood>', 'Mood: professional | savage | poetic', 'professional')
  .option('-l, --lang <lang>', 'Language: english | hinglish | hindi', 'english')
  .option('--provider <provider>', 'AI provider: openai | ollama', null)
  .action(generateCommitMessage);

// ── Score: personality report ──
program
  .command('score')
  .alias('s')
  .description('Show your git personality score and team report')
  .option('--team', 'Show full team report with awards')
  .option('--single', 'Show only your personal score')
  .action((options) => showPersonalityReport(options));

// ── Streak: commit streak tracker ──
program
  .command('streak')
  .description('Show your current commit streak 🔥')
  .action(showStreak);

// ── Config ──
program
  .command('config')
  .description('Configure commit-sage settings')
  .option('-k, --key <apiKey>', 'Set your OpenAI API key')
  .option('-p, --provider <provider>', 'Default AI provider: openai | ollama')
  .option('-m, --mood <mood>', 'Default mood: professional | savage | poetic')
  .option('-l, --lang <lang>', 'Default language: english | hinglish | hindi')
  .option('-s, --show', 'Show current configuration')
  .action((options) => {
    if (options.show) return showConfig();
    configureSettings(options);
  });

program.parse();