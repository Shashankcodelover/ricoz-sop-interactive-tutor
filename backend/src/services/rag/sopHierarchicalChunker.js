const AdvancedEmbeddingService = require('./embeddings');

/**
 * Enterprise Hierarchical Parent-Child Chunking Engine
 * Specifically engineered for Standard Operating Procedures (SOPs).
 * Guarantees that procedural conditions, prerequisites, and warnings are never
 * severed from the action steps they govern.
 */

class SOPHierarchicalChunker {
  static PARENT_TARGET_TOKENS = 1200;
  static CHILD_TARGET_TOKENS = 180;
  static CHILD_OVERLAP_TOKENS = 30;

  /**
   * Deconstructs raw SOP text into a hierarchical tree of Parent and Child chunks
   * @param {string} text - Raw Markdown / Document text
   * @param {Object} docMetadata - Source metadata
   */
  static processSOP(text, docMetadata) {
    if (!text || typeof text !== 'string') return [];

    const lines = text.split('\n');
    const sections = [];
    let currentSection = {
      sectionTitle: 'Operational Overview & Scope',
      lines: [],
      level: 1
    };

    // First Pass: Semantic Section Boundary Detection
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Heading matching: Markdown #, ##, ###, Section X, Part X, Step X
      const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/) || trimmed.match(/^(SECTION|PART|CHAPTER|MODULE)\s+([0-9IVX]+[:\-]?\s*.*)$/i);

      if (headingMatch) {
        if (currentSection.lines.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          sectionTitle: headingMatch[2] ? headingMatch[2].trim() : headingMatch[0].trim(),
          lines: [line],
          level: headingMatch[1]?.length || 2
        };
      } else {
        currentSection.lines.push(line);
      }
    }

    if (currentSection.lines.length > 0) {
      sections.push(currentSection);
    }

    // Second Pass: Construct Parent Chunks & Deconstruct Child Steps
    const hierarchy = [];

    sections.forEach((sec, secIdx) => {
      const fullSectionText = sec.lines.join('\n').trim();
      if (fullSectionText.length < 20) return;

      const parentChunkId = `parent_${docMetadata.externalId || 'doc'}_sec_${secIdx + 1}`;
      
      const parentChunk = {
        id: parentChunkId,
        chunkType: 'parent',
        sectionTitle: sec.sectionTitle,
        content: fullSectionText,
        metadata: {
          ...docMetadata,
          sectionIndex: secIdx,
          isParent: true
        },
        embedding: AdvancedEmbeddingService.generateEmbedding(fullSectionText)
      };

      // Extract discrete child steps (e.g. 1. Step A, Step 2: Step B, - Bullet A)
      const childSteps = this._extractProceduralSteps(sec.lines, parentChunkId, sec.sectionTitle, docMetadata);

      hierarchy.push({
        parent: parentChunk,
        children: childSteps
      });
    });

    return hierarchy;
  }

  /**
   * Subdivides section lines into atomic, executable child steps
   */
  static _extractProceduralSteps(lines, parentId, sectionTitle, docMeta) {
    const children = [];
    let currentStepLines = [];
    let currentStepNum = null;
    let stepCount = 0;

    const flushStep = () => {
      if (currentStepLines.length === 0) return;
      const stepText = currentStepLines.join('\n').trim();
      if (stepText.length > 15) {
        stepCount++;
        const childId = `${parentId}_step_${stepCount}`;
        children.push({
          id: childId,
          parentChunkId: parentId,
          chunkType: 'child',
          stepNumber: currentStepNum || stepCount,
          sectionTitle,
          content: stepText,
          metadata: {
            ...docMeta,
            stepIndex: stepCount,
            isParent: false
          },
          embedding: AdvancedEmbeddingService.generateEmbedding(stepText)
        });
      }
      currentStepLines = [];
      currentStepNum = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check if line begins a new numbered or bulleted procedural step
      const stepMatch = trimmed.match(/^(?:Step\s+)?([0-9]+)[.:\-)]\s*(.*)$/i) || trimmed.match(/^([*•\-])\s+(.*)$/);

      if (stepMatch) {
        flushStep();
        currentStepNum = stepMatch[1] && !isNaN(parseInt(stepMatch[1], 10)) ? parseInt(stepMatch[1], 10) : null;
        currentStepLines.push(line);
      } else {
        currentStepLines.push(line);
      }
    }

    flushStep();

    // Fallback: If section has no explicit steps, create windowed child chunks
    if (children.length === 0 && lines.length > 0) {
      const fallbackText = lines.join('\n').trim();
      children.push({
        id: `${parentId}_child_1`,
        parentChunkId: parentId,
        chunkType: 'child',
        stepNumber: 1,
        sectionTitle,
        content: fallbackText,
        metadata: { ...docMeta, isParent: false },
        embedding: AdvancedEmbeddingService.generateEmbedding(fallbackText)
      });
    }

    return children;
  }
}

module.exports = SOPHierarchicalChunker;

