const RAGEngine = require('../rag/ragEngine');

class SOPInteractiveTutor {
  /**
   * Pre-Generation Policy Conflict & Freshness Detector
   * Evaluates retrieved candidate chunks for contradictory rules or outdated versions
   */
  static detectConflicts(retrievedChunks) {
    if (retrievedChunks.length < 2) return null;

    // Check version discrepancies across same category documents
    const categories = {};
    for (const item of retrievedChunks) {
      const cat = item.chunk.metadata?.documentTitle || 'Default';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item.chunk);
    }

    const conflicts = [];
    for (const [title, chunks] of Object.entries(categories)) {
      if (chunks.length > 1) {
        // Compare dates/versions if multiple differing chunks exist
        const versions = [...new Set(chunks.map(c => c.metadata?.version).filter(Boolean))];
        if (versions.length > 1) {
          conflicts.push(`Multiple versions found for [${title}] (Versions: ${versions.join(', ')}). Possible policy divergence detected.`);
        }
      }
    }

    return conflicts.length > 0 ? conflicts.join(' | ') : null;
  }

  /**
   * Interactive Tutor Response Synthesis
   * Deconstructs standard documents into sequential operational steps with prerequisites & citations
   */
  static generateTutorGuidance(query, retrievedChunks) {
    if (!retrievedChunks || retrievedChunks.length === 0) {
      return {
        answer: "I could not find an authorized SOP or official documentation addressing your query. To prevent policy violations, please escalate this question to your department manager or HR lead.",
        citations: [],
        steps: [],
        conflictAlert: null
      };
    }

    const topChunk = retrievedChunks[0].chunk;
    const conflictAlert = this.detectConflicts(retrievedChunks);

    // Extract procedural steps
    const stepLines = topChunk.content.split('\n')
      .map(l => l.trim())
      .filter(l => l.match(/^(?:\d+\.|\bStep\s+\d+:?|-|\*)\s+/i));

    const steps = stepLines.map((line, idx) => ({
      stepNumber: idx + 1,
      instruction: line.replace(/^(?:\d+\.|\bStep\s+\d+:?|-|\*)\s+/i, ''),
      prerequisites: idx === 0 ? ["Verify identity and document authorization"] : [`Completion of Step ${idx}`],
      isCompleted: false
    }));

    // Citations extracted strictly from verified source chunks
    const citations = retrievedChunks.map(rc => ({
      sourcePlatform: rc.chunk.metadata?.sourcePlatform || 'internal_sop',
      documentTitle: rc.chunk.metadata?.documentTitle || 'Company Policy Document',
      sourceUrl: rc.chunk.metadata?.sourceUrl || '#',
      sectionOrPage: rc.chunk.sectionTitle || 'General Clause'
    })).filter((v, i, a) => a.findIndex(t => t.sourceUrl === v.sourceUrl) === i); // Deduplicate

    const answer = `Based on the official **${topChunk.metadata?.documentTitle || 'SOP'}** (Source: ${topChunk.metadata?.sourcePlatform?.toUpperCase() || 'DOCUMENTATION'}), here is your guided step-by-step procedure:

${steps.length > 0 ? steps.map(s => `**Step ${s.stepNumber}:** ${s.instruction}`).join('\n\n') : topChunk.content}

*All actions must be performed in sequential order to ensure full compliance.*`;

    return {
      answer,
      steps,
      citations,
      conflictAlert
    };
  }
}

module.exports = SOPInteractiveTutor;

