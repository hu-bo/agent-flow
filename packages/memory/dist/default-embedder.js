export class HashEmbeddingProvider {
    modelId = 'hash-embedding-v1';
    dimension;
    constructor(dimension = 128) {
        if (dimension <= 0) {
            throw new Error('Embedding dimension must be greater than 0.');
        }
        this.dimension = dimension;
    }
    async embed(texts) {
        return texts.map((text) => this.embedSingle(text));
    }
    embedSingle(text) {
        const vector = new Array(this.dimension).fill(0);
        const normalized = text.trim().toLowerCase();
        for (let i = 0; i < normalized.length; i += 1) {
            const code = normalized.charCodeAt(i);
            const index = (code + i * 31) % this.dimension;
            vector[index] += (code % 13) / 13 + 0.1;
        }
        const norm = Math.sqrt(vector.reduce((acc, value) => acc + value * value, 0));
        if (norm === 0) {
            return vector;
        }
        return vector.map((value) => value / norm);
    }
}
