async function testMode(mode, message) {
  try {
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, message }),
    });
    const r = await res.json();
    if (res.ok && r.content) {
      return { mode, ok: true, model: r.model, preview: r.content.slice(0, 80) };
    } else {
      return { mode, ok: false, err: r.error || JSON.stringify(r) };
    }
  } catch (e) {
    return { mode, ok: false, err: e.message };
  }
}

(async () => {
  console.log('Testing all 6 StudyBuddy modes on Cloudflare Worker...\n');
  const tests = [
    ['explain', 'What is RAM? One sentence.'],
    ['exam',    'Define CPU. 2 marks.'],
    ['quiz',    'Generate 2 MCQs on binary numbers.'],
    ['summary', 'Summarize: RAM is fast memory. ROM is read-only.'],
    ['code',    'Explain: print("hello")'],
    ['chat',    'Say hi!'],
  ];

  const results = await Promise.all(tests.map(([m, msg]) => testMode(m, msg)));

  results.forEach((r) => {
    const icon = r.ok ? '✅' : '❌';
    const model = r.model ? r.model.split('/').pop() : 'N/A';
    if (r.ok) {
      console.log(`${icon} ${r.mode.padEnd(10)} model: ${model}`);
      console.log(`   Preview: "${r.preview.replace(/\n/g, ' ')}..."\n`);
    } else {
      console.log(`${icon} ${r.mode.padEnd(10)} ERROR: ${r.err}\n`);
    }
  });

  const passed = results.filter((r) => r.ok).length;
  console.log(`\nResult: ${passed}/${results.length} modes working`);
})();
