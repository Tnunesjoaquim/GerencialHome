const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Replace all dark:*slate* with dark:*zinc*
      // Example: dark:bg-slate-900 -> dark:bg-zinc-900
      // Example: dark:border-slate-800 -> dark:border-zinc-800
      // Example: dark:text-slate-400 -> dark:text-zinc-400
      
      // A regex that finds dark: followed by anything, then -slate-, then numbers/opacity
      // We only want to replace the word 'slate' with 'zinc' IF it's preceded by 'dark:'
      
      // To do this safely:
      content = content.replace(/dark:([a-z0-9\-]+)-slate-([0-9]+)/g, 'dark:$1-zinc-$2');
      
      // Also dark:bg-slate-950/20 -> dark:bg-zinc-950/20
      content = content.replace(/dark:([a-z0-9\-]+)-slate-([0-9]+\/[0-9]+)/g, 'dark:$1-zinc-$2');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('./app');
processDir('./components');
console.log('Successfully switched Dark Mode strictly to Zinc scale');
