"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";

const PRINT_PAGE_STYLE = `
  @page {
    size: A4;
    margin: 0;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }
  .document-a4 {
    width: 210mm !important;
    /* Slightly under 297mm so rounding never spills a blank trailing page. */
    min-height: 296.8mm !important;
    max-width: none !important;
    margin: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    transform: none !important;
  }
`;

export function PrintButton({
  documentTitle,
  targetSelector = ".document-a4",
}: {
  documentTitle?: string;
  targetSelector?: string;
}) {
  const contentRef = useRef<Element | Text | null | undefined>(null);

  const printContent = useReactToPrint({
    contentRef,
    documentTitle: documentTitle || "document",
    pageStyle: PRINT_PAGE_STYLE,
    print: async (iframe) => {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow;
      if (!doc || !win) return;

      // The iframe gets a bare <html>, so RTL direction and the Cairo font
      // variable (a class on the app's <html>) must be copied over manually.
      const appRoot = document.documentElement;
      const target = contentRef.current as HTMLElement | null;
      const dir = target?.getAttribute("dir") || appRoot.getAttribute("dir") || "rtl";
      const lang = target?.getAttribute("lang") || appRoot.lang || "ar";

      doc.documentElement.setAttribute("dir", dir);
      doc.documentElement.setAttribute("lang", lang);
      doc.documentElement.className = appRoot.className;
      doc.body.setAttribute("dir", dir);
      doc.body.className = document.body.className;

      win.print();
    },
  });

  function handlePrint() {
    // The printable area lives in server-rendered markup, so we locate it at
    // click time instead of threading a ref through the page tree.
    const target = document.querySelector<HTMLElement>(targetSelector);
    if (!target) {
      window.print();
      return;
    }
    contentRef.current = target;
    printContent();
  }

  return (
    <Button type="button" className="no-print" onClick={handlePrint}>
      طباعة / حفظ PDF
    </Button>
  );
}
