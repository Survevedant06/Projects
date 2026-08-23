const fs = require('fs');
let c = fs.readFileSync('src/app/submit/page.tsx', 'utf8');
const reps = [
  ['bg-amber-500', 'bg-[#F5C518]'],
  ['bg-amber-600', 'bg-[#F5C518]'],
  ['hover:bg-amber-600', 'hover:bg-[#FFD700]'],
  ['hover:bg-amber-700', 'hover:bg-[#D4A800]'],
  ['text-amber-600', 'text-[#D4A800]'],
  ['text-amber-500', 'text-[#F5C518]'],
  ['border-amber-500', 'border-[#F5C518]'],
  ['bg-amber-50', 'bg-[#F5C518]/10'],
  ['bg-amber-100', 'bg-[#F5C518]/15'],
  ['ring-amber-500', 'ring-[#F5C518]'],
  ['focus:border-amber-500', 'focus:border-[#F5C518]'],
  ['accent-amber-500', 'accent-[#F5C518]'],
  ['bg-stone-50', 'bg-[#0A0A0A]'],
  ['bg-stone-100', 'bg-[#111111]'],
  ['bg-stone-900', 'bg-[#0A0A0A]'],
  ['bg-stone-800', 'bg-[#111111]'],
  ['border-stone-200', 'border-[#2A2A2A]'],
  ['border-stone-700', 'border-[#2A2A2A]'],
  ['text-stone-400', 'text-[#6B6B6B]'],
  ['text-stone-500', 'text-[#6B6B6B]'],
  ['text-stone-600', 'text-[#A0A0A0]'],
  ['text-stone-700', 'text-[#A0A0A0]'],
  ['text-stone-900', 'text-white'],
];
reps.forEach(([f, t]) => { c = c.split(f).join(t); });
fs.writeFileSync('src/app/submit/page.tsx', c);
console.log('Submit page colors fixed!');
