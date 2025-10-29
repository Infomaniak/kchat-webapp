
// This is a very basic type extend to silent tsc
// when web-components will expose types (stencil generated d.ts), we should remove this part
declare namespace JSX {
    interface IntrinsicElements {
        'wc-contact-sheet': any;
        'wc-ksuite-pro-upgrade-banner': any;
        'wc-ksuite-pro-upgrade-dialog': any;
        'wc-ksuite-pro-upgrade-button': any;
        'wc-ksuite-pro-upgrade-tag': any;
        'wc-mail-attachment': any;
        'wc-ksuite-pro-upgrade-compact-tag': any;
        'wc-icon': any;
    }
}
