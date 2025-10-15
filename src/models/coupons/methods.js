/**
 * Check if coupon is currently valid
 * @returns {boolean} - Whether the coupon is valid
 */
export function isValid() {
  // Check if coupon is active
  if (!this.isActive) {
    return false;
  }

  // Check if coupon has expired
  if (this.endDate && new Date() > this.endDate) {
    return false;
  }

  // Check if coupon hasn't started yet
  if (this.startDate && new Date() < this.startDate) {
    return false;
  }

  // Check if coupon has reached max uses
  if (this.maxUses !== null && this.usedCount >= this.maxUses) {
    return false;
  }

  return true;
}

/**
 * Get remaining uses for this coupon
 * @returns {number|null} - Number of remaining uses, or null if unlimited
 */
export function getRemainingUses() {
  if (this.maxUses === null) {
    return null; // Unlimited uses
  }
  return Math.max(0, this.maxUses - this.usedCount);
}

/**
 * Calculate discount amount for a given price
 * @param {number} price - The original price
 * @returns {number} - The discount amount
 */
export function calculateDiscount(price) {
  if (this.discountType === 'percentage') {
    return (price * this.discountAmount) / 100;
  } else {
    return Math.min(this.discountAmount, price);
  }
}

/**
 * Clean coupon object before sending to client (remove sensitive fields)
 * @returns {object} - Cleaned coupon object
 */
export function clean() {
  const couponObj = this.toObject({ virtuals: true });
  // Remove internal fields if needed
  return couponObj;
}
