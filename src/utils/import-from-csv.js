import fs from 'node:fs';

import { parse } from 'csv-parse';

const csvPath = new URL('./tasks.csv', import.meta.url);

const stream = fs.createReadStream(csvPath);

const csvParse = parse({
  delimiter: ',',
  skipEmptyLines: true,
  fromLine: 2,
});

async function importFromCsv() {
  const rowsParse = stream.pipe(csvParse);

  for await (const row of rowsParse) {
    const [title, description] = row;

    await fetch('http://localhost:3333/tasks', {
      method: 'POST',
      headers: {
        'Context-type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    });
  }
}
importFromCsv();
