# Payment Integration Notes

This document outlines conceptual steps for integrating with Bit and PayBox payment gateways.

## Bit Integration Notes (Conceptual)

1.  **Server-Side Setup:**
    *   Install Bit SDK (if available) or prepare to make direct HTTP API calls.
    *   Configure with API keys/credentials obtained from Bit merchant account. Store these securely (e.g., environment variables).

2.  **Payment Initiation Flow:**
    *   **Client Request:** User clicks "Pay with Bit" on the checkout page. Client sends order details (e.g., cart summary, total amount, order ID) to our server (e.g., `/api/payment/initiate-bit`).
    *   **Server to Bit API:** Our server receives the request. It then makes a server-to-server API call to Bit's "create payment" or "initiate transaction" endpoint. This call includes the amount, order ID, currency, and potentially callback URLs (for success, failure, notifications).
    *   **Bit API Response:** Bit's API responds to our server. This response typically includes:
        *   A payment URL: The user will be redirected to this URL to complete the payment on Bit's platform.
        *   OR A transaction token/ID: This might be used with a client-side Bit SDK/widget to embed the payment process.
    *   **Server to Client:** Our server sends this payment URL or token back to the client.

3.  **Payment Completion & Confirmation:**
    *   **Client Redirect (if URL-based):** The client's browser is redirected to the Bit payment page. User authenticates and approves the payment.
    *   **Client-Side SDK (if token-based):** A Bit JavaScript SDK might use the token to open a payment modal or embed a payment form directly on our site.
    *   **Bit to User (Redirect):** After payment completion (success or failure) on Bit's platform, Bit redirects the user's browser back to a `redirect_url` or `return_url` we specified during initiation (e.g., `/api/payment/success?orderId=123` or `/api/payment/failure?orderId=123`).
    *   **Webhook Notification (Server-to-Server):** Independently, Bit's servers will often send a webhook (asynchronous HTTP POST request) to a pre-configured notification URL on our server (e.g., `/api/payment/bit-callback`). This is crucial for reliable order updates as client-side redirects can be unreliable.

4.  **Webhook Handling (Server-Side):**
    *   **Endpoint:** Create a dedicated endpoint (e.g., `POST /api/payment/bit-callback`) on our server to receive these webhooks.
    *   **Verification:** Critically important: Verify the webhook's authenticity. This usually involves checking a signature sent in the request headers or body, using a secret key provided by Bit. This prevents attackers from spoofing payment confirmations.
    *   **Process Data:** Parse the webhook data (which contains payment status, transaction ID, order ID, etc.).
    *   **Update Database:** Update the order status in our database (e.g., to "paid", "failed").
    *   **Respond to Bit:** Send an HTTP 200 OK response to Bit to acknowledge receipt of the webhook. If Bit doesn't receive a 200, it might retry sending the webhook.

## PayBox Integration Notes (Conceptual)

The flow for PayBox is generally very similar to Bit's. Differences might be in API endpoint names, request/response formats, or specific SDK features.

1.  **Server-Side Setup:**
    *   Install PayBox SDK (if available) or prepare for HTTP API calls.
    *   Configure with PayBox API keys/merchant credentials.

2.  **Payment Initiation Flow:**
    *   **Client Request:** User clicks "Pay with PayBox". Client sends order details to `/api/payment/initiate-paybox`.
    *   **Server to PayBox API:** Our server calls PayBox's "initiate payment" API with amount, order ID, callback URLs, etc.
    *   **PayBox API Response:** PayBox returns a payment URL or a token/data for their client-side SDK.
    *   **Server to Client:** Our server sends this URL/token to the client.

3.  **Payment Completion & Confirmation:**
    *   **Client Redirect/SDK:** User completes payment via PayBox's interface (redirect or embedded).
    *   **PayBox to User (Redirect):** PayBox redirects user to our success/failure URL (e.g., `/api/payment/success`, `/api/payment/failure`).
    *   **Webhook Notification:** PayBox sends a server-to-server webhook to our notification endpoint (e.g., `/api/payment/paybox-callback`).

4.  **Webhook Handling (Server-Side):**
    *   **Endpoint:** Create `POST /api/payment/paybox-callback`.
    *   **Verification:** Verify webhook signature using PayBox's method and our secret key.
    *   **Process Data:** Parse PayBox webhook data.
    *   **Update Database:** Update order status.
    *   **Respond to PayBox:** Send HTTP 200 OK.

**General Considerations for Both:**
*   **Security:** API keys must be kept secret. Always use HTTPS. Verify webhooks.
*   **Idempotency:** Design callback/webhook handlers to be idempotent (i.e., processing the same notification multiple times doesn't cause duplicate actions).
*   **Error Handling:** Robustly handle API errors, network issues, and unexpected responses.
*   **Logging:** Log key steps and errors for debugging.
*   **User Experience:** Provide clear feedback to the user throughout the process.
*   **Testing:** Use sandbox/test environments provided by the payment gateways thoroughly.
