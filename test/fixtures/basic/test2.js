function calculateDiscount (price, quantity) {
  let discount = 0

  if (typeof price !== 'number' || typeof quantity !== 'number' || price < 0 || quantity < 0) {
    return 0
  }

  if (quantity > 10) {
    discount = 0.10
  } else if (price > 100) {
    discount = 0.05
  }

  const discountedPrice = price * (1 - discount)
  return parseFloat(discountedPrice.toFixed(2))
}

calculateDiscount(50, 15)

calculateDiscount(120, 5)

calculateDiscount(75, 8)

calculateDiscount(-10, 5)

calculateDiscount(30, -2)

calculateDiscount(150, 0)
