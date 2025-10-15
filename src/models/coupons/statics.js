/**
 * Get coupon by code
 * @param {string} code - The coupon code
 * @returns {Promise<object>} The coupon object if found, null otherwise
 */
export async function getByCode(code) {
  return this.findOne({ code: code.toUpperCase() });
}

/**
 * Validate a coupon
 * @param {string} code - The coupon code
 * @returns {Promise<object>} - Validation result with isValid flag and coupon data if valid
 */
export async function validateCoupon(code) {
  if (!code) {
    return { isValid: false, message: 'No coupon code provided' };
  }

  const coupon = await this.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return { isValid: false, message: 'Invalid coupon code' };
  }

  // Check if coupon has expired
  if (coupon.endDate && new Date() > coupon.endDate) {
    return { isValid: false, message: 'Coupon has expired' };
  }

  // Check if coupon has reached max uses
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { isValid: false, message: 'Coupon usage limit reached' };
  }

  return {
    isValid: true,
    coupon: {
      _id: coupon._id,
      code: coupon.code,
      discountAmount: coupon.discountAmount,
    },
  };
}

/**
 * Apply a coupon (increment usage count)
 * @param {string} code - The coupon code
 * @returns {Promise<boolean>} - Success status
 */
export async function applyCoupon(code) {
  const result = await this.updateOne(
    { code: code.toUpperCase() },
    { $inc: { usedCount: 1 } },
  );
  return result.modifiedCount > 0;
}
