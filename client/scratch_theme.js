const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

const replacements = [
  // Backgrounds & Panels
  { regex: /bg-white\/80\s+dark:glass-panel/g, replacement: 'bg-card shadow-lg' },
  { regex: /bg-white\/80\s+dark:glass-card/g, replacement: 'bg-card shadow-sm' },
  { regex: /bg-white\/50\s+dark:glass-card/g, replacement: 'bg-background-secondary shadow-sm' },
  { regex: /bg-rose-50\s+dark:bg-rose-500\/20/g, replacement: 'bg-background-secondary text-primary' },
  { regex: /glass-panel/g, replacement: 'bg-card' },
  { regex: /glass-card/g, replacement: 'bg-card' },
  { regex: /bg-slate-50\s+dark:bg-plum-900\/[0-9]+/g, replacement: 'bg-background' },

  // Text Primary
  { regex: /text-slate-900\s+dark:text-white/g, replacement: 'text-text-primary' },
  { regex: /text-slate-800\s+dark:text-white/g, replacement: 'text-text-primary' },
  { regex: /text-slate-800\s+dark:text-blush-50/g, replacement: 'text-text-primary' },
  { regex: /text-white\s+dark:text-white/g, replacement: 'text-white' },

  // Text Secondary
  { regex: /text-slate-700\s+dark:text-slate-100/g, replacement: 'text-text-secondary' },
  { regex: /text-slate-600\s+dark:text-slate-200/g, replacement: 'text-text-secondary' },
  { regex: /text-slate-600\s+dark:text-blush-200(\/90)?/g, replacement: 'text-text-secondary' },
  { regex: /text-slate-700\s+dark:text-blush-100/g, replacement: 'text-text-secondary' },

  // Text Muted
  { regex: /text-slate-500\s+dark:text-slate-300/g, replacement: 'text-text-muted' },
  { regex: /text-slate-500\s+dark:text-blush-[345]00(\/[0-9]+)?/g, replacement: 'text-text-muted' },

  // Borders
  { regex: /border-slate-200\s+dark:border-rose-400\/[0-9]+/g, replacement: 'border-border' },
  { regex: /border-rose-200\s+dark:border-rose-400\/[0-9]+/g, replacement: 'border-border' },
  { regex: /border-rose-500\/[0-9]+/g, replacement: 'border-border' },

  // Accents & Buttons
  { regex: /bg-rose-500\s+dark:bg-rose-400/g, replacement: 'bg-primary' },
  { regex: /text-rose-600\s+dark:text-rose-300/g, replacement: 'text-primary' },
  { regex: /text-rose-500\s+dark:text-rose-400/g, replacement: 'text-primary' },
  { regex: /text-rose-500\s+dark:text-rose-300/g, replacement: 'text-primary' },
  { regex: /fill-rose-[0-9]+\s+text-rose-[0-9]+/g, replacement: 'fill-primary text-primary' },
  { regex: /bg-gradient-to-r\s+from-rose-[0-9]+\s+(via-rose-[0-9]+\s+)?to-burgundy-[0-9]+/g, replacement: 'bg-gradient-to-r from-primary to-accent' },
  { regex: /hover:from-rose-[0-9]+\s+hover:to-burgundy-[0-9]+/g, replacement: 'hover:brightness-110' },

  // Glows & Shadows
  { regex: /shadow-rose-900\/[0-9]+/g, replacement: 'shadow-[0_0_15px_var(--glow-color)]' },
  { regex: /shadow-lg\s+shadow-rose-600\/[0-9]+/g, replacement: 'shadow-[0_0_20px_var(--glow-color)]' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(({ regex, replacement }) => {
    content = content.replace(regex, replacement);
  });

  // Small manual cleanup for duplicates that might arise
  content = content.replace(/text-text-primary/g, 'text-[var(--text-primary)]');
  content = content.replace(/text-text-secondary/g, 'text-[var(--text-secondary)]');
  content = content.replace(/text-text-muted/g, 'text-[var(--text-muted)]');
  content = content.replace(/bg-background-secondary/g, 'bg-[var(--background-secondary)]');
  content = content.replace(/bg-background/g, 'bg-[var(--background)]');
  content = content.replace(/bg-card/g, 'bg-[var(--card)]');
  content = content.replace(/border-border/g, 'border-[var(--border)]');
  content = content.replace(/bg-primary/g, 'bg-[var(--primary)]');
  content = content.replace(/text-primary/g, 'text-[var(--primary)]');
  content = content.replace(/text-accent/g, 'text-[var(--accent)]');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated theme classes in: ${path.basename(filePath)}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  });
}

walkDir(directory);
console.log('✅ Master Theme UI Upgrade Complete!');
