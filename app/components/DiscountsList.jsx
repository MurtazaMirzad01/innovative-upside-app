import { useLoaderData, useFetcher } from "react-router";
import { useEffect } from "react";
import DeleteDiscount from "../components/DeleteDiscount";
import EditDiscount from "../components/EditDiscount";

export default function DiscountsList() {
  const { metaobjects, discounts } = useLoaderData();
  const fetcher = useFetcher();

  const data = metaobjects.map((node) => {
    const titleField = node.fields.find((f) => f.key === "title");
    const percentageField = node.fields.find((f) => f.key === "percentage");
    const messageField = node.fields.find((f) => f.key === "message");

    return {
      id: node.id,
      title: titleField?.value || "",
      percentage: percentageField?.value || "",
      message: messageField?.value || "",
    };
  });
  const discountId = discounts.map((discount => discount.id));

  // const discountID = discountId[0]
  // console.log("=================================================================");
  // console.log(discountID);
  // console.log("=================================================================");




  // refresh on mutation complete
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.metaobjectUpdate || fetcher.data.metaobjectDelete) {
        window.location.reload();
      }
    }
  }, [fetcher.state, fetcher.data]);
  return (
    <s-page>
      <s-section>
        <s-table>
          <s-table-header-row>
            <s-table-header>Title</s-table-header>
            <s-table-header>Percentage(%)</s-table-header>
            <s-table-header>Message</s-table-header>
            <s-table-header>Actions</s-table-header>
          </s-table-header-row>

          <s-table-body>
            {data.map((item, index) => (
              <s-table-row key={item.id}>
                <s-table-cell>{item.title}</s-table-cell>
                <s-table-cell>{item.percentage}</s-table-cell>
                <s-table-cell>{item.message}</s-table-cell>
                <s-table-cell style={{ display: "flex", gap: "8px" }}>
                  <EditDiscount
                    id={item.id}
                    modalId={`edit-modal-${item.id.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  />

                  <DeleteDiscount
                    id={item.id}
                    discountId={discountId[index]}
                    modalId={`delete-modal-${item.id.replace(/[^a-zA-Z0-9]/g, '-')}`}
                  />
                </s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
      </s-section>
    </s-page>
  );
}
