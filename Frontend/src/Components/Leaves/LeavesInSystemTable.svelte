<script>
  import RejectLeaveForm from "./RejectLeaveForm.svelte";
  import { onMount } from "svelte";
  import { user } from "../../stores/userStore";
  import toast, { Toaster } from 'svelte-french-toast';
  import { page } from '$app/stores';


  export let leavesData;
  export let handleAcceptLeaveButton;
  export let handleDeleteLeaveButton;
  export let handleRejectionSubmit;
  let selectedLeaveId;
  let showRejectionPopup=false;



  const handleRejectClick = (leaveId) => {
    selectedLeaveId = leaveId;
    showRejectionPopup = true;
  };

  onMount(() => {
    showRejectionPopup = false;
  });

  const handleRejectionCancel = () => {
    showRejectionPopup = false;
  };

  const handleReject=async(event)=>{
    try{
      showRejectionPopup=false;
      await handleRejectionSubmit(event)
    }catch(e){
      console.log(e.message)
    }
  }

</script>

  <Toaster />
  
  {#if leavesData}
  <div class="table-responsive">
    <table class="table table-bordered">
      <thead class="text-center">
        <tr>
          <th scope="col">Id</th>
          <th scope="col">Name</th>
          <th scope="col">Reason</th>
          <th scope="col">From</th>
          <th scope="col">To</th>
          {#if leavesData[0].status === 'rejected'}
            <th scope="col">Rejection Reason</th>
          {/if}
        </tr>
      </thead>
      <tbody class="text-center">
        {#each leavesData as leave (leave.id)}
          <tr>
            <td class="align-middle">{leave.id}</td>
            <td class="align-middle">{leave.Employee.name}</td>
            <td class="align-middle">{leave.reason}</td>
            <td class="align-middle">{leave.dates[0]}</td>
            <td class="align-middle">{leave.dates[leave.dates.length-1]}</td>
            {#if leave.status === 'rejected'}
              <td class="align-middle">{leave.rejectionReason}</td>
            {/if}
            {#if leave.status === 'Under Process' && $page.route.id === '/leaves'}
              <td class="align-middle"><button type="button" class="btn btn-success" on:click={()=>{handleAcceptLeaveButton(leave.id)}}>Accept</button></td>
              <td class="align-middle">  <button type="button" class="btn btn-danger" on:click={()=>{handleRejectClick(leave.id) }}>Reject</button></td>
            {:else if leave.status === 'Under Process' && $page.route.id === '/me/leaves'}
              <td class="align-middle">  <button type="button" class="btn btn-danger" on:click={()=>{handleDeleteLeaveButton(leave.id)}}>Delete</button></td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
    <RejectLeaveForm show={showRejectionPopup} leaveId={selectedLeaveId} on:cancel={handleRejectionCancel} on:submit={handleReject} />
  </div>
  {:else}
    <h3 class="text-center" style="margin-top:15%;">No such leaves in the system</h3>
  {/if}
  