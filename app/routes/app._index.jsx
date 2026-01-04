import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import Discount from "../components/Discount";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const title = formData.get("title");
  const percentage = formData.get("percentage");
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
  console.log("hhhhhhhhhhhhhhhhhhhhhhhhhh");
  console.log("Product IDs:", productIds);
  console.log("hhhhhhhhhhhhhhhhhhhhhhhhhh");

  console.log("==================================================================");
  console.log(title);
  console.log(percentage);
  console.log(product);
  console.log(actionType);
  console.log(productDistount);
  console.log(oderDiscount);
  console.log(shippingDiscount);
  console.log("==================================================================");
}
export default function Index() {

  return <Discount />
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
