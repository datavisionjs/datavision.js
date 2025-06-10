import DataVision from './src/index.js';

// Attach to global scope (not just window)
if (typeof globalThis !== 'undefined') {
    globalThis.DataVision = DataVision;
} else if (typeof window !== 'undefined') {
    window.DataVision = DataVision;
} else if (typeof global !== 'undefined') {
    global.DataVision = DataVision;
}else if (typeof self !== 'undefined') {
    self.DataVision = DataVision;
} else {
    throw new Error('DataVision could not be attached to a global scope.');
}
