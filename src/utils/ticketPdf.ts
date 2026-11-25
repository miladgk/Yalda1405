import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

async function captureTicketFacePng(element: HTMLElement): Promise<{
  dataUrl: string;
  width: number;
  height: number;
}> {
  const rect = element.getBoundingClientRect();
  const width = Math.max(1, element.offsetWidth || Math.round(rect.width));
  const height = Math.max(1, element.offsetHeight || Math.round(rect.height));

  const baseOptions = {
    pixelRatio: 3,
    cacheBust: true,
    width,
    height,
    backgroundColor: '#0e0814',
    style: {
      transform: 'none',
      backfaceVisibility: 'visible',
      WebkitBackfaceVisibility: 'visible',
      margin: '0',
    },
    filter: (node: HTMLElement) => {
      if (node instanceof HTMLElement && node.dataset?.pdfIgnore === 'true') {
        return false;
      }
      return true;
    },
  };

  try {
    const dataUrl = await toPng(element, baseOptions);
    return { dataUrl, width, height };
  } catch {
    // Graceful fallback if external font stylesheets disallow reading rules
    const dataUrl = await toPng(element, { ...baseOptions, skipFonts: true });
    return { dataUrl, width, height };
  }
}

export async function downloadTicketPdf({
  frontElement,
  backElement,
  trackingCode,
}: {
  frontElement: HTMLElement;
  backElement: HTMLElement | null;
  trackingCode: string;
}): Promise<void> {
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const front = await captureTicketFacePng(frontElement);
  const back = backElement ? await captureTicketFacePng(backElement) : null;

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Seamless dark obsidian backdrop matching the Yalda visual identity
  pdf.setFillColor(11, 6, 16);
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  const maxCardWidth = 172;
  const gapMm = 12;

  const frontAspect = front.height / front.width;
  const frontW = maxCardWidth;
  const frontH = frontW * frontAspect;

  let backW = maxCardWidth;
  let backH = 0;
  if (back) {
    const backAspect = back.height / back.width;
    backH = backW * backAspect;
  }

  const totalContentHeight = frontH + (back ? gapMm + backH : 0);
  const availableHeight = pageHeight - 28;
  const scaleDown = totalContentHeight > availableHeight ? availableHeight / totalContentHeight : 1;

  const finalFrontW = frontW * scaleDown;
  const finalFrontH = frontH * scaleDown;
  const finalBackW = backW * scaleDown;
  const finalBackH = backH * scaleDown;
  const finalTotalH = finalFrontH + (back ? gapMm * scaleDown + finalBackH : 0);

  const startY = Math.max(14, (pageHeight - finalTotalH) / 2);
  const frontX = (pageWidth - finalFrontW) / 2;

  pdf.addImage(front.dataUrl, 'PNG', frontX, startY, finalFrontW, finalFrontH, undefined, 'FAST');

  if (back) {
    const backX = (pageWidth - finalBackW) / 2;
    const backY = startY + finalFrontH + gapMm * scaleDown;
    pdf.addImage(back.dataUrl, 'PNG', backX, backY, finalBackW, finalBackH, undefined, 'FAST');
  }

  const safeCode = trackingCode.replace(/[^A-Za-z0-9_-]/g, '') || 'Ticket';
  pdf.save(`Yalda-1405-${safeCode}.pdf`);
}
