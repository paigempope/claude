// Builds a single self-contained preview.html (React bundled in, CSS inlined).
// Usage: node examples/preview/build.mjs [outFile]
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const out = process.argv[2] ?? here('./preview.html');

const result = await build({
  entryPoints: [here('./Preview.tsx')],
  bundle: true,
  minify: true,
  format: 'iife',
  write: false,
  jsx: 'automatic',
  loader: { '.css': 'empty' },
  define: { 'process.env.NODE_ENV': '"production"' },
});

const css = ['../../src/styles/tokens.css', '../../src/styles/components.css', './preview.css']
  .map((p) => readFileSync(here(p), 'utf8'))
  .join('\n');
const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

writeFileSync(
  out,
  `<title>Detroit Gift Store UI</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>${css}</style>
<div id="root"></div>
<script>${js}</script>
`,
);
console.log(`Wrote ${out}`);
