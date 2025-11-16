// utils/generate_invoice.ts
import { TFunction } from 'i18next';
import { toast } from 'sonner';

export const generateInvoice = async (
  orderId: number,
  t: TFunction<'translation', undefined>,
  isUser: boolean | undefined = false
) => {
  try {
    const res = await fetch(
      `/api${isUser ? '/user' : ''}/orders/${orderId}/generate-invoice`,
      { headers: { Accept: 'text/html,*/*;q=0.8' } }
    );

    // Handle non-200s with readable message
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      // Try to surface server message if JSON
      if (contentType.includes('application/json')) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || 'Failed to fetch invoice');
      }
      const errText = await res.text().catch(() => '');
      throw new Error(errText || 'Failed to fetch invoice');
    }

    // If server sent JSON (e.g., error payload), show message
    if (contentType.includes('application/json')) {
      const payload = await res.json().catch(() => ({}));
      const msg = payload?.message || 'Unexpected response while generating invoice';
      throw new Error(msg);
    }

    // Otherwise, treat as HTML
    const invoiceHtml = await res.text();

    // Open a print window via Blob URL (more reliable than writing into an iframe)
    const blob = new Blob([invoiceHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const win = window.open(url, '_blank');
    if (!win) {
      URL.revokeObjectURL(url);
      toast.error(t('Please allow pop-ups to print the invoice.'));
      return;
    }

    // Ensure we print after the document & assets load
    const cleanup = () => {
      URL.revokeObjectURL(url);
      try { win.close(); } catch {}
    };

    // some browsers fire onload after DOM ready; wait a tick for layout
    win.onload = () => {
      try {
        // Focus and print
        win.focus();
        // Print after a small delay to allow styles/images to settle
        setTimeout(() => {
          win.print();

          // Prefer afterprint when available
          if ('onafterprint' in win) {
            win.onafterprint = cleanup;
          } else {
            // Fallback: close after a short delay
            setTimeout(cleanup, 1000);
          }
        }, 150);
      } catch {
        cleanup();
      }
    };
  } catch (error: any) {
    toast.error(
      t(error?.message || 'Failed to generate the invoice. Please try again.')
    );
  }
};
