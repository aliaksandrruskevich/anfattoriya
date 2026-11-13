/**
 * Utility to export HTML content as a Microsoft Word (.docx / .doc) document.
 * Creates an XML-based Word document with proper margins, font (Times New Roman),
 * and page layout matching Belarusian institutional legal document requirements.
 */

export interface WordExportOptions {
  filename: string;
  title?: string;
  landscape?: boolean;
}

export const exportHtmlToWord = (elementId: string, options: WordExportOptions) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id "${elementId}" not found for Word export.`);
    return;
  }

  // Clone element to avoid modifying live DOM
  const clone = element.cloneNode(true) as HTMLElement;

  // Clean up any buttons or UI items inside clone if any
  const buttons = clone.querySelectorAll('button, .no-print');
  buttons.forEach(b => b.remove());

  const contentHtml = clone.innerHTML;

  // Build standard Word HTML document with MSO styles
  const wordDocument = `
    <!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${options.title || 'Документ'}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 210mm 297mm;
          margin: 15mm 15mm 15mm 20mm;
          mso-header-margin: 35.4pt;
          mso-footer-margin: 35.4pt;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 11pt;
          line-height: 1.25;
          color: #000000;
          background-color: #ffffff;
          margin: 0;
          padding: 0;
        }
        p {
          margin: 0 0 4pt 0;
          line-height: 1.25;
        }
        h2 {
          font-size: 13pt;
          font-weight: bold;
          margin: 2pt 0;
          text-align: center;
          text-transform: uppercase;
        }
        h3 {
          font-size: 10pt;
          font-weight: normal;
          margin: 0;
          text-align: center;
          text-transform: uppercase;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-justify { text-align: justify; }
        .font-bold { font-weight: bold; }
        .uppercase { text-transform: uppercase; }
        table {
          width: 100%;
          border-collapse: collapse;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        ${contentHtml}
      </div>
    </body>
    </html>
  `;

  // Create Blob with Word MIME type
  const blob = new Blob(['\ufeff', wordDocument], {
    type: 'application/msword;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.href = url;
  downloadAnchor.download = options.filename.endsWith('.doc') || options.filename.endsWith('.docx')
    ? options.filename 
    : `${options.filename}.doc`;

  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
};
