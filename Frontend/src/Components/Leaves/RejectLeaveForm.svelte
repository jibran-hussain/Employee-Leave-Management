<!-- RejectionPopup.svelte -->
<script>
  import { createEventDispatcher } from "svelte";

  export let show;
  export let leaveId;

  let rejectionReason = "";

  const dispatch = createEventDispatcher();

  const handleCancelClick = () => {
    dispatch("cancel");
  };

  const handleSubmitClick = () => {
    dispatch("submit", { leaveId, rejectionReason });
  };
</script>

{#if show}
  <div class="popup">
    <textarea bind:value={rejectionReason} placeholder="Enter rejection reason"></textarea>
    <button type="button" class="btn btn-primary" on:click={handleSubmitClick}>Submit</button>
    <button type="button" class="btn btn-secondary" on:click={handleCancelClick}>Cancel</button>
  </div>
{/if}

<style>
  .popup {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    padding: 20px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
  }

  textarea {
    width: 100%;
    height: 100px;
    margin-bottom: 10px;
    resize: none;
    padding: 8px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  button {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn-primary {
    background-color: #007bff;
    color: #fff;
  }

  .btn-secondary {
    background-color: #6c757d;
    color: #fff;
  }
</style>

