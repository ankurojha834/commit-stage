# 🧙 git-pandit

> An AI-powered CLI that analyzes your staged git diff and generates smart, meaningful commit messages — so you never write a lazy `fix stuff` commit again.

[![npm version](https://img.shields.io/npm/v/git-pandit)](https://www.npmjs.com/package/git-pandit)
[![npm downloads](https://img.shields.io/npm/dm/git-pandit)](https://www.npmjs.com/package/git-pandit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)

---

## ✨ What Makes This Different?

| Feature | Other tools | git-pandit |
|---|---|---|
| Works 100% offline (FREE) | ❌ | ✅ via Ollama |
| Hinglish / Hindi commit mode | ❌ | ✅ |
| Mood personalities | ❌ | ✅ Professional / Savage / Poetic |
| Git Personality Score | ❌ | ✅ |
| Team Report with Awards | ❌ | ✅ |
| Commit Streak Tracker | ❌ | ✅ |
| Regenerate suggestions | ❌ | ✅ |

---

## 📦 Installation

```bash
npm install -g git-pandit
```

**Requirements:** Node.js >= 18.0.0

---

## 🚀 Quick Start

### Option A — Free & Offline (Ollama)
```bash
# 1. Install Ollama from https://ollama.com
ollama pull llama3

# 2. Set Ollama as default provider
git-pandit config --provider ollama

# 3. Stage your changes and run
git add .
git-pandit
```

### Option B — OpenAI
```bash
# 1. Set your OpenAI API key
git-pandit config --key sk-your-openai-key

# 2. Stage your changes and run
git add .
git-pandit
```

---

## 🎭 Mood Examples

### 💼 Professional (default)
```
feat(auth): implement JWT token refresh mechanism
fix(api): handle null response from payment gateway
docs: update installation steps in README
```

### 💀 Savage
```
fix: undid what someone broke at 2am again
chore: deleted 500 lines of code someone called "architecture"
feat: added a feature nobody asked for but PM insisted
```

### 🌸 Poetic
```
feat: and thus the user could finally login, as dawn breaks
fix: slayed the null pointer dragon haunting production
refactor: untangled the web of chaos into elegant simplicity
```

---

## 🌍 Language Modes

### English (default)
```
feat(auth): add Google OAuth login support
```

### Hinglish 🇮🇳
```
feat(auth): login ka jugaad laga diya, ab kaam karega
fix: woh wala bug thik kiya jo pata nahi kahan se aaya tha
chore: purana code saaf kar diya, bahut gandagi thi yaar
```

### Hindi
```
feat: उपयोगकर्ता लॉगिन सुविधा जोड़ी
fix: प्रमाणीकरण त्रुटि को ठीक किया
```

---

## 🎯 Git Personality Score

Analyze your commit history and get a personality score with team reports and fun awards.

```bash
git-pandit score           # your personal score
git-pandit score --team    # full team report with awards
git-pandit streak          # your commit streak
```

### Personal Score
```
  🧙 git-pandit — Personality Report
  ══════════════════════════════════════
  💀 The Savage
  "idk why this works" energy

  Commit Score:  ████████░░ 76/100

  Total commits:    142
  Conventional:     98  (69%)
  Lazy commits:     12
  Hotfixes:         3 🔥
  Late night:       18 🦉
  Weekend commits:  7 😵
  Current streak:   5 days 🔥

  😬 Your "best" commits:
     • "fix"
     • "misc changes"
     • "idk"
```

### Team Report
```
  🧙 git-pandit — Team Report
  ══════════════════════════════════════════════════

  Alice Johnson   💼 The Professional
  ██████████ 94/100  streak: 12d 🔥
  total: 134  clean: 128  lazy: 2  3am: 1

  Bob Smith       💀 The Savage
  ████████░░ 71/100  streak: 3d 🔥
  total: 89  clean: 52  lazy: 21  3am: 14🦉

  ══════════════════════════════════════════════════
  🏅 Weekly Awards

  🏆  "What does this even mean?" Award
      Winner: Bob Smith
      21 lazy commits like "fix", "update", "misc"

  🦉  "Who Needs Sleep?" Award
      Winner: Bob Smith
      14 commits after 10pm. Please rest!

  🎖️  "Clean Code Hero" Award
      Winner: Alice Johnson
      128 clean conventional commits. Respect!
```

### Streak Tracker
```
  🔥 git-pandit — Streak Report
  ─────────────────────────────
  5-day streak  🔥🔥🔥🔥🔥

  Today's commits:  3
  Active days:      47
  Total commits:    142

  ✅  Committed today! Streak is safe!

  😅 Your most "creative" commit ever:
     "idk why this works but it does"
```

---

## 🏅 Personality Types

| Type | How you earn it |
|---|---|
| 💼 The Professional | 80%+ conventional commits |
| 💀 The Savage | "idk why this works" energy |
| 🦉 Night Owl | 10+ commits after 10pm |
| 🚒 Firefighter | 5+ hotfix/production commits |
| 😴 The Lazy Dev | 50%+ lazy commits like "fix", "update" |
| 😵 No Life Dev | 5+ commits on weekends |
| 📚 The Learner | Improving, 50%+ conventional |
| 🎲 The Chaotic | Unpredictable but creative |

---

## 🛠️ All Commands & Flags

```bash
# Generate commit message (default)
git-pandit
git-pandit generate

# With flags
git-pandit --mood savage           # savage tone
git-pandit --mood poetic           # poetic tone
git-pandit --mood professional     # clean and formal (default)
git-pandit --lang hinglish         # Hinglish language
git-pandit --lang hindi            # Hindi language
git-pandit --lang english          # English (default)
git-pandit --type feat             # force a specific commit type
git-pandit --count 5               # get 5 suggestions instead of 3
git-pandit --provider ollama       # use Ollama for this run
git-pandit --provider openai       # use OpenAI for this run

# Mix and match
git-pandit --mood savage --lang hinglish --count 5

# Personality & streaks
git-pandit score                   # peHrsonal personality report
git-pandit score --team            # full team report with awards
git-pandit score --single          # force single-user mode
git-pandit streak                  # commit streak tracker

# Configuration
git-pandit config --key sk-...         # set OpenAI API key
git-pandit config --provider ollama    # set default provider
git-pandit config --provider openai    # set default provider
git-pandit config --mood savage        # set default mood
git-pandit config --lang hinglish      # set default language
git-pandit config --show               # view current config
```

---

## 💻 Ollama Setup (100% Free & Offline)

```bash
# Step 1 — Install Ollama
# Visit https://ollama.com and download for your OS
# Or on Linux/macOS:
curl https://ollama.ai/install.sh | sh

# Step 2 — Pull a model
ollama pull llama3        # recommended (best quality)
ollama pull mistral       # lighter, faster option
ollama pull phi3          # smallest, good for low-end machines

# Step 3 — Set as default
git-pandit config --provider ollama

# Done! No API key needed, works completely offline.
```

---

## 🔑 OpenAI Setup

```bash
# Option 1 — via CLI
git-pandit config --key sk-your-openai-api-key

# Option 2 — via environment variable
export OPENAI_API_KEY=sk-your-openai-api-key
```

Get your API key at [platform.openai.com](https://platform.openai.com).

> git-pandit uses `gpt-4o-mini` by default — fast and very affordable.

---

## ⚙️ How It Works

```
git add .                    # Stage your changes
     ↓
git-pandit                  # Run the CLI
     ↓
git diff --cached            # Reads your staged diff
     ↓
Sends to AI (OpenAI/Ollama)  # Analyzes the changes
     ↓
3 commit message suggestions # You pick one
     ↓
git commit -m "..."          # Commits automatically
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/ankurojha834/git-pandit

# 3. Install dependencies
npm install

# 4. Test locally
npm link
git-pandit --version

# 5. Create a branch
git checkout -b feat/your-feature

# 6. Make your changes, then submit a PR
```

Please open an issue before starting major changes so we can discuss the approach.

---

## 📋 Changelog

### v2.0.0
- Added Git Personality Score (`git-pandit score`)
- Added Team Report with Awards (`git-pandit score --team`)
- Added Commit Streak Tracker (`git-pandit streak`)
- Added Ollama support (free, offline AI)
- Added Hinglish and Hindi language modes
- Added mood personalities: Professional, Savage, Poetic
- Added Regenerate option in picker

### v1.0.0
- Initial release
- OpenAI-powered commit message generation
- Interactive suggestion picker

---

## 📄 License

MIT © [Ankur Ojha](https://github.com/ankurojha834)

---

## ⭐ Support

If you find this useful, please give it a star on GitHub! It helps others discover the project.

> Built with ❤️ for developers who care about clean git history.
