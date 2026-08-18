// Diff Parser and Renderer
class DiffViewer {
  static render(diffText, containerElement) {
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
    let html = '<div class="diff-container"><div class="diff-table">';

    let oldLineNum = 0;
    let newLineNum = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let lineClass = 'diff-line-normal';
      let oldNumDisplay = '';
      let newNumDisplay = '';
      let prefix = ' ';

      if (line.startsWith('diff --git') || line.startsWith('index ') || line.startsWith('--- ') || line.startsWith('+++ ')) {
        // Header line
        lineClass = 'diff-line-header';
        html += `
          <div class="diff-row ${lineClass}">
            <div class="diff-num diff-num-old"></div>
            <div class="diff-num diff-num-new"></div>
            <div class="diff-content">${this.escapeHtml(line)}</div>
          </div>
        `;
        continue;
      } else if (line.startsWith('@@')) {
        // Chunk header: @@ -1,5 +1,6 @@
        lineClass = 'diff-line-chunk';
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          oldLineNum = parseInt(match[1], 10);
          newLineNum = parseInt(match[2], 10);
        }
        html += `
          <div class="diff-row ${lineClass}">
            <div class="diff-num diff-num-old">...</div>
            <div class="diff-num diff-num-new">...</div>
            <div class="diff-content">${this.escapeHtml(line)}</div>
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

      const content = line.length > 0 ? line.substring(1) : '';
      html += `
        <div class="diff-row ${lineClass}">
          <div class="diff-num diff-num-old">${oldNumDisplay !== '' ? oldNumDisplay : ''}</div>
          <div class="diff-num diff-num-new">${newNumDisplay !== '' ? newNumDisplay : ''}</div>
          <div class="diff-prefix">${prefix}</div>
          <div class="diff-content">${this.escapeHtml(content)}</div>
        </div>
      `;
    }

    html += '</div></div>';
    containerElement.innerHTML = html;
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
