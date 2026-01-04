export const setMetafields = async (admin, ownerId, metafield) => {
  const mutation = `#graphql
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          key
          namespace
          value
        }
        userErrors {
          field
          message
          code
        }
      }
    }
  `;

  const formattedMetafield = {
    ownerId,
    namespace: metafield.namespace,
    key: metafield.key,
    type: metafield.type || "json",
    value:
      typeof metafield.value === "string"
        ? metafield.value
        : JSON.stringify(metafield.value),
  };

  const variables = {
    metafields: [formattedMetafield], // ✅ MUST be array
  };

  const response = await admin.graphql(mutation, { variables });
  const { data } = await response.json();

  const { metafieldsSet } = data;

  if (metafieldsSet.userErrors?.length) {
    throw new Error(
      metafieldsSet.userErrors
        .map(e => `${e.message} (${e.code})`)
        .join(", ")
    );
  }

  return metafieldsSet.metafields;
};
export async function createAutomaticAppDiscount(
  admin,
  {
    title,
    functionHandle,
    startsAt = new Date(),
    endsAt = null,
    combinesWith = {
      orderDiscounts: true,
      productDiscounts: true,
      shippingDiscounts: true,
    },
    metafields = [],
  }
) {
  const mutation = `#graphql
    mutation discountAutomaticAppCreate(
      $automaticAppDiscount: DiscountAutomaticAppInput!
    ) {
      discountAutomaticAppCreate(
        automaticAppDiscount: $automaticAppDiscount
      ) {
        userErrors {
          field
          message
        }
        automaticAppDiscount {
          discountId
          title
          startsAt
          endsAt
          status
          appDiscountType {
            appKey
            functionId
          }
          combinesWith {
            orderDiscounts
            productDiscounts
            shippingDiscounts
          }
        }
      }
    }
  `;

  const variables = {
    automaticAppDiscount: {
      title,
      functionHandle,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt ? endsAt.toISOString() : null,
      combinesWith,
      metafields,
    },
  };

  const response = await admin.graphql(mutation, { variables });
  const { data } = await response.json();

  const { automaticAppDiscount, userErrors } =
    data.discountAutomaticAppCreate;

  return {
    discountId: automaticAppDiscount?.discountId,
    automaticAppDiscount,
    userErrors,
  };
}
