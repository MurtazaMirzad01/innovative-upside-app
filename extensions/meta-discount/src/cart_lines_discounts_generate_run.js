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
  const stringifiedInput = JSON.stringify(input);
  console.log("??????????????????????????????????????????");
  console.log(stringifiedInput);
  console.log("??????????????????????????????????????????");

  const operations = [];
  const config = input.discount?.metafield?.jsonValue;

  if (!config || !config.percentage) {
    return { operations };
  }

  const {
    percentage,
    message,
    productIds = [],
  } = config;

  if (
    !input.discount.discountClasses.includes("PRODUCT")
  ) {
    return { operations };
  }

  const targets = [];

  for (const line of input.cart.lines) {
    if (line.merchandise.__typename !== "ProductVariant") continue;

    const productId = line.merchandise.product.id;

    if (productIds.length === 0 || productIds.includes(productId)) {
      targets.push({
        cartLine: {
          id: line.id,
        },
      });
    }
  }

  if (targets.length === 0) {
    return { operations };
  }

  operations.push({
    productDiscountsAdd: {
      selectionStrategy: "ALL",
      candidates: [
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

  return { operations };
}