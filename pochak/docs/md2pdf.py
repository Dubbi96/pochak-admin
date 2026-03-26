#!/usr/bin/env python3
"""Convert POCHAK_POLICY.md to PDF using markdown + HTML + subprocess(wkhtmltopdf or chrome)"""
import markdown
import sys
import subprocess
import os

def md_to_html(md_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        md_content = f.read()

    extensions = ['tables', 'fenced_code', 'toc', 'codehilite']
    html_body = markdown.markdown(md_content, extensions=extensions)

    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<title>Pochak OTT Platform - Service Policy Document</title>
<style>
@page {{
    size: A4;
    margin: 20mm 15mm 20mm 15mm;
}}
body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Noto Sans KR', sans-serif;
    font-size: 11px;
    line-height: 1.6;
    color: #1a1a1a;
    max-width: 100%;
    padding: 0;
    margin: 0;
}}
h1 {{
    font-size: 24px;
    color: #111;
    border-bottom: 3px solid #2563eb;
    padding-bottom: 10px;
    margin-top: 30px;
    page-break-after: avoid;
}}
h2 {{
    font-size: 18px;
    color: #1e40af;
    border-bottom: 1px solid #ddd;
    padding-bottom: 6px;
    margin-top: 28px;
    page-break-after: avoid;
}}
h3 {{
    font-size: 14px;
    color: #1e3a5f;
    margin-top: 20px;
    page-break-after: avoid;
}}
h4 {{
    font-size: 12px;
    color: #374151;
    margin-top: 16px;
    page-break-after: avoid;
}}
table {{
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    font-size: 10px;
    page-break-inside: avoid;
}}
th {{
    background-color: #f0f4ff;
    border: 1px solid #d1d5db;
    padding: 6px 8px;
    text-align: left;
    font-weight: 600;
    color: #1e40af;
}}
td {{
    border: 1px solid #d1d5db;
    padding: 5px 8px;
    vertical-align: top;
}}
tr:nth-child(even) {{
    background-color: #f9fafb;
}}
code {{
    background-color: #f3f4f6;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 10px;
    font-family: 'SF Mono', 'Menlo', monospace;
}}
pre {{
    background-color: #1e293b;
    color: #e2e8f0;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 10px;
    overflow-x: auto;
    page-break-inside: avoid;
    line-height: 1.5;
}}
pre code {{
    background: none;
    padding: 0;
    color: #e2e8f0;
    font-size: 10px;
}}
blockquote {{
    border-left: 4px solid #2563eb;
    margin: 16px 0;
    padding: 10px 16px;
    background-color: #eff6ff;
    color: #1e3a5f;
    font-size: 11px;
}}
hr {{
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 24px 0;
}}
ul, ol {{
    padding-left: 24px;
}}
li {{
    margin-bottom: 3px;
}}
a {{
    color: #2563eb;
    text-decoration: none;
}}
.cover {{
    text-align: center;
    padding: 120px 40px 60px;
    page-break-after: always;
}}
.cover h1 {{
    font-size: 36px;
    border: none;
    color: #1e40af;
    margin-bottom: 8px;
}}
.cover .subtitle {{
    font-size: 20px;
    color: #475569;
    margin-bottom: 60px;
}}
.cover .meta {{
    font-size: 13px;
    color: #6b7280;
    line-height: 2;
}}
</style>
</head>
<body>

<div class="cover">
    <h1>POCHAK</h1>
    <div class="subtitle">OTT Platform Service Policy Document</div>
    <div class="meta">
        Version: 1.0.0-DRAFT<br>
        Date: 2026-03-24<br>
        Status: DRAFT - Review Required<br><br>
        <em>Pochak OTT Platform MSA Architecture</em><br>
        <em>6 Microservices + 1 Gateway + 3 Frontend Apps</em>
    </div>
</div>

{html_body}
</body>
</html>"""
    return html

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    md_path = os.path.join(script_dir, 'POCHAK_POLICY.md')
    html_path = os.path.join(script_dir, 'POCHAK_POLICY.html')
    pdf_path = os.path.join(script_dir, 'POCHAK_POLICY.pdf')

    print(f"Converting {md_path} to HTML...")
    html = md_to_html(md_path)

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"HTML saved: {html_path}")

    # Try Chrome/Chromium headless PDF
    chrome_paths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Chromium.app/Contents/MacOS/Chromium',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
        '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    ]

    chrome = None
    for p in chrome_paths:
        if os.path.exists(p):
            chrome = p
            break

    if chrome:
        print(f"Using: {os.path.basename(chrome)}")
        result = subprocess.run([
            chrome,
            '--headless',
            '--disable-gpu',
            '--no-sandbox',
            '--print-to-pdf=' + pdf_path,
            '--print-to-pdf-no-header',
            'file://' + os.path.abspath(html_path)
        ], capture_output=True, text=True, timeout=30)

        if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 0:
            size_kb = os.path.getsize(pdf_path) / 1024
            print(f"PDF saved: {pdf_path} ({size_kb:.0f} KB)")
            return 0
        else:
            print(f"Chrome PDF failed: {result.stderr[:200]}")

    print(f"\nHTML file is ready at: {html_path}")
    print("Open it in a browser and use Print > Save as PDF")
    return 1

if __name__ == '__main__':
    sys.exit(main())
