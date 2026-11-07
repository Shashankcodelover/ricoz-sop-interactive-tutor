/**
 * Enterprise SOP Policy Contradiction & Freshness Detector
 * Solves the critical RAG pathological failure: "Contradicted Claim Vulnerability".
 * Inspects retrieved context for:
 * 1. Policy version divergences across documents covering the same scope.
 * 2. Diverging numerical thresholds (e.g. 45% vs 50%, 30 days vs 60 days).
 * 3. Expired or superseded policy documents based on effective dates.
 */

class PolicyConflictDetector {
  /**
   * Scans a set of retrieved candidate chunks for policy contradictions
   * @param {Array} retrievedCandidates - Array of retrieved chunk candidate objects
   * @param {string} query - The user's operational query
   * @returns {Object|null} Conflict report or null if clear
   */
  static evaluateConflicts(retrievedCandidates, query) {
    if (!retrievedCandidates || retrievedCandidates.length < 2) {
      return null;
    }

    const conflictsFound = [];
    const chunks = retrievedCandidates.map(c => c.chunk);

    // 1. Version Divergence Check across same or related SOP Titles
    const titleGroups = {};
    chunks.forEach(c => {
      const title = c.metadata?.documentTitle || c.sectionTitle || 'General Policy';
      if (!titleGroups[title]) titleGroups[title] = [];
      titleGroups[title].push(c);
    });

    for (const [title, group] of Object.entries(titleGroups)) {
      if (group.length > 1) {
        const versions = [...new Set(group.map(g => g.metadata?.version).filter(Boolean))];
        if (versions.length > 1) {
          conflictsFound.push({
            type: 'VERSION_DIVERGENCE',
            severity: 'HIGH',
            title,
            details: `Found multiple active versions (${versions.join(', ')}) for document "${title}". Policy may have been revised.`,
            documents: group.map(g => ({
              platform: g.metadata?.sourcePlatform,
              version: g.metadata?.version,
              effectiveDate: g.metadata?.effectiveDate,
              url: g.metadata?.sourceUrl
            }))
          });
        }
      }
    }

    // 2. Numerical Threshold & Condition Conflict Analysis
    // Checks for diverging numbers/percentages when answering specific quantitative rules
    const thresholdConflicts = this._detectNumericalThresholdConflicts(chunks);
    if (thresholdConflicts) {
      conflictsFound.push(thresholdConflicts);
    }

    // 3. Temporal Freshness / Superseded Document Check
    const temporalConflicts = this._detectTemporalSupersededPolicies(chunks);
    if (temporalConflicts) {
      conflictsFound.push(temporalConflicts);
    }

    if (conflictsFound.length === 0) {
      return null;
    }

    return {
      hasConflict: true,
      conflictCount: conflictsFound.length,
      conflicts: conflictsFound,
      systemAdvice: "Multiple policy clauses disagree on this operational rule. The Tutor is surfacing both records for authoritative human review rather than guessing."
    };
  }

  static _detectNumericalThresholdConflicts(chunks) {
    const percentagesFound = [];
    chunks.forEach(c => {
      const matches = c.content.match(/\b([0-9]{1,3})%\b/g);
      if (matches) {
        matches.forEach(m => {
          percentagesFound.push({
            value: m,
            docTitle: c.metadata?.documentTitle,
            version: c.metadata?.version
          });
        });
      }
    });

    const uniquePercentages = [...new Set(percentagesFound.map(p => p.value))];
    if (uniquePercentages.length > 1) {
      return {
        type: 'NUMERICAL_THRESHOLD_CONFLICT',
        severity: 'CRITICAL',
        details: `Discrepancy detected across retrieved guidelines with conflicting percentage requirements: ${uniquePercentages.join(' vs ')}.`,
        occurrences: percentagesFound
      };
    }

    return null;
  }

  static _detectTemporalSupersededPolicies(chunks) {
    const docsWithDates = chunks
      .filter(c => c.metadata?.effectiveDate)
      .map(c => ({
        title: c.metadata?.documentTitle,
        version: c.metadata?.version,
        date: new Date(c.metadata?.effectiveDate)
      }))
      .filter(d => !isNaN(d.date.getTime()));

    if (docsWithDates.length >= 2) {
      docsWithDates.sort((a, b) => b.date - a.date);
      const newest = docsWithDates[0];
      const oldest = docsWithDates[docsWithDates.length - 1];

      // If difference is more than 60 days between retrieved documents in same query
      const daysDiff = (newest.date - oldest.date) / (1000 * 60 * 60 * 24);
      if (daysDiff > 60 && newest.title === oldest.title) {
        return {
          type: 'SUPERSEDED_HISTORICAL_RECORD',
          severity: 'MEDIUM',
          details: `Retrieved records span ${Math.round(daysDiff)} days apart. Ensure the ${newest.version || 'latest'} edition governs execution.`
        };
      }
    }

    return null;
  }
}

module.exports = PolicyConflictDetector;

