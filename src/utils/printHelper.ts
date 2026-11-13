/**
 * Utility for reliable cross-browser printing in React SPAs and iframes
 */
export function printElement(element: HTMLElement | null, documentTitle = 'Коммерческое предложение — ООО «АН Фаттория»'): boolean {
  if (!element) {
    window.print();
    return true;
  }

  try {
    // 1. Create a dedicated hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.zIndex = '-9999';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.classList.add('modal-open-printing');
      window.print();
      setTimeout(() => document.body.classList.remove('modal-open-printing'), 2000);
      return false;
    }

    // Collect all stylesheets and style tags
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(style => style.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="ru">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${documentTitle}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            *, *::before, *::after {
              box-sizing: border-box;
            }
            html, body {
              background: #ffffff !important;
              color: #111827 !important;
              margin: 0 !important;
              padding: 0 !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            .print\\:hidden, .print-hidden, button {
              display: none !important;
            }
            img {
              max-width: 100% !important;
              page-break-inside: avoid !important;
            }
            .page-break-inside-avoid {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; max-width: 100%; margin: 0 auto; background: #ffffff; padding: 4px;">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Trigger printing once images/styles are parsed
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to direct window.print:', err);
        document.body.classList.add('modal-open-printing');
        window.print();
        setTimeout(() => document.body.classList.remove('modal-open-printing'), 2000);
      } finally {
        setTimeout(() => {
          if (iframe.parentNode) {
            iframe.parentNode.removeChild(iframe);
          }
        }, 4000);
      }
    }, 350);

    return true;
  } catch (error) {
    console.error('Error during printing:', error);
    document.body.classList.add('modal-open-printing');
    window.print();
    setTimeout(() => document.body.classList.remove('modal-open-printing'), 2000);
    return false;
  }
}
