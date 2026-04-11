// @ts-check
const fs = require('fs');
const path = require('path');

const resultsPath = path.join(__dirname, 'test-reports', 'login-e2e-results.json');
const outputPath = path.join(__dirname, 'test-reports', 'login-e2e.html');

const data = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));

function flattenSpecs(suites, parentTitle = '') {
  const specs = [];
  for (const suite of suites || []) {
    const title = parentTitle ? `${parentTitle} > ${suite.title}` : suite.title;
    if (suite.specs) {
      for (const spec of suite.specs) {
        const result = spec.tests?.[0]?.results?.[0];
        const status = spec.tests?.[0]?.status || 'unknown';
        const ok = status === 'expected' || status === 'passed';
        const error = result?.error?.message || result?.error || '';
        specs.push({
          suite: suite.title,
          title: spec.title,
          fullTitle: `${title} > ${spec.title}`,
          ok,
          status,
          duration: result?.duration || 0,
          error: typeof error === 'string' ? error : JSON.stringify(error),
        });
      }
    }
    if (suite.suites) {
      specs.push(...flattenSpecs(suite.suites, title));
    }
  }
  return specs;
}

const specs = flattenSpecs(data.suites);
const stats = data.stats;

const passed = specs.filter(s => s.ok).length;
const failed = specs.filter(s => !s.ok).length;
const total = specs.length;
const duration = (stats.duration / 1000).toFixed(1);
const runDate = new Date(stats.startTime).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

// Group by suite
const bySuite = {};
for (const spec of specs) {
  if (!bySuite[spec.suite]) bySuite[spec.suite] = [];
  bySuite[spec.suite].push(spec);
}

// Known bugs extracted from test errors
const bugs = [
  {
    id: 'BUG-001',
    severity: 'CRITICAL',
    service: 'Web (localhost:3300)',
    title: 'Web 서비스 미실행',
    description: 'localhost:3300 포트에서 Web 서비스(public-web)가 실행되지 않음. 모든 웹 로그인 테스트 블로킹.',
    tests: ['Web 서비스 가용성 확인', 'Web 정상 로그인', 'Web /my 리다이렉트'],
  },
  {
    id: 'BUG-002',
    severity: 'HIGH',
    service: 'BO (localhost:3000)',
    title: '로그인 API 빈 응답 반환 (토큰 없음)',
    description: 'GET /admin/api/v1/auth/login → HTTP 200 응답이지만 body가 비어있음 (content-length: 0). 프론트엔드에서 JSON 파싱 실패로 "서버에 연결할 수 없습니다." 에러 표시. 관리자 로그인 불가.',
    tests: ['BO 정상 로그인 → 대시보드 진입'],
  },
  {
    id: 'BUG-003',
    severity: 'HIGH',
    service: 'Partner (localhost:3200)',
    title: 'CORS 정책 위반 - 파트너 로그인 엔드포인트',
    description: "브라우저에서 localhost:3200 → localhost:8080/api/v1/auth/partner/login 요청 시 CORS 정책 차단. 'Access-Control-Allow-Origin' 헤더 없음. 파트너 로그인 불가.",
    tests: ['Partner 정상 로그인 → 대시보드 진입'],
  },
];

