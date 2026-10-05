const runButton = document.querySelector('#run');
const results = document.querySelector('#results');

runButton.addEventListener('click', async () => {
  const stylesheet = await fetch('/assets/detective.css');
  const clues = await fetch('/api/clues?case=missing-cookie');
  const verdict = await fetch('/api/verdicts', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ caseId: 'missing-cookie', verdict: 'cookie-jar' })
  });

  results.textContent = JSON.stringify({
    stylesheet: await stylesheet.text(),
    clues: await clues.json(),
    verdict: await verdict.json()
  }, null, 2);
});
