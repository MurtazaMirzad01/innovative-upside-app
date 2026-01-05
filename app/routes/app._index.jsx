import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import Discount from "../components/Discount";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const METAOBJECT_TYPE = "discount_metaobject";

  /* ================= CHECK EXISTING DEFINITION ================= */
  const checkResponse = await admin.graphql(
    `#graphql
    query GetMetaobjectDefinitionByType($type: String!) {
      metaobjectDefinitionByType(type: $type) {
        id
        name
        type
      }
    }`,
    {
      variables: {
        type: METAOBJECT_TYPE,
      },
    }
  );

  const checkData = await checkResponse.json();
  const existingDefinition =
    checkData?.data?.metaobjectDefinitionByType;

  if (existingDefinition) {
    console.log(
      `Metaobject definition "${METAOBJECT_TYPE}" already exists`
    );
    return null;
  }

  /* ================= CREATE DEFINITION ================= */
  const createResponse = await admin.graphql(
    `#graphql
    mutation CreateMetaobjectDefinition(
      $definition: MetaobjectDefinitionCreateInput!
    ) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition {
          id
          name
          type
          fieldDefinitions {
            name
            key
          }
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
        definition: {
          name: "discount_metaobject",
          type: METAOBJECT_TYPE,
          fieldDefinitions: [
            { name: "title", key: "title", type: "single_line_text_field" },
            {
              name: "percentage",
              key: "percentage",
              type: "single_line_text_field",
            },
            { name: "message", key: "message", type: "single_line_text_field" },
            { name: "product", key: "product", type: "json" },
          ],
        },
      },
    }
  );

  const createData = await createResponse.json();
  const payload = createData?.data?.metaobjectDefinitionCreate;
  const userErrors = payload?.userErrors ?? [];

  if (userErrors.length > 0) {
    return { errors: userErrors };
  }

  return payload?.metaobjectDefinition;
};


export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const title = formData.get("title");
  const percentage = Number(formData.get("percentage"));
  const message = formData.get("message");
  const product = JSON.parse(formData.get("product") || "[]");
  const actionType = formData.get("actionType")
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
  };

  //Create Metaobject Entry
  const fieldsArr = [
    { key: "title", value: title },
    { key: "percentage", value: percentage },
    { key: "message", value: message },
    { key: "product", value: JSON.stringify(product) }
  ].filter((f) => f.value !== undefined && f.value !== null);

  // CREATE: Create a new metaobject
  if (actionType === "create") {
    const createResponse = await admin.graphql(
      `#graphql
      mutation {
        metaobjectCreate(metaobject: {
          type: "discount_metaobject",
          fields: [
            ${fieldsArr.map((f) => `{ key: "${f.key}", value: """${f.value}""" }`).join(",\n")}
          ]
        }) {
          metaobject {
            id
            type
            fields { key value }
          }
          userErrors { field message code }
        }
      }`,
    );

    const createData = await createResponse.json();
    const createPayload = createData.data.metaobjectCreate;
    const metaobject = createPayload.metaobject;
    const metaobjectId = metaobject.id;
    console.log("lllllllllllllllllllllllllllllll");
    console.log(metaobjectId);
    console.log("lllllllllllllllllllllllllllllll");
  }
  //Create Discount
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
            productDiscounts: false,
            orderDiscounts: false,
            shippingDiscounts: false,
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
