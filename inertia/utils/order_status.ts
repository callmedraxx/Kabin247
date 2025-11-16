export type TOrderStatus = {
  label: string;
  value: string;
  scheme: string;
  fgColor: string;
  bgColor: string;
  next: string | null;
  prev: string | null;
  orderType: string | null;
};

export class OrderStatus {
  orderStatus = new Map(
    Object.entries({
      quote_pending: {
        label: 'Quote Pending',
        value: 'quote_pending',
        scheme: 'primary',
        fgColor: 'var(--color-primary-500)',
        bgColor: 'var(--color-primary-100)',
        next: 'qoute_sent',
        prev: null,
        orderType: null,
      },
      quote_sent: {
        label: 'Quote Sent',
        value: 'quote_sent',
        scheme: 'blue',
        fgColor: 'var(--color-blue-500)',
        bgColor: 'var(--color-blue-100)',
        next: 'awaiting_vendor_quote',
        prev: 'quote_pending',
        orderType: null,
      },
      awaiting_vendor_quote: {
        label: 'Awaiting Vendor Quote',
        value: 'awaiting_vendor_quote',
        scheme: 'blue',
        fgColor: 'var(--color-blue-500)',
        bgColor: 'var(--color-blue-100)',
        next: 'awaiting_vendor_confirmation',
        prev: 'qoute_sent',
        orderType: null,
      },
      awaiting_vendor_confirmation: {
        label: 'Awaiting Vendor Confirmation',
        value: 'awaiting_vendor_confirmation',
        scheme: 'blue',
        fgColor: 'var(--color-blue-500)',
        bgColor: 'var(--color-blue-100)',
        next: 'vendor_confirmed',
        prev: 'awaiting_vendor_quote',
        orderType: null,
      },
      vendor_confirmed: {
        label: 'Vendor Confirmed',
        value: 'vendor_confirmed',
        scheme: 'blue',
        fgColor: 'var(--color-blue-500)',
        bgColor: 'var(--color-blue-100)',
        next: 'completed',
        prev: 'awaiting_vendor_confirmation',
        orderType: null,
      },
      awaiting_client_confirmation: {
        label: 'Awaiting Client Confirmation',
        value: 'awaiting_client_confirmation',
        scheme: 'blue',
        fgColor: 'var(--color-blue-500)',
        bgColor: 'var(--color-blue-100)',
        next: 'client_confirmed',
        prev: 'vendor_confirmed',
        orderType: null,
      },
      client_confirmed: {
        label: 'Client Confirmed',
        value: 'client_confirmed',
        scheme: 'blue',
        fgColor: 'var(--color-blue-500)',
        bgColor: 'var(--color-blue-100)',
        next: 'out_for_delivery',
        prev: 'awaiting_client_confirmation',
        orderType: null,
      },
      out_for_delivery: {
        label: 'Out For Delivery',
        value: 'out_for_delivery',
        scheme: 'purple',
        fgColor: 'var(--color-purple-500)',
        bgColor: 'var(--color-purple-100)',
        next: 'completed',
        prev: 'client_confirmed',
        orderType: null,
      },
      completed: {
        label: 'Delivered',
        value: 'completed',
        scheme: 'green',
        fgColor: 'var(--color-green-500)',
        bgColor: 'var(--color-green-100)',
        next: 'client_confirmed',
        prev: null,
        orderType: null,
      },
      cancelled_not_billable: {
        label: 'Cancelled/Not Billable',
        value: 'cancelled_not_billable',
        scheme: 'red',
        fgColor: 'var(--color-cyan-500)',
        bgColor: 'var(--color-cyan-100)',
        next: null,
        prev: null,
        orderType: null,
      },
      cancelled_billable: {
        label: 'Cancelled/Billable',
        value: 'cancelled_billable',
        scheme: 'red',
        fgColor: 'var(--color-red-500)',
        bgColor: 'var(--color-red-100)',
        next: null,
        prev: null,
        orderType: null,
      },
    })
  );

  all() {
    return Array.from(this.orderStatus.values());
  }

  // get status details
  getStatusDetails(status: string): any {
    return this.orderStatus.get(status);
  }

  // Get all previous statuses for the given status
  getAllPreviousStatuses(currentStatus: string) {
    const previousStatuses = [];
    let current = this.orderStatus.get(currentStatus);

    while (current && current.prev) {
      const prevStatus = this.orderStatus.get(current.prev);
      if (prevStatus) {
        previousStatuses.unshift(prevStatus);
      }
      current = prevStatus;
    }

    return previousStatuses;
  }

  // get status timeline
  getStatusTimeline(currentStatus: string) {
    const current = this.orderStatus.get(currentStatus);
    if (!current) return [];

    const previous = this.getAllPreviousStatuses(currentStatus);
    const next = current.next ? [this.orderStatus.get(current.next)] : [];

    const global = [this.orderStatus.get('cancelled_not_billable'), this.orderStatus.get('cancelled_billable'), this.orderStatus.get('returned')];

    return [...previous, current, ...next, ...global];
  }
}
