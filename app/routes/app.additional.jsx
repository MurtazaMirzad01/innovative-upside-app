import DiscountsList from "../components/DiscountsList";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  /* 1️⃣ Metaobjects */
  const metaRes = await admin.graphql(`
    #graphql
    query {
      metaobjects(type: "discount_metaobject", first: 100) {
        edges {
          node {
            id
            type
            fields {
              key
              value
            }
          }
        }
      }
    }
  `);

  const metaJson = await metaRes.json();
  const metaobjects = metaJson.data.metaobjects.edges.map(
    (edge) => edge.node
  );

  /* 2️⃣ Discounts */
  const discountRes = await admin.graphql(`
    #graphql
    query {
      discountNodes(first: 10) {
        edges {
          node {
            id
            discount {
              __typename
            }
          }
        }
      }
    }
  `);

  const discountJson = await discountRes.json();
  const discounts = discountJson.data.discountNodes.edges.map(
    (edge) => edge.node
  );

  console.log("Metaobjects:", metaobjects);
  console.log("Discounts:", discounts);

  // ✅ React Router loader MUST return plain data
  return {
    metaobjects,
    discounts,
  };
};


export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const id = formData.get("id");
  const actionType = formData.get("actionType");

  // DELETE
  if (actionType === "delete") {
    const res = await admin.graphql(
      `#graphql
        mutation MetaobjectDelete($id: ID!) {
          metaobjectDelete(id: $id) {
            deletedId
            userErrors {
              field
              message
            }
          }
        }`,
      { variables: { id } }
    );
    return await res.json();

  }
  // UPDATE (FIXED VERSION)
  if (actionType === "update") {
    const title = formData.get("title");
    const percentage = formData.get("percentage");
    const message = formData.get("message");
    const product = formData.get("product");

    const res = await admin.graphql(
      `#graphql
        mutation UpdateMetaobject(
          $id: ID!
          $fields: [MetaobjectFieldInput!]!
        ) {
          metaobjectUpdate(id: $id, metaobject: { fields: $fields }) {
            metaobject {
              id
            }
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: {
          id,
          fields: [
            { key: "title", value: title },
            { key: "percentage", value: percentage },
            { key: "message", value: message },
            { key: "product", value: product },

          ],
        },
      }
    );

    return await res.json();
  }

}


export default function Discountlist() {
  return <DiscountsList />;
}