import Stripe from 'stripe';
import Seller from '../models/seller-account.js';
import PaymentError from '../errors/payment-error.js';
import SellerError from '../errors/seller-error.js';
import { successResponse } from '../utils/response.js';

const stripe = new Stripe('sk_test_51NYyrYB6nvvF5XehM7BqvJEdp9EWjsW0AnC24pdrSOWgUAeM3MEFB7sonWa0CHfVp3d7FkXwaZhHvfj1QzyEqdYJ00nmz013nW');

export default class PaymentService {

    static async getBalance(user_id) {
        const seller =  await Seller.findOne({ userId: user_id });
        if (!seller) {
            throw new SellerError('Seller not found', 404);
        }
        const connectedAccountId = seller.stripe_account_id;

        try {
            const balance = await stripe.balance.retrieve({
                stripeAccount: connectedAccountId
            });

            const totalAvailable = balance.available.reduce((acc, bal) => acc + bal.amount, 0);
            const totalPending = balance.pending.reduce((acc, bal) => acc + bal.amount, 0);
            const totalBalance = totalAvailable + totalPending;

            return successResponse("Balance retrieved successfully", totalBalance);

        } catch (error) {
            throw new PaymentError('Failed to retrieve balance: ' + error.message);
        }
    }

    static async getScheduledPayouts(user_id) {
        const seller = await Seller.findOne({ userId: user_id });
        if (!seller) {
            throw new SellerError('Seller not found', 404);
        }
        const connectedAccountId = seller.stripe_account_id;

        try {
            const payouts = await stripe.payouts.list({
                stripeAccount: connectedAccountId
            });

            let totalBalancePaidOut = 0;
            let totalPendingPayouts = 0;

            const bankAccountDetailsPromises = payouts.data.map(async (payout) => {
                if (payout.status === 'paid') {
                    totalBalancePaidOut += payout.amount;
                } else if (payout.status === 'pending') {
                    totalPendingPayouts += payout.amount;
                }
                
                const bankAccount = await stripe.accounts.retrieveExternalAccount(
                    connectedAccountId,
                    payout.destination
                );
                
                payout.bankAccountDetails = bankAccount;
                return payout;
            });

            const payoutsWithBankAccountDetails = await Promise.all(bankAccountDetailsPromises);

            return successResponse("Scheduled payouts retrieved successfully", {
                payouts: payoutsWithBankAccountDetails,
                totalBalancePaidOut: totalBalancePaidOut,
                totalPendingPayouts: totalPendingPayouts
            });

        } catch (error) {
            throw new PaymentError('Failed to retrieve scheduled payouts: ' + error.message);
        }
    }

    static async getPaymentHistory(user_id) {
        const seller = await Seller.findOne({ userId: user_id });
        if (!seller) {
            throw new SellerError('Seller not found', 404);
        }
        const connectedAccountId = seller.stripe_account_id;

        try {
            const charges = await stripe.charges.list({
                stripeAccount: connectedAccountId
            });

            return successResponse("Payment history retrieved successfully", charges);

        } catch (error) {
            throw new PaymentError('Failed to retrieve payment history: ' + error.message);
        }
    }

    static async getBankAccountDetails(user_id, bankAccountId) {
        const seller = await Seller.findOne({ userId: user_id });
        if (!seller) {
            throw new SellerError('Seller not found', 404);
        }
        const connectedAccountId = seller.stripe_account_id;

        try {
            const bankAccount = await stripe.accounts.retrieveExternalAccount(
                connectedAccountId,
                bankAccountId,
                {}
            );

            return successResponse("Bank account details retrieved successfully", bankAccount);

        } catch (error) {
            throw new PaymentError('Failed to retrieve bank account details: ' + error.message);
        }
    }

    // ... Add other methods as necessary
}
