import DiscountsList from "../components/DiscountsList";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const getResponse = await admin.graphql(
    `#graphql
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
      }`
  );

  const getData = await getResponse.json();
  return { getData };
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

}


export default function Discountlist() {
  return <DiscountsList />;
}