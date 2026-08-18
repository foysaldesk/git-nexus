// VS Code Style Diff & Code Viewer with Full Syntax Highlighting
class DiffViewer {
  static render(diffText, containerElement, filename = '') {
    if (!containerElement) return;

    if (!diffText || diffText.trim() === '') {
      containerElement.innerHTML = `
        <div class="diff-empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <p>No changes or binary file</p>
        </div>
      `;
      return;
    }

    const lines = diffText.split('\n');
    let html = '<div class="vscode-diff-wrapper"><div class="vscode-code-table">';

    let oldLineNum = 0;
    let newLineNum = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let lineClass = 'diff-line-normal';
      let oldNumDisplay = '';
      let newNumDisplay = '';
      let prefix = ' ';

      if (line.startsWith('diff --git') || line.startsWith('index ') || line.startsWith('--- ') || line.startsWith('+++ ')) {
        lineClass = 'diff-line-header';
        html += `
          <div class="vscode-code-row ${lineClass}">
            <div class="vscode-line-num vscode-num-old"></div>
            <div class="vscode-line-num vscode-num-new"></div>
            <div class="diff-prefix">&nbsp;</div>
            <div class="vscode-line-content">${this.escapeHtml(line)}</div>
          </div>
        `;
        continue;
      } else if (line.startsWith('@@')) {
        lineClass = 'diff-line-chunk';
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          oldLineNum = parseInt(match[1], 10);
          newLineNum = parseInt(match[2], 10);
        }
        html += `
          <div class="vscode-code-row ${lineClass}">
            <div class="vscode-line-num vscode-num-old">...</div>
            <div class="vscode-line-num vscode-num-new">...</div>
            <div class="diff-prefix">&nbsp;</div>
            <div class="vscode-line-content">${this.escapeHtml(line)}</div>
          </div>
        `;
        continue;
      } else if (line.startsWith('+')) {
        lineClass = 'diff-line-add';
        newNumDisplay = newLineNum++;
        prefix = '+';
      } else if (line.startsWith('-')) {
        lineClass = 'diff-line-del';
        oldNumDisplay = oldLineNum++;
        prefix = '-';
      } else {
        lineClass = 'diff-line-normal';
        oldNumDisplay = oldLineNum++;
        newLineNum++;
        prefix = ' ';
      }

      const rawContent = line.length > 0 ? line.substring(1) : '';
      const highlightedContent = this.highlightSyntax(rawContent, filename);

