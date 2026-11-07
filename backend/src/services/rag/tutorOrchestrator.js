const EnterpriseHybridRetriever = require('./hybridRetriever');
const PolicyConflictDetector = require('./policyConflictDetector');

/**
 * Enterprise Interactive SOP Tutor Orchestrator
 * Transforms static retrieved document chunks into stateful, step-by-step guidance
 * with prerequisite validation, explicit source attribution, and policy conflict safeguards.
 */

class InteractiveSOPTutorOrchestrator {
  /**
   * Executes complete RAG & Tutoring Pipeline
   * @param {string} question - Employee operational inquiry
   * @param {Array} childChunks - Pool of child step chunks
   * @param {Array} parentChunks - Pool of parent section chunks
   * @returns {Object} Structured Tutor Response Payload
   */
  static processQuery(question, childChunks, parentChunks) {
    if (!question || typeof question !== 'string') {
      return {
        answer: "Please enter an operational procedure or policy question.",
        steps: [],
        citations: [],
        conflictReport: null,
        relevanceScore: 0
      };
    }

    // 1. Execute Hybrid Retrieval
    const searchResults = EnterpriseHybridRetriever.search(question, childChunks, {
      topK: 4,
      denseWeight: 0.65,
      sparseWeight: 0.35,
      scoreThreshold: 0.12,
      elevateToParent: true,
      parentPool: parentChunks
    });

    if (searchResults.length === 0) {
      return {
        answer: "I could not find an authorized Standard Operating Procedure (SOP) or company policy covering this question. To prevent procedural violations, please consult your department manager or submit a policy clarification ticket.",
        steps: [],
        citations: [],
        conflictReport: null,
        relevanceScore: 0
      };
    }

    // 2. Pre-Generation Policy Conflict & Contradiction Evaluation
    const conflictReport = PolicyConflictDetector.evaluateConflicts(searchResults, question);

    // 3. Extract Primary Target Content (prefer parent context if elevated)
    const topResult = searchResults[0];
    const contextContent = topResult.parentContext ? topResult.parentContext.content : topResult.chunk.content;
    const docTitle = topResult.chunk.metadata?.documentTitle || 'Company Standard Operating Procedure';
    const sourcePlatform = topResult.chunk.metadata?.sourcePlatform || 'internal';
    const version = topResult.chunk.metadata?.version || '1.0';

    // 4. Procedural Step Extraction & Prerequisite Mapping
    const rawLines = contextContent.split('\n');
    const steps = [];
    let stepIndex = 0;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();
      const stepMatch = line.match(/^(?:Step\s+)?([0-9]+)[.:\-)]\s*(.*)$/i) || line.match(/^([*•\-])\s+(.*)$/);

      if (stepMatch && line.length > 20) {
        stepIndex++;
        const instruction = line.replace(/^(?:Step\s+)?([0-9]+)[.:\-)]\s*/i, '').replace(/^([*•\-])\s*/, '').trim();
        
        steps.push({
          stepNumber: stepIndex,
          instruction,
          prerequisites: stepIndex === 1 
            ? ["Verify employee identity and operational authorization"] 
            : [`Successful completion of Step ${stepIndex - 1}`],
          isCompleted: false
        });
      }
    }

    // Fallback if no numbered steps detected: wrap sentences
    if (steps.length === 0) {
      const sentences = contextContent.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 25);
      sentences.slice(0, 5).forEach((sent, sIdx) => {
        steps.push({
          stepNumber: sIdx + 1,
          instruction: sent,
          prerequisites: sIdx === 0 ? ["Verify policy authorization"] : [`Complete step ${sIdx}`],
          isCompleted: false
        });
      });
    }

    // 5. Compile Verifiable Citations (Deduplicated)
    const citationsMap = new Map();
    searchResults.forEach(res => {
      const meta = res.chunk.metadata;
      if (meta && meta.sourceUrl) {
        citationsMap.set(meta.sourceUrl, {
          sourcePlatform: meta.sourcePlatform || 'internal',
          documentTitle: meta.documentTitle || docTitle,
          sourceUrl: meta.sourceUrl,
          sectionOrPage: res.chunk.sectionTitle || 'Operational Clause',
          version: meta.version || version
        });
      }
    });

    const citations = Array.from(citationsMap.values());

    // 6. Formulate Conversational Synthesis
    let answerHeader = `According to the authorized **${docTitle}** (Version ${version}, Source: ${sourcePlatform.toUpperCase()}):\n\nHere is your sequential step-by-step operational procedure:`;

    if (conflictReport && conflictReport.hasConflict) {
      answerHeader = `⚠️ **POLICY ADVISORY: MULTIPLE DOCUMENT EDITIONS IDENTIFIED**\n*${conflictReport.systemAdvice}*\n\n` + answerHeader;
    }

    const answer = `${answerHeader}

${steps.map(s => `**Step ${s.stepNumber}:** ${s.instruction}`).join('\n\n')}

---
*Notice: Adhere strictly to the sequential prerequisite order above. Mark each step as complete in the Interactive Stepper once executed.*`;

    return {
      success: true,
      question,
      answer,
      steps,
      citations,
      conflictReport,
      relevanceScore: topResult.finalScore,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = InteractiveSOPTutorOrchestrator;

