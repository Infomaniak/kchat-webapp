
// This is a very basic type extend to silent tsc
// when web-components will expose types (stencil generated d.ts), we should remove this part
declare namespace JSX {
    interface IntrinsicElements {
        'wc-contact-sheet': any,
        'wc-icon': any;
    }
}
