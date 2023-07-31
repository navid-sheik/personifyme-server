import Stripe from 'stripe';

const stripe = new Stripe( 'sk_test_51NYyrYB6nvvF5XehM7BqvJEdp9EWjsW0AnC24pdrSOWgUAeM3MEFB7sonWa0CHfVp3d7FkXwaZhHvfj1QzyEqdYJ00nmz013nW');
const endpointSecret = 'whsec_2e4d1d5ef57e631e440497da2a22369e02090782b359cbffee17cf57ac500f3a';

class StripeService {
  verifyEvent(body, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret
      );
      return event;
    } catch (err) {
      throw new Error(`Webhook signature verification failed. ${err.message}`);
    }
  }

  handleEvent(event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        // handlePaymentMethodAttached(paymentMethod);
        break;
      default:
        console.log(`Unhandled event type ${event.type}.`);
    }
  }
}

export default new StripeService();