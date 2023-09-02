import * as fs from 'node:fs';
import * as path from 'path';
import * as url from 'url';
import { compile } from 'json-schema-to-typescript';

const dirname = path.dirname(url.fileURLToPath(import.meta.url));

async function main() {
  let schemasPath = path.join(dirname);
  let schemaFiles = fs
    .readdirSync(schemasPath)
    .filter((x) => x === 'schema.json');

  // Compile all types, stripping out duplicates. This is a bit dumb but the easiest way to
  // do it since we can't suppress generation of definition references.
  let compiledTypes = new Set();
  for (let filename of schemaFiles) {
    let filePath = path.join(schemasPath, filename);
    let schema = JSON.parse(fs.readFileSync(filePath));
    let compiled = await compile(schema, schema.title, { bannerComment: '' });

    let eachType = compiled.split('export');
    for (let type of eachType) {
      if (!type) {
        continue;
      }
      compiledTypes.add('export ' + type.trim());
    }
  }

  let output = Array.from(compiledTypes).join('\n\n').replace(/For_/gm, 'For');
  let outputPath = path.join(dirname, 'src', 'types.d.ts');

  try {
    let existing = fs.readFileSync(outputPath);
    if (existing == output) {
      // Skip writing if it hasn't changed, so that we don't confuse any sort of incremental builds.
      // This check isn't ideal but the script runs quickly enough and rarely enough that it doesn't matter.
      console.log('Schemas are up to date');
      return;
    }
  } catch (e) {
    // It's fine if there's no output from a previous run.
    if (e.code !== 'ENOENT') {
      throw e;
    }
  }

  fs.writeFileSync(outputPath, output);
  console.log(`Wrote Typescript types to ${outputPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
