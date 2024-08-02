import { writeFileSync } from 'node:fs';
import chanceSetup from 'jest-chance';
import * as process from 'process';

export const setup = () => {
  process.env.TZ = 'GMT';

  const chanceSeed = chanceSetup();
  const filePath = process.env.GITHUB_STEP_SUMMARY;
  if (filePath) {
    const markdown = `
### Repeat the test with

\`CHANCE_SEED=${chanceSeed} ${process.env.npm_lifecycle_script}\`
`;
    writeFileSync(filePath, markdown, 'utf8');
  }

  // @ts-ignore
  process.env.FORCE_COLOR = 0;
  console.log('Turning colours off in chalk for test consistency');
};
