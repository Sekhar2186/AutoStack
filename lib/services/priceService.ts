export function getOffer(plan: string, duration: number) {
    // duration in months

    let discount = 0;

    if (duration === 1) discount = 15;
    else if (duration === 3) discount = 50;
    else if (duration === 12) discount = 75;

    return {
        plan,
        duration,
        discount,
        finalPrice: calculatePrice(plan, duration, discount)
    };
}

function calculatePrice(plan: string, duration: number, discount: number) {
    const basePrices: any = {
        pro: 500,
        pro_plus: 1000
    };

    const price = basePrices[plan] * duration;
    const discounted = price - (price * discount) / 100;

    return discounted;
}