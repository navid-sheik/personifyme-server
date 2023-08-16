function toStripeAmount(value) {
    let [whole, decimal] = value.toFixed(2).split('.');
    let cents = parseInt(whole + (decimal || '00'), 10);
    return cents;
}

export default toStripeAmount;