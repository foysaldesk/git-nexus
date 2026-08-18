// VS Code Style Diff & Code Viewer with Lexical Single-Pass Tokenizer
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
      let prefix = '&nbsp;';

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
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)$/);
        let chunkContext = '';
        if (match) {
          oldLineNum = parseInt(match[1], 10);
          newLineNum = parseInt(match[2], 10);
          if (match[3]) {
            chunkContext = match[3];
          }
        }
        html += `
          <div class="vscode-code-row ${lineClass}">
            <div class="vscode-line-num vscode-num-old">...</div>
            <div class="vscode-line-num vscode-num-new">...</div>
            <div class="diff-prefix">@@</div>
            <div class="vscode-line-content"><span class="diff-chunk-tag">${this.escapeHtml(line.split('@@')[1] ? `@@${line.split('@@')[1]}@@` : line)}</span> <span class="diff-chunk-context">${this.escapeHtml(chunkContext)}</span></div>
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
        prefix = '&nbsp;';
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
            <button class="vscode-btn-copy-code" id="btn-copy-full-content" title="Copy full file content">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Copy</span>
            </button>
            <span class="vscode-badge-lang">${lang.toUpperCase()}</span>
            <span class="vscode-status-lines">${lines.length.toLocaleString()} lines</span>
          </div>
        </div>
        <div class="vscode-code-table">
    `;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      const highlighted = this.highlightSyntax(line, filename);
      html += `
        <div class="vscode-code-row diff-line-normal">
          <div class="vscode-line-num">${lineNum}</div>
          <div class="vscode-line-content">${highlighted}</div>
        </div>
      `;
    });

    html += '</div></div>';
    containerElement.innerHTML = html;

    const copyBtn = containerElement.querySelector('#btn-copy-full-content');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(fileContent);
        const originalHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span style="color: #3fb950; font-weight: 600;">Copied!</span>
        `;
        setTimeout(() => {
          copyBtn.innerHTML = originalHtml;
        }, 1800);
      });
    }
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

  // Pure lexical single-pass tokenizer — never generates placeholder corruptions
  static highlightSyntax(rawLine, filename = '') {
    if (!rawLine) return '&nbsp;';

    // Master tokenizer regex matching tokens in strict priority order
    const tokenizerRegex = /(<\?(?:php|=)?|\?>)|(\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|#[^\r\n]*)|('(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`)|(\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)|(=>|->|::|\?\?|\?:|===|!==|==|!=|<=|>=|\+=|-=|\*=|\/=|&&|\|\||\+\+|--)|([a-zA-Z_][a-zA-Z0-9_]*)(?=\s*\()|(\b\d+(?:\.\d+)?\b|\b0x[0-9a-fA-F]+\b)|([a-zA-Z_][a-zA-Z0-9_]*)|([\[\]])|([{}])|([()])|(\s+)|([^\s\w])/g;

    const controlKeywords = new Set([
      'return', 'if', 'else', 'elseif', 'foreach', 'for', 'while', 'do',
      'switch', 'case', 'break', 'continue', 'default', 'try', 'catch',
      'finally', 'throw', 'yield', 'match'
    ]);

    const generalKeywords = new Set([
      'function', 'fn', 'class', 'interface', 'trait', 'extends', 'implements',
      'public', 'private', 'protected', 'static', 'abstract', 'final', 'const',
      'let', 'var', 'new', 'use', 'namespace', 'import', 'export', 'from',
      'as', 'async', 'await', 'typeof', 'instanceof', 'echo', 'print', 'die',
      'exit', 'include', 'require', 'include_once', 'require_once', 'declare',
      'global', 'void', 'string', 'int', 'bool', 'array', 'object', 'mixed', 'self', 'parent'
    ]);

    const booleansAndNull = new Set([
      'true', 'false', 'null', 'undefined', 'NaN', 'TRUE', 'FALSE', 'NULL'
    ]);

    let out = '';
    let match;

    while ((match = tokenizerRegex.exec(rawLine)) !== null) {
      const [
        full,
        tag,
        comment,
        str,
        variable,
        operator,
        fnCall,
        number,
        word,
        squareBracket,
        curlyBracket,
        roundBracket,
        whitespace,
        other
      ] = match;

      if (tag) {
        out += `<span class="token-tag">${this.escapeText(tag)}</span>`;
      } else if (comment) {
        out += `<span class="token-comment">${this.escapeText(comment)}</span>`;
      } else if (str) {
        out += `<span class="token-string">${this.escapeText(str)}</span>`;
      } else if (variable) {
        if (variable === '$this') {
          out += `<span class="token-keyword-control">${variable}</span>`;
        } else {
          out += `<span class="token-variable">${variable}</span>`;
        }
      } else if (operator) {
        out += `<span class="token-operator">${this.escapeText(operator)}</span>`;
      } else if (fnCall) {
        if (controlKeywords.has(fnCall)) {
          out += `<span class="token-keyword-control">${fnCall}</span>`;
        } else if (generalKeywords.has(fnCall)) {
          out += `<span class="token-keyword">${fnCall}</span>`;
        } else {
          out += `<span class="token-function">${fnCall}</span>`;
        }
      } else if (number) {
        out += `<span class="token-number">${number}</span>`;
      } else if (word) {
        if (controlKeywords.has(word)) {
          out += `<span class="token-keyword-control">${word}</span>`;
        } else if (generalKeywords.has(word)) {
          out += `<span class="token-keyword">${word}</span>`;
        } else if (booleansAndNull.has(word)) {
          out += `<span class="token-boolean">${word}</span>`;
        } else {
          out += this.escapeText(word);
        }
      } else if (squareBracket) {
        out += `<span class="token-bracket-square">${squareBracket}</span>`;
      } else if (curlyBracket) {
        out += `<span class="token-bracket-curly">${curlyBracket}</span>`;
      } else if (roundBracket) {
        out += `<span class="token-bracket-round">${roundBracket}</span>`;
      } else if (whitespace) {
        out += whitespace.replace(/ /g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
      } else if (other) {
        out += this.escapeText(other);
      }
    }

    return out || '&nbsp;';
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
