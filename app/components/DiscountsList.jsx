import { useLoaderData, useFetcher } from "react-router";
import { useEffect } from "react";
import DeleteDiscount from "../components/DeleteDiscount";

export default function DiscountsList() {
  const loaderData = useLoaderData();
  const fetcher = useFetcher();

  const metaobjects = loaderData?.getData?.data?.metaobjects?.edges || [];

  const data = metaobjects.map(({ node }) => {
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

  console.log("=================================================================");
  console.log(loaderData);
  console.log("=================================================================");

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
            {data.map((item) => (
              <s-table-row key={item.id}>
                <s-table-cell>{item.title}</s-table-cell>
                <s-table-cell>{item.percentage}</s-table-cell>
                <s-table-cell>{item.message}</s-table-cell>
                <s-table-cell style={{ display: "flex", gap: "8px" }}>
                  {/* <EditAppView
                  id={item.id}
                  modalId={`edit-modal-${item.id.replace(/[^a-zA-Z0-9]/g, '-')}`}
                /> */}

                  <DeleteDiscount
                    id={item.id}
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
