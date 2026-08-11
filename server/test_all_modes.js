const http = require('http');

function testMode(mode, message) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ mode, message });
    const req = http.request({
      hostname: 'localhost', port: 3001,
      path: '/api/chat', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const r = JSON.parse(d);
          if (r.content) resolve({ mode, ok: true, model: r.model, preview: r.content.slice(0, 80) });
          else resolve({ mode, ok: false, err: r.error || JSON.stringify(r) });
        } catch(e) { resolve({ mode, ok: false, err: e.message }); }
      });
    });
    req.on('error', e => resolve({ mode, ok: false, err: e.message }));
    req.write(body);
    req.end();
  });
}

(async () => {
  console.log('Testing all 6 StudyBuddy modes...\n');
  const tests = [
    ['explain', 'What is RAM? One sentence.'],
    ['exam',    'Define CPU. 2 marks.'],
    ['quiz',    'Generate 2 MCQs on binary numbers.'],
    ['summary', 'Summarize: RAM is fast memory. ROM is read-only.'],
    ['code',    'Explain: print("hello")'],
    ['chat',    'Say hi!'],
  ];

  const results = await Promise.all(tests.map(([m, msg]) => testMode(m, msg)));

  results.forEach(r => {
    const icon = r.ok ? '✅' : '❌';
    const model = r.model ? r.model.split('/').pop() : 'N/A';
    if (r.ok) {
      console.log(`${icon} ${r.mode.padEnd(10)} model: ${model}`);
      console.log(`   Preview: "${r.preview}..."\n`);
    } else {
      console.log(`${icon} ${r.mode.padEnd(10)} ERROR: ${r.err}\n`);
    }
  });

  const passed = results.filter(r => r.ok).length;
  console.log(`\nResult: ${passed}/${results.length} modes working`);
})();
