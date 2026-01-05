import { useState } from "react";
import { Form, useFetcher } from "react-router";

export default function Discount() {
  const [title, setTitle] = useState("");
  const [percentage, setPercentage] = useState("");
  const [message, setMessage] = useState("");
  const [products, setProducts] = useState([]);

  const fetcher = useFetcher();

  function handleSubmit(event) {
    event.preventDefault();

    fetcher.submit(
      {
        title,
        percentage,
        message,
        product: JSON.stringify(products),
        actionType: "create",
      },
      { method: "post" }
    );

    console.log("Form submitted");
    setTitle("");
    setPercentage("");
    setMessage("");
    setProducts([]);
  }


  function handleDiscard() {
    setTitle("");
    setPercentage("");
    setMessage("");
    setProducts([]);
  }


  async function handleProductBrowse() {
    const selected = await shopify.resourcePicker({
      multiple: true,
      type: "product"
    });

    setProducts(prevProducts => {
      const existingIds = new Set(prevProducts.map(p => p.id));
      const newProducts = selected.selection.filter(
        product => !existingIds.has(product.id)
      );
      return [...prevProducts, ...newProducts];
    });

  }
  function handleRemoveProductFromCard(productId) {
    setProducts(prevProducts =>
      prevProducts.filter(product => product.id !== productId)
    );
  }
  return (
    <s-page heading="Create Discount">
      <s-section heading="Amount off products">
        <Form
          data-save-bar
          onSubmit={handleSubmit}
          onReset={handleDiscard}
        >
          <s-stack gap="base">
            <s-query-container>
              <s-grid gridTemplateColumns="@container (inline-size > 300px) 1fr 1fr 1fr, 1fr" gap="base">
                <s-grid-item>
                  <s-text-field
                    label="Title"
                    details="Customers will see this in their cart and at checkout."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </s-grid-item>
                <s-grid-item>
                  <s-text-field
                    label="Percentage"
                    value={percentage}
                    onChange={(e) => setPercentage(e.target.value)}
                  />
                </s-grid-item>
                <s-grid-item>
                  <s-text-field
                    label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </s-grid-item>
              </s-grid>
            </s-query-container>
            <s-stack gap="base" direction="inline" align="center">
              <s-text>Please select a product: </s-text>
              <s-button onClick={handleProductBrowse} >Browse</s-button>
            </s-stack>
            {products.length > 0 && (
              <s-stack
                gap="small-300"
                padding="small-300"
              >
                {products.map((product) => (
                  <s-stack key={product.id} direction="inline" gap="base" border="base" borderStyle="dotted" padding="small-300" justifyContent="space-between">
                    <s-stack direction="inline" gap="base" >
                      <s-box inlineSize="50px" blockSize="50px">
                        <s-image
                          src={product.images?.[0]?.originalSrc || ''}
                          alt={product.title}
                          aspectRatio="1/0.5"
                        />
                      </s-box>
                      <s-box>
                        <s-text>{product.title}</s-text>
                        <s-paragraph>{product.publishedAt}</s-paragraph>
                      </s-box>
                    </s-stack>
                    <s-stack>
                      <s-icon
                        type="x"
                        onClick={() => handleRemoveProductFromCard(product.id)}
                      >
                      </s-icon>
                    </s-stack>
                  </s-stack>
                ))}
              </s-stack>
            )}
          </s-stack>
        </Form>
      </s-section>
    </s-page>
  );
} 