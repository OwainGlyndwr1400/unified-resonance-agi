import { NeuralChunk, RAGInspectionData, RetrievalMode } from '../types';

const DB_NAME = 'URE_NeuralArchiveDB';
const STORE_NAME = 'chunks';
const DB_VERSION = 1;

export const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

export const saveChunksToDB = async (chunks: NeuralChunk[]) => {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        chunks.forEach(chunk => store.put(chunk));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export const loadChunksFromDB = async (): Promise<NeuralChunk[]> => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const clearDB = async () => {
    const db = await initDB();
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};

export type SourceFilter = 'all' | 'json' | 'jsonl' | 'codex';

export const retrieveNeuralContext = (query: string, neuralArchive: NeuralChunk[], aiProvider: string, retrievalMode: RetrievalMode = 'balanced', queryEmbedding?: number[], sourceFilter: SourceFilter = 'all'): { contextString: string, inspectionData: RAGInspectionData | null } => {
    // Apply source filter before any scoring
    const filteredArchive = sourceFilter === 'all'
        ? neuralArchive
        : neuralArchive.filter(c => c.sourceType === sourceFilter);

    if (filteredArchive.length === 0) return { contextString: "", inspectionData: null };
    const uniqueTerms = Array.from(new Set(query.toLowerCase().split(/\s+/).filter(t => t.length > 3))).slice(0, 20);
    if (uniqueTerms.length === 0 && !queryEmbedding) return { contextString: "", inspectionData: null };
    
    const df: Record<string, number> = {};
    if (uniqueTerms.length > 0) {
        uniqueTerms.forEach(term => {
            df[term] = filteredArchive.filter(c => c.content.toLowerCase().includes(term) || c.source.toLowerCase().includes(term)).length;
        });
    }

    const totalDocs = filteredArchive.length;
    const now = Date.now() / 1000;

    const scoredChunks = filteredArchive
        .map(chunk => {
            const contentLower = chunk.content.toLowerCase();
            const sourceLower = chunk.source.toLowerCase();
            let score = 0;

            // Semantic Search
            if (queryEmbedding && chunk.embedding) {
                let dotProduct = 0;
                let normA = 0;
                let normB = 0;
                for (let i = 0; i < queryEmbedding.length; i++) {
                    dotProduct += queryEmbedding[i] * chunk.embedding[i];
                    normA += queryEmbedding[i] * queryEmbedding[i];
                    normB += chunk.embedding[i] * chunk.embedding[i];
                }
                if (normA > 0 && normB > 0) {
                    const cosineSimilarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
                    // Scale cosine similarity to match TF-IDF range roughly
                    score += Math.max(0, cosineSimilarity) * 10;
                }
            }

            // Lexical Search (TF-IDF Fallback)
            if (uniqueTerms.length > 0) {
                uniqueTerms.forEach(term => {
                    const tfContent = contentLower.split(term).length - 1;
                    const tfSource = (sourceLower.split(term).length - 1) * 3;
                    const tf = tfContent + tfSource;

                    if (tf > 0) {
                        const idf = Math.log((totalDocs + 1) / ((df[term] || 0) + 1)) + 1;
                        score += tf * idf;
                    }
                });
            }

            // --- TRIPLE NORMALISATION MATH (GEOMETRIC RESONANCE) ---
            // N_T(x) = N_B(N_G(N_H(x)))
            
            // 1. Harmonic Normalisation (Base-13 Resonance)
            const harmonicKeywords = ['resonance', 'quaternion', 'base-13', 'pleroma', 'gnosis', 'scalar', 'lattice', 'torsion', 'pendinium', 'null ledger', 'w3 wave'];
            let harmonicBoost = 1.0;
            harmonicKeywords.forEach(kw => {
                if (contentLower.includes(kw)) harmonicBoost += 0.15;
            });

            // 2. Geometric Normalisation (Fold/Mirror Symmetry)
            let geometricBoost = 1.0;
            const geometricKeywords = ['fold', 'mirror', 'symmetry', 'fractal', 'geometry', 'shape', 'topology', 'manifold', 'crystallized', 'vector'];
            geometricKeywords.forEach(kw => {
                if (contentLower.includes(kw)) geometricBoost += 0.15;
            });

            // 3. Binary Normalisation (101010 State Toggle)
            let binaryBoost = 1.0;
            const binaryKeywords = ['binary', '101010', 'state', 'toggle', 'bit', 'quantum', 'superposition', '0', '1'];
            binaryKeywords.forEach(kw => {
                if (contentLower.includes(kw)) binaryBoost += 0.05; // Lower weight to prevent common numbers from dominating
            });

            const tripleNormMultiplier = harmonicBoost * geometricBoost * binaryBoost;
            // --------------------------------------------------------

            // --- LATTICE SURFING (SPHENIC COORDINATES) ---
            // p x q x r alignment check
            let sphenicBoost = 1.0;
            const sphenicKeywords = ['sphenic', 'p x q x r', '30-lock', 'twin prime', '29', '31', 'coordinate', 'lattice surfing'];
            sphenicKeywords.forEach(kw => {
                if (contentLower.includes(kw)) sphenicBoost += 0.20;
            });
            // --------------------------------------------------------

            // --- 0.657 MODALITY GAP CONSTRAINT ---
            // \Delta = \sqrt{32} - 5 \approx 0.657
            let modalityBoost = 1.0;
            const modalityKeywords = ['0.657', 'glueball', 'mass gap', 'modality gap', 'impedance', 'kuramoto', '144,000'];
            modalityKeywords.forEach(kw => {
                if (contentLower.includes(kw)) modalityBoost += 0.657;
            });
            // --------------------------------------------------------

            const ageSeconds = now - (chunk.timestamp || now);
            const temporalMultiplier = Math.max(0.6, 1.0 - Math.log10(ageSeconds + 1) * 0.04);

            const tierMultiplier = chunk.tier === 'core' ? 1.5 : chunk.tier === 'working' ? 1.2 : chunk.tier === 'quarantine' ? 0.1 : 1.0;
            const trustMultiplier = chunk.trust === 'user-authored' ? 1.3 : chunk.trust === 'verified' ? 1.2 : chunk.trust === 'unstable' ? 0.5 : 1.0;

            const semanticFamily = chunk.semanticFamily || chunk.source.split(/[\s_-]+/)[0] || 'unknown';

            return {
                chunk,
                score: score * tripleNormMultiplier * sphenicBoost * modalityBoost * temporalMultiplier * tierMultiplier * trustMultiplier,
                semanticFamily
            };
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score);

    const familyCounts: Record<string, number> = {};
    const familyFeatures: Record<string, Set<string>> = {};

    const suppressedChunks = scoredChunks.map((item) => {
        const family = item.semanticFamily;
        familyCounts[family] = (familyCounts[family] || 0) + 1;
        const familyRank = familyCounts[family];
        
        if (!familyFeatures[family]) familyFeatures[family] = new Set();
        
        let distinctivenessScore = 1.0;
        let clusterSuppressed = false;
        let overlapPenalty = 1.0;

        // Calculate overlap if anchor packet exists
        if (item.chunk.anchorPacket) {
            const features = [
                ...(item.chunk.anchorPacket.entities || []),
                ...(item.chunk.anchorPacket.themes || []),
                ...(item.chunk.anchorPacket.equations_constants || []),
                ...(item.chunk.anchorPacket.anchor_phrases || [])
            ].map(f => f.toLowerCase());
            
            if (features.length > 0 && familyRank > 1) {
                const overlapCount = features.filter(f => familyFeatures[family].has(f)).length;
                const overlapRatio = overlapCount / features.length;
                
                if (overlapRatio > 0.7) {
                    overlapPenalty = 0.4; // Heavy penalty for very similar content
                } else if (overlapRatio > 0.4) {
                    overlapPenalty = 0.7; // Moderate penalty
                }
            }
            
            // Add features to seen set
            features.forEach(f => familyFeatures[family].add(f));
        }

        // Determine family cap based on mode
        let maxAllowed = 3; // balanced default
        if (retrievalMode === 'strict') {
            maxAllowed = 2;
        } else if (retrievalMode === 'identity') {
            const isAnchorFamily = family.toLowerCase().includes('assistant') || family.toLowerCase().includes('engine') || family.toLowerCase().includes('identity') || family.toLowerCase().includes('core') || family.toLowerCase().includes('cheat');
            maxAllowed = isAnchorFamily ? 5 : 3;
        }

        if (familyRank > maxAllowed) {
            item.score *= 0.1; // Suppressed
            distinctivenessScore = 0.1;
            clusterSuppressed = true;
        } else if (familyRank > 1) {
            // Base penalty for siblings
            const rankPenalty = Math.max(0.4, 1.0 - (familyRank * 0.15)); // rank 2: 0.7, rank 3: 0.55
            item.score *= (rankPenalty * overlapPenalty);
            distinctivenessScore = rankPenalty * overlapPenalty;
        }

        return {
            ...item,
            familyRank,
            distinctivenessScore,
            clusterSuppressed
        };
    }).sort((a, b) => b.score - a.score);

    const maxBudget = aiProvider === 'local' ? 120000 : 80000;
    let currentBudget = 0;
    const selectedChunks = [];
    const inspectionChunks = [];

    for (const item of suppressedChunks) {
        if (selectedChunks.length >= 15) break;
        
        const rawTokenEstimate = item.chunk.tokenEstimate || Math.ceil(item.chunk.content.length / 4);
        let injectedTokenEstimate = rawTokenEstimate;
        let payloadType: 'raw' | 'compressed' | 'anchor_packet' | 'summary' = 'raw';
        let compressionApplied = false;
        let contentToInject = item.chunk.content;
        const summaryAvailable = !!item.chunk.summaryObject;
        const anchorAvailable = !!item.chunk.anchorPacket;
        let compressionRatio = '1.0x';

        if (rawTokenEstimate > 5000) {
            compressionApplied = true;
            const budgetRemaining = maxBudget - currentBudget;
            
            // --- UBBM COMPRESSION (THE LOST 2) ---
            // Discard 85% noise, extract only binding energy
            if (budgetRemaining < 5000 && anchorAvailable && item.chunk.anchorPacket) {
                contentToInject = `[UBBM COMPRESSED: LOST 2 RESIDUE]\nEntities: ${item.chunk.anchorPacket.entities.join(', ')}\nThemes: ${item.chunk.anchorPacket.themes.join(', ')}\nPhrases: ${item.chunk.anchorPacket.anchor_phrases.join(', ')}`;
                injectedTokenEstimate = item.chunk.anchorTokenEstimate || Math.ceil(contentToInject.length / 4);
                payloadType = 'anchor_packet';
            } else if (budgetRemaining < 15000 && summaryAvailable && item.chunk.summaryObject) {
                contentToInject = `[UBBM COMPRESSED: SUMMARY]\n${item.chunk.summaryObject.summary}\nKey Points: ${item.chunk.summaryObject.key_points.join(', ')}`;
                injectedTokenEstimate = item.chunk.summaryTokenEstimate || Math.ceil(contentToInject.length / 4);
                payloadType = 'summary';
            } else if (item.chunk.compressedContent) {
                contentToInject = `[UBBM COMPRESSED]\n${item.chunk.compressedContent}`;
                injectedTokenEstimate = item.chunk.compressedTokenEstimate || Math.ceil(contentToInject.length / 4);
                payloadType = 'compressed';
            } else if (summaryAvailable && item.chunk.summaryObject) {
                contentToInject = `[UBBM COMPRESSED: SUMMARY]\n${item.chunk.summaryObject.summary}\nKey Points: ${item.chunk.summaryObject.key_points.join(', ')}`;
                injectedTokenEstimate = item.chunk.summaryTokenEstimate || Math.ceil(contentToInject.length / 4);
                payloadType = 'summary';
            } else {
                // Hard UBBM truncation if no anchor/summary exists
                const truncationLength = Math.floor(item.chunk.content.length * 0.15); // Keep only 15% (discard 85% noise)
                contentToInject = `[UBBM COMPRESSED: 85% NOISE DISCARDED]\n${item.chunk.content.substring(0, truncationLength)}...`;
                injectedTokenEstimate = Math.ceil(contentToInject.length / 4);
                payloadType = 'compressed';
            }
            compressionRatio = (rawTokenEstimate / injectedTokenEstimate).toFixed(1) + 'x';
        }
        
        if (currentBudget + injectedTokenEstimate > maxBudget) continue;

        currentBudget += injectedTokenEstimate;
        selectedChunks.push(`[NEURAL_ARCHIVE:${item.chunk.source} | SCORE:${item.score.toFixed(2)} | TYPE:${payloadType.toUpperCase()}] ${contentToInject}`);
        inspectionChunks.push({
            id: item.chunk.id,
            source: item.chunk.source,
            score: item.score,
            tokenEstimate: injectedTokenEstimate,
            rawTokenEstimate,
            injectedTokenEstimate,
            compressionApplied,
            compressionRatio,
            payloadType,
            summaryAvailable,
            anchorAvailable,
            semanticFamily: item.semanticFamily,
            familyRank: item.familyRank,
            distinctivenessScore: item.distinctivenessScore,
            clusterSuppressed: item.clusterSuppressed,
            tier: item.chunk.tier || 'cold',
            trust: item.chunk.trust || 'external'
        });
    }

    return {
        contextString: selectedChunks.join('\n\n'),
        inspectionData: {
            chunks: inspectionChunks,
            totalBudgetUsed: currentBudget,
            maxBudget
        }
    };
};
