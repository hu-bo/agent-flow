const ZH_READ_HINTS = ['\u67e5\u770b', '\u770b\u770b', '\u770b\u4e0b', '\u8bfb\u53d6', '\u6253\u5f00'];
const ZH_SEARCH_HINTS = ['\u641c\u7d22', '\u67e5\u627e'];
const ZH_LIST_HINTS = ['\u5217\u51fa', '\u76ee\u5f55', '\u6587\u4ef6\u5217\u8868', '\u6587\u4ef6\u5939', '\u684c\u9762', '\u6709\u4ec0\u4e48'];
const ZH_RECURSIVE_HINTS = ['\u9012\u5f52', '\u5168\u5c40', '\u5168\u91cf'];
const ZH_FILE_NOUNS = ['\u6587\u4ef6', '\u6587\u4ef6\u5939', '\u76ee\u5f55'];
const EN_LIST_INTENT = /(list|ls|dir|tree)/i;
const EN_READ_INTENT = /(read|open|cat|show)/i;
const EN_SEARCH_INTENT = /(search|find|grep)/i;
const EN_RECURSIVE_HINT = /(recursive|tree)/i;
const SEARCH_MARKERS = ['search ', 'find ', 'grep ', '\u641c\u7d22', '\u67e5\u627e'];
function normalizeWhitespace(text) {
    return text.replace(/\s+/g, ' ').trim();
}
function includesAny(haystack, needles) {
    return needles.some((needle) => haystack.includes(needle));
}
function isWindowsDriveRootPath(path) {
    return /^[A-Za-z]:[\\/]?$/.test(path.trim());
}
function extractWindowsDrivePath(message) {
    const explicitDrive = message.match(/\b([A-Za-z]):(?:[\\/][^\s"'`]*)?/);
    if (explicitDrive?.[0]) {
        return explicitDrive[0].length === 2 ? `${explicitDrive[0]}\\` : explicitDrive[0];
    }
    const zhDrive = message.match(/\b([A-Za-z])\s*\u76d8/);
    if (zhDrive?.[1]) {
        return `${zhDrive[1].toUpperCase()}:\\`;
    }
    return undefined;
}
export class SemanticFsDetector {
    detect(rawMessage) {
        const message = normalizeWhitespace(rawMessage);
        if (!message) {
            return undefined;
        }
        const explicitPath = this.extractExplicitPath(message);
        const candidatePath = this.resolveCandidatePath(message, explicitPath);
        const hasLookVerb = includesAny(message, ZH_READ_HINTS);
        const hasFileNoun = includesAny(message, ZH_FILE_NOUNS);
        const hasListIntent = EN_LIST_INTENT.test(message) || includesAny(message, ZH_LIST_HINTS) || (hasLookVerb && hasFileNoun);
        if (this.shouldRead(message, explicitPath, hasLookVerb, hasListIntent)) {
            return {
                title: 'semantic-fs-read',
                toolName: 'fs.read',
                input: {
                    path: explicitPath,
                    maxBytes: 200_000,
                },
            };
        }
        if (EN_SEARCH_INTENT.test(message) || includesAny(message, ZH_SEARCH_HINTS)) {
            const pattern = this.extractSearchPattern(message);
            if (pattern) {
                return {
                    title: 'semantic-fs-search',
                    toolName: 'fs.search',
                    input: {
                        path: candidatePath || '.',
                        pattern,
                        recursive: /recursive/i.test(message) || includesAny(message, ZH_RECURSIVE_HINTS),
                        maxMatches: 80,
                    },
                };
            }
        }
        if (hasListIntent) {
            return {
                title: 'semantic-fs-list',
                toolName: 'fs.list',
                input: {
                    path: candidatePath || '.',
                    recursive: EN_RECURSIVE_HINT.test(message) || includesAny(message, ZH_RECURSIVE_HINTS),
                    maxEntries: 200,
                },
            };
        }
        return undefined;
    }
    extractExplicitPath(message) {
        const quotedPath = message.match(/`([^`]+)`/)?.[1];
        const genericPath = message.match(/[A-Za-z]:(?:[\\/][^\s"'`]*)?|\.{0,2}[\\/][^\s"'`]+|[A-Za-z0-9._-]+[\\/][^\s"'`]+/)?.[0] ?? '';
        return (quotedPath ?? genericPath).trim();
    }
    resolveCandidatePath(message, explicitPath) {
        if (explicitPath.length > 0) {
            return explicitPath;
        }
        const drivePath = extractWindowsDrivePath(message);
        if (drivePath) {
            return drivePath;
        }
        if (includesAny(message, ['\u684c\u9762', 'Desktop', 'desktop'])) {
            return '.';
        }
        return '';
    }
    shouldRead(message, explicitPath, hasLookVerb, hasListIntent) {
        if (!explicitPath || hasListIntent) {
            return false;
        }
        if (isWindowsDriveRootPath(explicitPath)) {
            return false;
        }
        return EN_READ_INTENT.test(message) || hasLookVerb;
    }
    extractSearchPattern(message) {
        const quotedPattern = message.match(/"(.*?)"|'(.*?)'|`(.*?)`/);
        if (quotedPattern) {
            return quotedPattern[1] ?? quotedPattern[2] ?? quotedPattern[3];
        }
        const normalized = normalizeWhitespace(message.toLowerCase());
        for (const marker of SEARCH_MARKERS) {
            const idx = normalized.indexOf(marker);
            if (idx < 0) {
                continue;
            }
            const tail = normalized.slice(idx + marker.length).trim();
            if (!tail) {
                continue;
            }
            return tail.split(' ')[0];
        }
        return undefined;
    }
}
