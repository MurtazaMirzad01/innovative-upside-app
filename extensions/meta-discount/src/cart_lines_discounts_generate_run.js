import {
  DiscountClass,
  OrderDiscountSelectionStrategy,
  ProductDiscountSelectionStrategy,
} from '../generated/api';


/**
  * @typedef {import("../generated/api").CartInput} RunInput
  * @typedef {import("../generated/api").CartLinesDiscountsGenerateRunResult} CartLinesDiscountsGenerateRunResult
  */

/**
  * @param {RunInput} input
  * @returns {CartLinesDiscountsGenerateRunResult}
  */

export function cartLinesDiscountsGenerateRun(input) {
  const operations = [];

  const config = input.discount?.metafield?.jsonValue;

  // Safety check
  if (!config || !config.percentage) {
    return { operations };
  }

  const {
    percentage,
    message,
    productIds = [],
    productDiscount,
    orderDiscount,
    shippingDiscount,
  } = config;

  const discountClasses = input.discount.discountClasses;

  /**
   * PRODUCT DISCOUNT
   */
  if (
    productDiscount &&
    discountClasses.includes("PRODUCT")
  ) {
    const targets = [];

    for (const line of input.cart.lines) {
      if (line.merchandise.__typename !== "ProductVariant") continue;

      const productId = line.merchandise.product.id;

      if (
        productIds.length === 0 ||
        productIds.includes(productId)
      ) {
        targets.push({
          productVariant: {
            id: line.id,
          },
        });
      }
    }

    if (targets.length > 0) {
      operations.push({
        productDiscountsAdd: {
          discounts: [
            {
              message: message || `${percentage}% OFF`,
              value: {
                percentage: {
                  value: percentage,
                },
              },
              targets,
            },
          ],
        },
      });
    }
  }

  /**
   * ORDER DISCOUNT
   */
  if (
    orderDiscount &&
    discountClasses.includes("ORDER")
  ) {
    operations.push({
      orderDiscountsAdd: {
        discounts: [
          {
            message: message || `${percentage}% OFF ORDER`,
            value: {
              percentage: {
                value: percentage,
              },
            },
            targets: [
              {
                orderSubtotal: {},
              },
            ],
          },
        ],
      }
    });
  }
  return { operations };
}

