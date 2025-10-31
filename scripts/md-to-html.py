#!/usr/bin/env python3
"""
Convert BuildRight markdown documentation to dark-themed HTML reports.
Uses GitHub Dark color palette with interactive features.
"""

import re
import sys
import html as html_module

def md_to_id(text):
    """Convert heading text to HTML ID (lowercase, hyphenated)"""
    # Remove markdown formatting and special chars
    text = re.sub(r'[*_`\[\]():]', '', text)
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text.lower().strip())
    return text.strip('-')

def extract_toc(md_content):
    """Extract h2 and h3 headings for TOC"""
    toc = []
    for match in re.finditer(r'^(#{2,3})\s+(.+)$', md_content, re.MULTILINE):
        level = len(match.group(1))
        text = match.group(2).strip()
        heading_id = md_to_id(text)
        toc.append({'level': level, 'text': text, 'id': heading_id})
    return toc

def convert_tables(html_content):
    """Convert markdown tables to HTML"""
    def table_replacer(match):
        lines = match.group(0).strip().split('\n')
        if len(lines) < 2:
            return match.group(0)

        # Parse header row
        header_cells = [cell.strip() for cell in lines[0].split('|')[1:-1]]

        # Skip separator line (lines[1])

        # Parse data rows
        data_rows = []
        for line in lines[2:]:
            cells = [cell.strip() for cell in line.split('|')[1:-1]]
            if cells:  # Skip empty lines
                data_rows.append(cells)

        # Generate HTML
        html = '<div class="table-wrapper"><table>\n<thead>\n<tr>'
        for header in header_cells:
            html += f'<th>{header}</th>'
        html += '</tr>\n</thead>\n<tbody>\n'

        for row in data_rows:
            html += '<tr>'
            for cell in row:
                html += f'<td>{cell}</td>'
            html += '</tr>\n'

        html += '</tbody>\n</table></div>\n'
        return html

    # Match table blocks (lines starting with |)
    pattern = r'(?:^\|.+\|$\n?)+'
    return re.sub(pattern, table_replacer, html_content, flags=re.MULTILINE)

def convert_code_blocks(html_content):
    """Convert ```language code blocks to HTML with Prism.js classes"""
    def code_replacer(match):
        language = match.group(1) or ''
        code = match.group(2)
        # Escape HTML in code
        code_escaped = html_module.escape(code)
        lang_class = f'language-{language}' if language else ''
        return f'<pre><code class="{lang_class}">{code_escaped}</code></pre>'

    # Match ```language\ncode\n```
    pattern = r'```(\w*)\n(.*?)```'
    return re.sub(pattern, code_replacer, html_content, flags=re.DOTALL)

def convert_blockquotes(html_content):
    """Convert > blockquotes to HTML"""
    def blockquote_replacer(match):
        content = match.group(1)
        # Remove > from each line
        lines = [line.lstrip('> ').strip() for line in content.split('\n')]
        text = ' '.join(lines)
        return f'<blockquote><p>{text}</p></blockquote>'

    # Match > blockquote lines
    pattern = r'^((?:>\s+.+\n?)+)'
    return re.sub(pattern, blockquote_replacer, html_content, flags=re.MULTILINE)

def convert_inline_elements(html_content):
    """Convert **bold**, *italic*, `code`, [links](url)"""
    # Bold: **text** or __text__
    html_content = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html_content)
    html_content = re.sub(r'__(.+?)__', r'<strong>\1</strong>', html_content)

    # Italic: *text* or _text_ (but not in middle of words)
    html_content = re.sub(r'(?<!\w)\*(.+?)\*(?!\w)', r'<em>\1</em>', html_content)
    html_content = re.sub(r'(?<!\w)_(.+?)_(?!\w)', r'<em>\1</em>', html_content)

    # Inline code: `text`
    html_content = re.sub(r'`([^`]+)`', r'<code>\1</code>', html_content)

    # Links: [text](url)
    html_content = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html_content)

    return html_content

def convert_headings(html_content):
    """Convert ## Headings to <h2 id="heading">Headings</h2>"""
    def heading_replacer(match):
        level = len(match.group(1))
        text = match.group(2).strip()
        heading_id = md_to_id(text)
        return f'<h{level} id="{heading_id}">{text}</h{level}>'

    # Match h2-h6 (h1 handled separately as title)
    pattern = r'^(#{2,6})\s+(.+)$'
    return re.sub(pattern, heading_replacer, html_content, flags=re.MULTILINE)

