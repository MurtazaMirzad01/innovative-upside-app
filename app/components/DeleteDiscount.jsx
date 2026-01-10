import { useFetcher } from "react-router";

export default function DeleteDiscount({ id, modalId, discountId }) { // Accept modalId prop
  const fetcher = useFetcher();

  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  console.log(discountId);
  console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<");

  function handleSubmit(event) {
    event.preventDefault();

    fetcher.submit(
      {
        id: id,
        actionType: "delete",
        discountId: discountId
      },
      { method: "post" }
    );
  }

  return (
    <>
      <s-button
        icon="delete"
        tone="critical"
        commandFor={modalId} // Use the unique modal ID
        command="--show"
      >
      </s-button>

      <s-modal
        id={modalId} // Use the unique modal ID
      >
        <s-stack paddingBlockStart="base" paddingBlockEnd="base">
          <s-heading>Are Sure You Want To Delete This Discount?</s-heading>
        </s-stack>

        <s-button slot="secondary-actions" commandFor={modalId} command="--hide">
          Cancel
        </s-button>
        <s-button
          slot="primary-action"
          variant="primary"
          commandFor={modalId}
          command="--hide"
          onClick={handleSubmit}
        >
          Delete
        </s-button>
      </s-modal>
    </>
  );
}