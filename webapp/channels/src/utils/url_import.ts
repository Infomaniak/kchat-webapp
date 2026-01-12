export const getWasmFileURL = () =>
    new URL('wasm-media-encoders/wasm/mp3', import.meta.url);

export const getPdfJSWorkerURL = () =>
    new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url);