      html += `
        <div class="vscode-code-row ${lineClass}">
          <div class="vscode-line-num vscode-num-old">${oldNumDisplay !== '' ? oldNumDisplay : ''}</div>
          <div class="vscode-line-num vscode-num-new">${newNumDisplay !== '' ? newNumDisplay : ''}</div>
          <div class="diff-prefix">${prefix}</div>
          <div class="vscode-line-content">${highlightedContent}</div>
        </div>
      `;
    }

    html += '</div></div>';
    containerElement.innerHTML = html;
  }

  static renderFullFile(fileContent, containerElement, filename = '') {
    if (!containerElement) return;

    if (typeof fileContent !== 'string') {
      containerElement.innerHTML = `<div class="diff-empty-state"><p>No content available</p></div>`;
      return;
    }

    const lines = fileContent.split('\n');
    const lang = this.detectLanguage(filename);

    let html = `
      <div class="vscode-editor-wrapper">
        <div class="vscode-editor-statusbar">
          <div class="vscode-status-left">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <span class="vscode-status-filepath">${this.escapeHtml(filename || 'file')}</span>
          </div>
          <div class="vscode-status-right">
            <span class="vscode-badge-lang">${lang.toUpperCase()}</span>
            <span class="vscode-status-lines">${lines.length} lines</span>
          </div>
        </div>
        <div class="vscode-code-table">
    `;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const highlighted = this.highlightSyntax(line, filename);
      html += `
        <div class="vscode-code-row">
          <div class="vscode-line-num">${lineNum}</div>
          <div class="vscode-line-content">${highlighted}</div>
        </div>
      `;
    });

    html += '</div></div>';
    containerElement.innerHTML = html;
  }

  static detectLanguage(filename = '') {
    if (!filename) return 'text';
    const lower = filename.toLowerCase();
    if (lower.endsWith('.php') || lower.endsWith('.phtml')) return 'php';
    if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return 'javascript';
    if (lower.endsWith('.ts') || lower.endsWith('.tsx') || lower.endsWith('.jsx')) return 'typescript';
    if (lower.endsWith('.json') || lower.endsWith('.jsonc')) return 'json';
    if (lower.endsWith('.html') || lower.endsWith('.htm') || lower.endsWith('.blade.php')) return 'html';
    if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.less')) return 'css';
    if (lower.endsWith('.py')) return 'python';
    if (lower.endsWith('.sql')) return 'sql';
    if (lower.endsWith('.md')) return 'markdown';
    if (lower.endsWith('.sh') || lower.endsWith('.bash')) return 'bash';
    if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml';
    return 'code';
  }

  static highlightSyntax(rawLine, filename = '') {
    if (!rawLine) return '&nbsp;';

    // Preserve leading indent spaces as &nbsp;
    let indentCount = 0;
    while (indentCount < rawLine.length && rawLine[indentCount] === ' ') {
      indentCount++;
    }
    const indentHtml = '&nbsp;'.repeat(indentCount);
    const textToHighlight = rawLine.substring(indentCount);
    if (!textToHighlight) return indentHtml || '&nbsp;';

    let s = textToHighlight;

    // Tokens collection to avoid regex overlap collisions
    const tokens = [];
    const saveToken = (html) => {
      const id = `___TOK_${tokens.length}___`;
      tokens.push(html);
      return id;
    };

    // 1. Comments: // ... or /* ... */ or # ...
    s = s.replace(/(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/g, (match) => {
      return saveToken(`<span class="token-comment">${this.escapeText(match)}</span>`);
    });

    // 2. PHP Open / Close Tags
    s = s.replace(/(&lt;\?php|\?&gt;|<\?php|\?>|<\?=)/gi, (match) => {
      return saveToken(`<span class="token-tag">${this.escapeText(match)}</span>`);
    });

    // 3. Strings: single-quote, double-quote, backtick
    s = s.replace(/('([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`)/g, (match) => {
      // Check if it's an associative array key or property: e.g. 'key' => or "key":
      return saveToken(`<span class="token-string">${this.escapeText(match)}</span>`);
    });

    // 4. Variables ($this, $request, $var, etc.)
    s = s.replace(/(\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)/g, (match) => {
      if (match === '$this') {
        return saveToken(`<span class="token-keyword-control">${match}</span>`);
      }
      return saveToken(`<span class="token-variable">${match}</span>`);
    });

    // 5. Control Keywords (return, if, else, try, catch, foreach, etc.)
    const controlKeywords = /\b(return|if|else|elseif|foreach|for|while|do|switch|case|break|continue|default|try|catch|finally|throw|yield|match)\b/g;
    s = s.replace(controlKeywords, (match) => {
      return saveToken(`<span class="token-keyword-control">${match}</span>`);
    });

    // 6. Language Keywords (function, class, public, private, const, let, var, etc.)
    const langKeywords = /\b(function|fn|class|interface|trait|extends|implements|public|private|protected|static|abstract|final|const|let|var|new|use|namespace|import|export|from|as|async|await|typeof|instanceof|echo|print|die|exit|include|require|include_once|require_once|declare|global)\b/g;
    s = s.replace(langKeywords, (match) => {
      return saveToken(`<span class="token-keyword">${match}</span>`);
    });

    // 7. Booleans, Null, and Constants
    s = s.replace(/\b(true|false|null|undefined|NaN|TRUE|FALSE|NULL)\b/g, (match) => {
      return saveToken(`<span class="token-boolean">${match}</span>`);
    });

    // 8. Numbers (integers, floats, hex)
    s = s.replace(/\b(0x[0-9a-fA-F]+|\d+(\.\d+)?)\b/g, (match) => {
      return saveToken(`<span class="token-number">${match}</span>`);
    });

    // 9. Arrow Operators and Methods: =>, ->, ::, ??
    s = s.replace(/(=>|->|::|\?\?|\?:)/g, (match) => {
      return saveToken(`<span class="token-operator">${this.escapeText(match)}</span>`);
    });

    // 10. Functions / Methods calls: name(
    s = s.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()/g, (match) => {
      return saveToken(`<span class="token-function">${match}</span>`);
    });

    // 11. Array Brackets / Braces / Parentheses
    s = s.replace(/([\[\]])/g, (match) => {
      return saveToken(`<span class="token-bracket-square">${match}</span>`);
    });
    s = s.replace(/([{}])/g, (match) => {
      return saveToken(`<span class="token-bracket-curly">${match}</span>`);
    });
    s = s.replace(/([()])/g, (match) => {
      return saveToken(`<span class="token-bracket-round">${match}</span>`);
    });

    // Escape any remaining plain text characters
    s = this.escapeText(s);

    // Restore tokens
    for (let i = 0; i < tokens.length; i++) {
      s = s.replace(`___TOK_${i}___`, tokens[i]);
    }

    return indentHtml + s;
  }

  static escapeText(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/ /g, '&nbsp;');
  }
}

window.DiffViewer = DiffViewer;