def convert_lists(html_content):
    """Convert - bullets and 1. numbered lists to <ul>/<ol>"""
    # Unordered lists: - item or * item
    def ul_replacer(match):
        items = match.group(0).strip().split('\n')
        html = '<ul>\n'
        for item in items:
            # Remove leading - or * and whitespace
            text = re.sub(r'^[-*]\s+', '', item).strip()
            if text:
                html += f'<li>{text}</li>\n'
        html += '</ul>\n'
        return html

    # Match consecutive lines starting with - or *
    pattern = r'^(?:[-*]\s+.+\n?)+'
    html_content = re.sub(pattern, ul_replacer, html_content, flags=re.MULTILINE)

    # Ordered lists: 1. item
    def ol_replacer(match):
        items = match.group(0).strip().split('\n')
        html = '<ol>\n'
        for item in items:
            # Remove leading number. and whitespace
            text = re.sub(r'^\d+\.\s+', '', item).strip()
            if text:
                html += f'<li>{text}</li>\n'
        html += '</ol>\n'
        return html

    # Match consecutive lines starting with digit.
    pattern = r'^(?:\d+\.\s+.+\n?)+'
    html_content = re.sub(pattern, ol_replacer, html_content, flags=re.MULTILINE)

    return html_content

def convert_paragraphs(html_content):
    """Wrap text lines in <p> tags"""
    lines = html_content.split('\n')
    result = []
    in_html_block = False

    for line in lines:
        stripped = line.strip()

        # Skip empty lines
        if not stripped:
            result.append('')
            in_html_block = False
            continue

        # Check if line is already HTML
        if stripped.startswith('<') or stripped.startswith('---'):
            result.append(line)
            in_html_block = True
            continue

        # If not in HTML block and not empty, wrap in <p>
        if not in_html_block:
            result.append(f'<p>{stripped}</p>')
        else:
            result.append(line)

    return '\n'.join(result)

def generate_toc_html(toc):
    """Generate TOC HTML from headings list"""
    html = '<ul class="toc-nav">\n'
    for item in toc:
        level = item['level']
        text = item['text']
        heading_id = item['id']

        if level == 2:
            html += f'<li><a href="#{heading_id}">{html_module.escape(text)}</a></li>\n'
        elif level == 3:
            html += f'<li class="toc-level-3"><a href="#{heading_id}">{html_module.escape(text)}</a></li>\n'

    html += '</ul>'
    return html

def generate_html(md_content, title, toc):
    """Generate complete HTML document with embedded CSS/JS"""

    # Convert markdown to HTML
    html_content = md_content

    # Remove title (first h1)
    html_content = re.sub(r'^#\s+.+$', '', html_content, count=1, flags=re.MULTILINE)

    # Convert in specific order to avoid conflicts
    html_content = convert_code_blocks(html_content)
    html_content = convert_tables(html_content)
    html_content = convert_headings(html_content)
    html_content = convert_blockquotes(html_content)
    html_content = convert_lists(html_content)
    html_content = convert_inline_elements(html_content)
    html_content = convert_paragraphs(html_content)

    # Remove horizontal rules (---) as they become empty after conversion
    html_content = re.sub(r'<p>---</p>', '<hr>', html_content)

    # Generate TOC HTML
    toc_html = generate_toc_html(toc)

    # Read CSS and JS from this file (embedded below)
    css = get_embedded_css()
    js = get_embedded_js()

    # Generate complete HTML
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{html_module.escape(title)}">
    <title>{html_module.escape(title)}</title>

    <!-- Prism.js for syntax highlighting -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">

    <style>
{css}
    </style>
</head>
<body>
    <!-- Skip to content link (accessibility) -->
    <a href="#main-content" class="skip-to-content">Skip to content</a>

    <!-- Reading progress bar -->
    <div class="progress-bar" role="progressbar" aria-label="Reading progress">
        <div class="progress-bar-fill"></div>
    </div>

    <!-- Mobile menu toggle -->
    <button class="mobile-menu-toggle" aria-label="Toggle navigation menu" aria-expanded="false">
        <span></span>
        <span></span>
        <span></span>
    </button>

    <!-- Layout container -->
    <div class="layout-container">
        <!-- Sidebar TOC -->
        <nav class="sidebar" role="navigation" aria-label="Table of contents">
            <div class="sidebar-header">
                <div class="sidebar-title">Table of Contents</div>
                <div class="sidebar-subtitle">Navigation</div>
            </div>
            {toc_html}
        </nav>

        <!-- Main content -->
        <main class="main-content" id="main-content" role="main">
            <h1>{html_module.escape(title)}</h1>
            {html_content}
        </main>
    </div>

    <!-- Back to top button -->
    <button class="back-to-top" aria-label="Back to top" title="Back to top">
        ↑
    </button>

    <!-- Prism.js for syntax highlighting -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>

    <script>
{js}
    </script>
