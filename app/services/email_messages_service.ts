type RecipientType = 'client' | 'caterer' | 'vendor';

type OrderStatus =
  | 'quote_pending'
  | 'quote_sent'
  | 'awaiting_vendor_quote'
  | 'awaiting_vendor_confirmation'
  | 'vendor_confirmed'
  | 'awaiting_client_confirmation'
  | 'client_confirmed'
  | 'out_for_delivery'
  | 'completed'
  | 'cancelled_not_billable'
  | 'cancelled_billable';

interface EmailMessage {
  subject: string;
  body: string;
}

class EmailMessagesService {
  /**
   * Get email subject and body text for a specific recipient type and order status
   */
  getEmailMessage(
    recipientType: RecipientType,
    orderNumber?: string,
    orderStatus?: OrderStatus,
    clientFirstName?: string,
    revision?: number
  ): EmailMessage {
    const orderRef = orderNumber ? ` #${orderNumber}` : '';
    const firstName = clientFirstName || 'Client';

    switch (recipientType) {
      case 'client':
        return this.getClientEmailMessage(orderStatus || 'quote_pending', firstName, orderRef);

      case 'caterer':
      case 'vendor':
        return this.getVendorEmailMessage(orderStatus || 'awaiting_vendor_confirmation', orderRef, revision);

      default:
        return {
          subject: `Order Invoice${orderRef}`,
          body: `Dear Recipient,

Please find the invoice for order${orderRef} attached to this email.

Here if you have any questions.

Sincerely,
Kabin247 Inflight Support
One point of contact for your global inflight needs.`,
        };
    }
  }

  /**
   * Get client email message based on order status
   */
  private getClientEmailMessage(
    status: OrderStatus,
    firstName: string,
    orderRef: string
  ): EmailMessage {
    switch (status) {
      case 'quote_pending':
      case 'quote_sent':
        return {
          subject: `Order Estimate${orderRef}`,
          body: `Dear ${firstName},

Thank you for considering us to manage your order. Please find order estimate attached.

Kindly advise if we may confirm this request?

Here if you have any questions.

Sincerely,
Kabin247 Inflight Support
One point of contact for your global inflight needs.`,
        };

      case 'client_confirmed':
      case 'vendor_confirmed':
      case 'awaiting_client_confirmation':
        return {
          subject: `Order Confirmation${orderRef}`,
          body: `Dear ${firstName},

Thank you for allowing us to manage your inflight provisioning request. Your order/and or update has been confirmed.

Kindly review the attached confirmation and advise if any discrepancies.

Here if you have any questions.

Sincerely,
Kabin247 Inflight Support
One point of contact for your global inflight needs.`,
        };

      case 'cancelled_not_billable':
      case 'cancelled_billable':
        return {
          subject: `Order Cancelled${orderRef}`,
          body: `Dear ${firstName},

Thank you for allowing us to manage your inflight provisioning request. Your orders been cancelled.

We look forward to working with you again soon.

Here if you have any questions.

Sincerely,
Kabin247 Inflight Support
One point of contact for your global inflight needs.`,
        };

      case 'completed':
        return {
          subject: `Order Delivered${orderRef}`,
          body: `Dear ${firstName},

Thank you for allowing us to manage your inflight provisioning request. Your order has been delivered.

We look forward to working with you again soon.

Here if you have any questions.

Sincerely,
Kabin247 Inflight Support
One point of contact for your global inflight needs.`,
        };

      default:
        return {
          subject: `Order Update${orderRef}`,
          body: `Dear ${firstName},

Thank you for allowing us to manage your inflight provisioning request. Please find the attached order details.

Here if you have any questions.

Sincerely,
Kabin247 Inflight Support
One point of contact for your global inflight needs.`,
        };
    }
  }

  /**
   * Get vendor/caterer email message based on order status
   */
  private getVendorEmailMessage(status: OrderStatus, orderRef: string, revision?: number): EmailMessage {
    const revisionText = revision === undefined || revision === 0 
      ? 'Original' 
      : revision === 1 
        ? 'Rev 1' 
        : `Rev ${revision}`;
    
    switch (status) {
      case 'quote_pending':
      case 'awaiting_vendor_quote':
      case 'awaiting_vendor_confirmation':
        return {
          subject: `New Order Request${orderRef}${revision !== undefined && revision > 0 ? ` - ${revisionText}` : ''}`,
          body: `Dear Team,

Thank you for considering our order. Kindly advise if able to accommodate the attached request?

Here if you have any questions.

Sincerely,
Kabin247 Inflight Support
One point of contact for your global inflight needs.`,
        };

      case 'vendor_confirmed':
      case 'client_confirmed':
      case 'awaiting_client_confirmation':
        return {
          subject: `Order Update${orderRef}${revision !== undefined && revision > 0 ? ` - ${revisionText}` : ''}`,
          body: `Dear Team,

Kindly review the attached request for details of the changes requested. Items Highlighted for your convenience.

Here if you have any questions.

Sincerely,
Kabin247 Inflight Support
One point of contact for your global inflight needs.`,
        };

      case 'cancelled_not_billable':
      case 'cancelled_billable':
        return {
          subject: `Order Cancelled${orderRef}`,
          body: `Dear Team,

We would like to cancel this request.

Please advise if cancellation can be confirmed and if any associated charges?

Here if you have any questions.

Sincerely,
Kabin247 Inflight Support
One point of contact for your global inflight needs.`,
        };

      default:
        return {
          subject: `Order Details${orderRef}`,
          body: `Dear Team,

Please find the attached order details for your review.

Here if you have any questions.

Sincerely,
Kabin247 Inflight Support
One point of contact for your global inflight needs.`,
        };
    }
  }
}

export default new EmailMessagesService();

