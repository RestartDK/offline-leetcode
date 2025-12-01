// Script to generate problems.json from problems.ts
import { sampleProblems } from '../src/data/problems';
import { writeFileSync } from 'fs';
import { join } from 'path';

const json = JSON.stringify(sampleProblems, null, 2);
const outputPath = join(process.cwd(), 'public', 'problems.json');
writeFileSync(outputPath, json, 'utf-8');
console.log(`Generated ${outputPath} with ${sampleProblems.length} problems`);