</body>
</html>'''

    return html

def get_embedded_css():
    """Return embedded CSS (GitHub Dark theme)"""
    return '''        /* ========================================
           CSS VARIABLES - GitHub Dark Color Palette
           ======================================== */
        :root {
            --bg-primary: #0d1117;
            --bg-secondary: #161b22;
            --bg-tertiary: #21262d;
            --text-primary: #e6edf3;
            --text-secondary: #8b949e;
            --text-tertiary: #6e7681;
            --accent-primary: #58a6ff;
            --accent-secondary: #1f6feb;
            --success: #3fb950;
            --warning: #d29922;
            --error: #f85149;
            --info: #58a6ff;
            --border-color: #30363d;
            --border-muted: #21262d;
            --code-bg: #161b22;
            --sidebar-width: 250px;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            font-size: 16px;
            line-height: 1.7;
            color: var(--text-primary);
            background-color: var(--bg-primary);
            overflow-x: hidden;
        }

        .skip-to-content {
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--accent-primary);
            color: var(--bg-primary);
            padding: 8px 16px;
            text-decoration: none;
            z-index: 100;
            border-radius: 0 0 4px 0;
        }

        .skip-to-content:focus {
            top: 0;
        }

        .progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
            background: var(--bg-secondary);
            z-index: 1000;
        }

        .progress-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
            width: 0%;
            transition: width 0.1s ease;
        }

        .layout-container {
            display: flex;
            min-height: 100vh;
            padding-top: 3px;
        }

        .sidebar {
            position: fixed;
            top: 3px;
            left: 0;
            width: var(--sidebar-width);
            height: calc(100vh - 3px);
            background: var(--bg-secondary);
            border-right: 1px solid var(--border-color);
            overflow-y: auto;
            padding: 24px;
            z-index: 100;
        }

        .sidebar-header {
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-color);
        }

        .sidebar-title {
            font-size: 1.1em;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 4px;
        }

        .sidebar-subtitle {
            font-size: 0.85em;
            color: var(--text-secondary);
        }

        .toc-nav {
            list-style: none;
        }

        .toc-nav li {
            margin-bottom: 8px;
        }

        .toc-nav a {
            display: block;
            color: var(--text-secondary);
            text-decoration: none;
            padding: 6px 12px;
            border-radius: 4px;
            transition: all 0.2s ease;
            font-size: 0.9em;
        }

        .toc-nav a:hover {
            color: var(--accent-primary);
            background: var(--bg-tertiary);
        }

        .toc-nav a.active {
            color: var(--accent-primary);
            background: var(--bg-tertiary);
            font-weight: 500;
        }

        .toc-nav .toc-level-3 {
            margin-left: 16px;
            font-size: 0.85em;
        }

        .main-content {
            margin-left: var(--sidebar-width);
            flex: 1;
            padding: 40px 60px;
            max-width: 1200px;
        }

        .mobile-menu-toggle {
            display: none;
            position: fixed;
            top: 16px;
            left: 16px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 10px 12px;
            cursor: pointer;
            z-index: 1001;
            transition: background 0.2s ease;
        }

        .mobile-menu-toggle:hover {
            background: var(--bg-tertiary);
        }

        .mobile-menu-toggle span {
            display: block;
            width: 24px;
            height: 2px;
            background: var(--text-primary);
            margin: 5px 0;
            transition: all 0.3s ease;
        }

        .mobile-menu-toggle.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }

        .mobile-menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }

        .mobile-menu-toggle.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }

        h1, h2, h3, h4, h5, h6 {
            color: var(--text-primary);
            font-weight: 600;
            line-height: 1.3;
            margin-top: 1.5em;
            margin-bottom: 0.75em;
            scroll-margin-top: 20px;
        }

        h1 {
            font-size: 2.5em;
            margin-top: 0;
            padding-bottom: 0.3em;
            border-bottom: 2px solid var(--border-color);
        }

        h2 {
            font-size: 2em;
            padding-bottom: 0.3em;
            border-bottom: 1px solid var(--border-color);
        }

        h3 {
            font-size: 1.5em;
        }

        h4 {
            font-size: 1.25em;
        }

        p {
            margin-bottom: 1em;
            color: var(--text-primary);
        }

        a {
            color: var(--accent-primary);
            text-decoration: none;
            transition: color 0.2s ease;
        }

        a:hover {
            color: var(--accent-secondary);
            text-decoration: underline;
        }

        strong {
            font-weight: 600;
            color: var(--text-primary);
        }

        em {
            font-style: italic;
            color: var(--text-primary);
        }

        ul, ol {
            margin-bottom: 1em;
            padding-left: 2em;
        }

        li {
            margin-bottom: 0.5em;
            color: var(--text-primary);
        }

        code {
            background: var(--code-bg);
            color: var(--text-primary);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 0.9em;
            border: 1px solid var(--border-muted);
        }

        pre {
            background: var(--code-bg);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 16px;
            overflow-x: auto;
            margin-bottom: 1em;
        }

        pre code {
            background: none;
            padding: 0;
            border: none;
            font-size: 0.85em;
            line-height: 1.5;
        }

        blockquote {
            border-left: 4px solid var(--accent-primary);
            background: var(--bg-secondary);
            padding: 16px 20px;
            margin: 1em 0;
            color: var(--text-secondary);
            font-style: italic;
            border-radius: 0 4px 4px 0;
        }

        .table-wrapper {
            overflow-x: auto;
            margin-bottom: 1em;
            border: 1px solid var(--border-color);
            border-radius: 6px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: var(--bg-secondary);
        }

        thead {
            background: var(--bg-tertiary);
        }

        th {
            padding: 12px 16px;
            text-align: left;
            font-weight: 600;
            color: var(--text-primary);
            border-bottom: 2px solid var(--border-color);
        }

        td {
            padding: 12px 16px;
            color: var(--text-primary);
            border-bottom: 1px solid var(--border-color);
        }

        tr:last-child td {
            border-bottom: none;
        }

        tbody tr:hover {
            background: var(--bg-tertiary);
        }

        hr {
            border: none;
            border-top: 1px solid var(--border-color);
            margin: 2em 0;
        }

        .back-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: var(--accent-primary);
            color: var(--bg-primary);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
            font-size: 24px;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
            border: none;
        }

        .back-to-top:hover {
            background: var(--accent-secondary);
            transform: translateY(-4px);
        }

        .back-to-top.visible {
            opacity: 1;
            visibility: visible;
        }

        @media (max-width: 1023px) {
            .sidebar {
                transform: translateX(-100%);
                transition: transform 0.3s ease;
            }

            .sidebar.active {
                transform: translateX(0);
            }

            .mobile-menu-toggle {
                display: block;
            }

            .main-content {
                margin-left: 0;
                padding: 80px 40px 40px 40px;
            }
        }

        @media (max-width: 640px) {
            .main-content {
                padding: 80px 20px 40px 20px;
            }

            h1 {
                font-size: 2em;
            }

            h2 {
                font-size: 1.5em;
            }

            .back-to-top {
                bottom: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                font-size: 20px;
            }
        }'''

def get_embedded_js():
    """Return embedded JavaScript"""
    return '''        function updateProgressBar() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;
            const progressBar = document.querySelector('.progress-bar-fill');
            if (progressBar) {
                progressBar.style.width = Math.min(scrollPercent, 100) + '%';
            }
        }

        function updateActiveSection() {
            const sections = document.querySelectorAll('h2[id], h3[id]');
            const tocLinks = document.querySelectorAll('.toc-nav a');
            let currentSection = null;
            const scrollPosition = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollPosition >= sectionTop) {
                    currentSection = section;
                }
            });

            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (currentSection && link.getAttribute('href') === '#' + currentSection.id) {
                    link.classList.add('active');
                }
            });
        }

        function updateBackToTopButton() {
            const backToTop = document.querySelector('.back-to-top');
            if (backToTop) {
                if (window.scrollY > 300) {
                    backToTop.classList.add('visible');
                } else {
                    backToTop.classList.remove('visible');
                }
            }
        }

        function throttle(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        const handleScroll = throttle(() => {
            updateProgressBar();
            updateActiveSection();
            updateBackToTopButton();
        }, 16);

        window.addEventListener('scroll', handleScroll);

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const sidebar = document.querySelector('.sidebar');
                    const menuToggle = document.querySelector('.mobile-menu-toggle');
                    if (sidebar && sidebar.classList.contains('active')) {
                        sidebar.classList.remove('active');
                        menuToggle.classList.remove('active');
                        menuToggle.setAttribute('aria-expanded', 'false');
                    }

                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        document.querySelector('.back-to-top')?.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                const isActive = sidebar.classList.toggle('active');
                menuToggle.classList.toggle('active');
                menuToggle.setAttribute('aria-expanded', isActive.toString());
            });

            document.addEventListener('click', (e) => {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            updateProgressBar();
            updateActiveSection();
            updateBackToTopButton();
            console.log('BuildRight HTML Report: Interactive features initialized');
        });'''

def main():
    if len(sys.argv) < 3:
        print("Usage: python md-to-html.py input.md output.html")
        sys.exit(1)

    input_file = sys.argv[1]
    output_file = sys.argv[2]

    # Read markdown
    with open(input_file, 'r', encoding='utf-8') as f:
        md_content = f.read()

    # Extract title (first h1)
    title_match = re.search(r'^#\s+(.+)$', md_content, re.MULTILINE)
    title = title_match.group(1) if title_match else "Document"

    # Extract TOC
    toc = extract_toc(md_content)

    # Convert to HTML
    html_content = generate_html(md_content, title, toc)

    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"✓ Generated {output_file}")
    print(f"  - Title: {title}")
    print(f"  - TOC items: {len(toc)}")
    print(f"  - File size: {len(html_content):,} bytes")

if __name__ == '__main__':
    main()
