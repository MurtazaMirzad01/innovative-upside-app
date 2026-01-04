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
  const percentage = formData.get("percentage");
  const message = formData.get("message");
  const product = JSON.parse(formData.get("product"));
  const actionType = formData.get("actionType");
  const productDistount = formData.get("productDistount");
  const oderDiscount = formData.get("oderDiscount");
  const shippingDiscount = formData.get("shippingDiscount");

  const productID =
    product && product.length > 0
      ? product.map((product) => product.id)
      : [];
  const productIds = productID[0];
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  console.log("Product IDs:", productIds);
  console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

  console.log("==================================================================");
  console.log(title);
  console.log(percentage);
  console.log(message);
  console.log(product);
  console.log(actionType);
  console.log(productDistount);
  console.log(oderDiscount);
  console.log(shippingDiscount);
  console.log("==================================================================");

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
  }`,
    {
      variables: {
        "automaticAppDiscount": {
          "title": title,
          "functionHandle": "meta-discount",
          "startsAt": new Date().toISOString(),
          "combinesWith": {
            "orderDiscounts": oderDiscount,
            "productDiscounts": productDistount,
            "shippingDiscounts": shippingDiscount
          },
          "metafields": [
            {
              "namespace": "custom",
              "key": "function-configuration",
              "type": "json",
              "value": JSON.stringify(
                title,
                percentage,
                message,
                productIds,
                productDistount,
                oderDiscount,
                shippingDiscount
              )
            }
          ]
        }
      },
    },
  );
}
export default function Index() {

  return <Discount />
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
