import StripeService from '../services/stripeWebHookServices.js';

class StripeController {
  async webhook(req, res) {
    let event = req.body;
    
    if (endpointSecret) {
      const signature = req.headers['stripe-signature'];
      try {
        event = StripeService.verifyEvent(req.body, signature);
      } catch (err) {
        console.log(`⚠️ ${err.message}`);
        return res.sendStatus(400);
      }
    }

    StripeService.handleEvent(event);

    // Return a 200 response to acknowledge receipt of the event
    res.send();
  }
}

export default new StripeController();