function severityBadge(sev) {
  const colors = { CRITICAL: '#dc2626', HIGH: '#ea580c', MEDIUM: '#d97706', LOW: '#65a30d' };
  return `<span style="background:${colors[sev]||'#6b7280'};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">${sev}</span>`;
}

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>POCHAK 로그인 E2E 테스트 리포트</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f3f4f6; color: #111827; }
    .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #fff; padding: 32px 40px; }
    .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .header .meta { font-size: 13px; opacity: 0.8; }
    .container { max-width: 960px; margin: 0 auto; padding: 32px 20px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
    .card { background: #fff; border-radius: 12px; padding: 20px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .card .value { font-size: 36px; font-weight: 800; }
    .card .label { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .pass { color: #16a34a; }
    .fail { color: #dc2626; }
    .section { background: #fff; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .section h2 { font-size: 16px; font-weight: 700; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
    .bug-item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .bug-item.critical { border-left: 4px solid #dc2626; }
    .bug-item.high { border-left: 4px solid #ea580c; }
    .bug-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .bug-id { font-size: 11px; font-weight: 600; color: #6b7280; }
    .bug-title { font-size: 14px; font-weight: 600; color: #111827; }
    .bug-service { font-size: 12px; color: #2563eb; background: #eff6ff; padding: 2px 8px; border-radius: 4px; }
    .bug-desc { font-size: 13px; color: #374151; line-height: 1.5; margin-top: 8px; }
    .test-row { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
    .test-row:last-child { border-bottom: none; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; margin-top: 4px; }
    .status-dot.pass { background: #16a34a; }
    .status-dot.fail { background: #dc2626; }
    .test-title { font-size: 13px; color: #374151; flex: 1; }
    .test-suite { font-size: 11px; color: #9ca3af; }
    .test-error { font-size: 12px; color: #dc2626; margin-top: 4px; background: #fef2f2; padding: 6px 8px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; word-break: break-all; }
    .test-duration { font-size: 11px; color: #9ca3af; flex-shrink: 0; }
    .recommendations { background: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; }
    .recommendations ul { padding-left: 20px; }
    .recommendations li { font-size: 13px; color: #374151; margin-bottom: 6px; line-height: 1.5; }
    .footer { text-align: center; font-size: 12px; color: #9ca3af; padding: 24px; }
  </style>
</head>
<body>
<div class="header">
  <h1>POCHAK 로그인 E2E 테스트 리포트</h1>
  <div class="meta">실행일시: ${runDate} &nbsp;|&nbsp; 실행 시간: ${duration}초 &nbsp;|&nbsp; QA Agent: qa-engineer</div>
</div>

<div class="container">

  <!-- Summary -->
  <div class="summary">
    <div class="card">
      <div class="value">${total}</div>
      <div class="label">전체 테스트</div>
    </div>
    <div class="card">
      <div class="value pass">${passed}</div>
      <div class="label">통과</div>
    </div>
    <div class="card">
      <div class="value fail">${failed}</div>
      <div class="label">실패</div>
    </div>
    <div class="card">
      <div class="value" style="color:#f59e0b">${bugs.length}</div>
      <div class="label">발견된 버그</div>
    </div>
  </div>

  <!-- Bugs Found -->
  <div class="section">
    <h2>🐛 발견된 버그</h2>
    ${bugs.map(b => `
    <div class="bug-item ${b.severity.toLowerCase()}">
      <div class="bug-header">
        <span class="bug-id">${b.id}</span>
        ${severityBadge(b.severity)}
        <span class="bug-service">${b.service}</span>
      </div>
      <div class="bug-title">${b.title}</div>
      <div class="bug-desc">${b.description}</div>
    </div>
    `).join('')}
  </div>

  <!-- Test Results -->
  <div class="section">
    <h2>📋 테스트 결과 상세</h2>
    ${specs.map(spec => `
    <div class="test-row">
      <div class="status-dot ${spec.ok ? 'pass' : 'fail'}"></div>
      <div style="flex:1">
        <div class="test-suite">${spec.suite}</div>
        <div class="test-title">${spec.title}</div>
        ${!spec.ok && spec.error ? `<div class="test-error">${spec.error.replace(/\x1b\[[0-9;]*m/g, '').substring(0, 300)}</div>` : ''}
      </div>
      <div class="test-duration">${(spec.duration / 1000).toFixed(1)}s</div>
    </div>
    `).join('')}
  </div>

  <!-- Recommendations -->
  <div class="section">
    <h2>💡 조치 권고사항</h2>
    <div class="recommendations">
      <ul>
        <li><strong>[BUG-001 / CRITICAL]</strong> Web 서비스(localhost:3300) 실행 확인 및 재시작 필요. public-web 또는 web-front 앱 기동 절차 점검 요망.</li>
        <li><strong>[BUG-002 / HIGH]</strong> 백엔드 <code>/admin/api/v1/auth/login</code> 엔드포인트가 HTTP 200 응답 시 JWT 토큰을 응답 body에 포함하지 않음. identity-service 또는 gateway의 admin 로그인 핸들러에서 응답 직렬화 로직 확인 필요.</li>
        <li><strong>[BUG-003 / HIGH]</strong> Gateway에서 <code>/api/v1/auth/partner/login</code> 엔드포인트에 대한 CORS 헤더(<code>Access-Control-Allow-Origin: http://localhost:3200</code>) 누락. Gateway CORS 설정에서 partner 도메인(3200) 허용 추가 필요.</li>
        <li>추가 확인: Partner LoginPage가 최근 <code>/api/v1/auth/partner/login</code>에서 <code>/api/v1/auth/login</code>으로 변경되었으나 현재 실행 중인 dev server에 반영되지 않았을 수 있음. 서버 재기동 후 재테스트 권고.</li>
      </ul>
    </div>
  </div>

</div>
<div class="footer">Generated by POCHAK QA Agent &middot; ${new Date().toISOString()}</div>
</body>
</html>`;

fs.writeFileSync(outputPath, html, 'utf-8');
console.log(`HTML report generated: ${outputPath}`);
