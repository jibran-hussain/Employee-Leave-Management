<script>
  import RejectLeaveForm from "./RejectLeaveForm.svelte";
  import { onMount } from "svelte";
  import { user } from "../../stores/userStore";

  export let leavesData;
  export let handleAcceptLeaveButton;

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

  const handleRejectionSubmit = async(event) => {
    try{
      const response=await fetch(`http://localhost:3000/api/v1/leaves/${leaveId}/accept`,{
                method:"POST",
                headers:{
                    Authorization:`Bearer ${$user.token}`
                }
            })
          if(response.ok){

          }
          else{
            
          }

      showRejectionPopup = false;
    }catch(e){

    }
  };

</script>
  
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
            {#if leave.status === 'Under Process'}
              <td class="align-middle"><button type="button" class="btn btn-success" on:click={()=>{handleAcceptLeaveButton(leave.id)}}>Accept</button></td>
              <td class="align-middle">  <button type="button" class="btn btn-danger" on:click={()=>{handleRejectClick(leave.id) }}>Reject</button></td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
    <RejectLeaveForm show={showRejectionPopup} leaveId={selectedLeaveId} on:cancel={handleRejectionCancel} on:submit={handleRejectionSubmit} />
  </div>
  