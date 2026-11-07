class HierarchicalChunker {
  /**
   * Chunks a document into Parent sections and Child steps
   * @param {string} text - Raw document text (markdown or plain text)
   * @param {Object} docMeta - Document metadata
   */
  static processDocument(text, docMeta) {
    const lines = text.split('\n');
    const parents = [];
    let currentParent = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for section headers (Markdown #, ##, ### or SECTION)
      if (line.match(/^#{1,3}\s+/) || line.match(/^(SECTION|CHAPTER|PART)\s+\d+/i)) {
        if (currentParent && currentParent.content.trim().length > 0) {
          parents.push(currentParent);
        }
        currentParent = {
          sectionTitle: line.replace(/^#{1,3}\s+/, ''),
          content: line + '\n',
          children: []
        };
      } else {
        if (!currentParent) {
          currentParent = {
            sectionTitle: 'Introduction & Overview',
            content: '',
            children: []
          };
        }
        currentParent.content += lines[i] + '\n';
      }
    }

    if (currentParent && currentParent.content.trim().length > 0) {
      parents.push(currentParent);
    }

    // Now subdivide each parent into granular Child chunks (~100-250 tokens / numbered steps)
    const result = [];
    parents.forEach((p, pIdx) => {
      const parentObj = {
        chunkType: 'parent',
        sectionTitle: p.sectionTitle,
        content: p.content.trim(),
        metadata: { ...docMeta }
      };

      // Extract granular steps from the parent
      const stepMatches = p.content.split(/\n(?=(?:\d+\.|\bStep\s+\d+:?|-|\*)\s+)/i);
      const childChunks = [];

      stepMatches.forEach((stepText, sIdx) => {
        const trimmed = stepText.trim();
        if (trimmed.length > 20) {
          // Identify step number if present
          const numMatch = trimmed.match(/^(?:Step\s+)?(\d+)[.:]/i);
          childChunks.push({
            chunkType: 'child',
            sectionTitle: p.sectionTitle,
            stepNumber: numMatch ? parseInt(numMatch[1], 10) : sIdx + 1,
            content: trimmed,
            metadata: { ...docMeta }
          });
        }
      });

      result.push({
        parent: parentObj,
        children: childChunks
      });
    });

    return result;
  }
}

module.exports = HierarchicalChunker;

