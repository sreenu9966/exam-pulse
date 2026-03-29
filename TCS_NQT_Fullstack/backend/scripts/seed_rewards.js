const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const GamifiedOffer = require('../models/GamifiedOffer');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    await Coupon.deleteMany({});
    await GamifiedOffer.deleteMany({});

    const coupons = await Coupon.create([
      { code: 'SAVE50', type: 'percentage', value: 50, usageLimit: 100, active: true },
      { code: 'FREEPASS', type: 'percentage', value: 100, usageLimit: 100, active: true },
      { code: 'NQTPRO', type: 'percentage', value: 100, usageLimit: 10, active: true }
    ]);
    console.log('Coupons seeded');

    await GamifiedOffer.create([
      {
        gameType: 'scratch',
        title: 'Lucky Scratch Card',
        description: 'Win premium access!',
        rewards: [
          { type: 'discount_coupon', value: '100', probability: 20 },
          { type: 'discount_coupon', value: '50', probability: 40 },
          { type: 'discount_coupon', value: '0', probability: 40 }
        ],
        active: true
      },
      {
        gameType: 'spin',
        title: 'Mega Spin Wheel',
        description: 'Spin for prizes!',
        rewards: [
          { type: 'discount_coupon', value: '100', probability: 10 },
          { type: 'discount_coupon', value: '50', probability: 30 },
          { type: 'discount_coupon', value: '0', probability: 60 }
        ],
        active: true
      }
    ]);
    console.log('Gamified Offers seeded');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
