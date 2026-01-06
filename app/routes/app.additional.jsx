import DiscountsList from "../components/DiscountsList";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Metaobjects
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

  // Discounts
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

  return {
    metaobjects,
    discounts,
  };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const id = formData.get("id");
  const discountId = formData.get("discountId");
  const actionType = formData.get("actionType");

  //  Delete discount FIRST
  if (actionType === "delete") {
    if (discountId) {
      await admin.graphql(
        `#graphql
  mutation discountAutomaticDelete($id: ID!) {
    discountAutomaticDelete(id: $id) {
      deletedAutomaticDiscountId
      userErrors {
        field
        code
        message
      }
    }
  }`,
        {
          variables: {
            "id": discountId
          },
        },
      );
    }

    // Delete metaobject
    if (id) {
      const res = await admin.graphql(
        `#graphql
      mutation MetaobjectDelete($id: ID!) {
        metaobjectDelete(id: $id) {
          deletedId
          userErrors {
            message
          }
        }
      }`,
        { variables: { id: id } }
      );

      return await res.json();
    }
  }
  // Update
  if (actionType === "update") {
    const title = formData.get("title");
    const percentage = formData.get("percentage");
    const message = formData.get("message");
    const product = formData.get("product");

    //update Metaobjects
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

    //update Discounts
    context = [];
    const updRes = await admin.graphql(
      `#graphql
  mutation discountAutomaticAppUpdate($automaticAppDiscount: DiscountAutomaticAppInput!, $id: ID!) {
    discountAutomaticAppUpdate(automaticAppDiscount: $automaticAppDiscount, id: $id) {
      automaticAppDiscount {
        title
        context {
          ... on DiscountCustomerSegments {
            segments {
              id
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }`,
      {
        variables: {
          "id": discountId,
          "automaticAppDiscount": {
            "context": {
              "all": {
                "All"
              }
            }
          }
        },
      },
    );
    return await res.json();
  }

  return null;
};

export default function Discountlist() {
  return <DiscountsList />;
}