import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import Discount from "../components/Discount";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
  mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition {
        id
        name
      }
      userErrors {
        field
        message
        code
      }
    }
  }`,
    {
      variables: {
        "definition": {
          "name": "meta-disc",
          "namespace": "custom",
          "key": "meta-disc",
          "description": "Discount Config metafield",
          "type": "json",
          "ownerType": "PRODUCT"
        }
      },
    },
  );
  const json = await response.json();
  return json.data;
}

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const title = formData.get("title");
  const percentage = Number(formData.get("percentage"));
  const message = formData.get("message");
  const product = JSON.parse(formData.get("product") || "[]");

  const productDiscountBool = formData.get("productDistount") === "true";
  const orderDiscountBool = formData.get("oderDiscount") === "true";
  const shippingDiscountBool = formData.get("shippingDiscount") === "true";

  const productIds = Array.isArray(product)
    ? product.map(p => p.id)
    : [];

  console.log("=========================================================================")
  console.log(productIds);
  console.log("=========================================================================")


  const metafieldConfig = {
    title,
    percentage,
    message,
    productIds,
    productDiscount: productDiscountBool,
    orderDiscount: orderDiscountBool,
    shippingDiscount: shippingDiscountBool,
  };

  const response = await admin.graphql(
    `#graphql
    mutation discountAutomaticAppCreate($automaticAppDiscount: DiscountAutomaticAppInput!) {
      discountAutomaticAppCreate(automaticAppDiscount: $automaticAppDiscount) {
        userErrors {
          field
          message
        }
        automaticAppDiscount {
          discountId
          title
          status
        }
      }
    }`,
    {
      variables: {
        automaticAppDiscount: {
          title,
          functionHandle: "meta-discount",
          startsAt: new Date().toISOString(),
          combinesWith: {
            productDiscounts: productDiscountBool,
            orderDiscounts: orderDiscountBool,
            shippingDiscounts: shippingDiscountBool,
          },
          metafields: [
            {
              namespace: "custom",
              key: "function-configuration",
              type: "json",
              value: JSON.stringify(metafieldConfig),
            },
          ],
        },
      },
    }
  );

  return response;
};

export default function Index() {

  return <Discount />
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
