declare module 'pdfkit' {
    const PDFDocument: any;
    export default PDFDocument;
}

declare module 'pdfkit/js/pdfkit.standalone' {
    import PDFDocument from 'pdfkit';
    export default PDFDocument;
}
