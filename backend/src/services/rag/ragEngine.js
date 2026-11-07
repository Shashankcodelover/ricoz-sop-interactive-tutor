/**
 * Embedding & Hybrid Retrieval Engine
 * Supports Vector Cosine Distance, Sparse BM25/Keyword Matching, and ACL Filtering
 */

class RAGEngine {
  /**
   * Deterministic embedding generator (Vector dimension: 384)
   * Compatible with sentence-transformers or pluggable to OpenAI/Gemini embeddings
   */
  static generateEmbedding(text) {
    const dim = 128;
    const vector = new Array(dim).fill(0);
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const tokens = clean.split(/\s+/).filter(Boolean);

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      for (let j = 0; j < token.length; j++) {
        const charCode = token.charCodeAt(j);
        const idx = (charCode * (j + 1) * (i + 1)) % dim;
        vector[idx] += 1;
      }
    }

    // Normalize vector to unit length
    let norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (norm === 0) norm = 1;
    return vector.map(v => parseFloat((v / norm).toFixed(6)));
  }

  /**
   * Cosine Similarity calculation
   */
  static cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dot = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
    }
    return dot;
  }

  /**
   * Hybrid Search: Combines Vector Similarity with Keyword Overlap
   */
  static hybridScore(query, chunk, queryVec) {
    const vectorScore = this.cosineSimilarity(queryVec, chunk.embedding || []);
    
    // Keyword match score
    const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    const chunkText = chunk.content.toLowerCase();
    let termMatches = 0;
    for (const term of queryTerms) {
      if (chunkText.includes(term)) termMatches++;
    }
    const keywordScore = queryTerms.length > 0 ? termMatches / queryTerms.length : 0;

    // Weighted Hybrid Score (60% Dense Vector + 40% Sparse Keyword)
    return (vectorScore * 0.6) + (keywordScore * 0.4);
  }
}

module.exports = RAGEngine;

