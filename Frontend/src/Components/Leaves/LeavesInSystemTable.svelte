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
  export let handleUpdateLeaveButton;
  export let handlePageChange;
  let selectedLeaveId;
  let showRejectionPopup=false;

  let currentDate=new Date();
  currentDate.setUTCHours(0,0,0,0);



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
  {#if leavesData?.data}
  <div class="table-responsive">
    <table class="table table-bordered">
      <thead class="text-center">
        <tr>
          <th scope="col">Id</th>
          <th scope="col">Name</th>
          <th scope="col">Reason</th>
          <th scope="col">From</th>
          <th scope="col">To</th>
          {#if leavesData?.data[0].status === 'rejected'}
            <th scope="col">Rejection Reason</th>
          {/if}
        </tr>
      </thead>
      <tbody class="text-center">
        {#each leavesData.data as leave (leave.id)}
          <tr>
            <td class="align-middle">{leave.id}</td>
            <td class="align-middle">{leave.Employee.name}</td>
            <td class="align-middle">{leave.reason}</td>
            <td class="align-middle">{leave.dates[0]}</td>
            <td class="align-middle">{leave.dates[leave.dates.length-1]}</td>
            {#if leave.status === 'rejected'}
              <td class="align-middle">{leave.rejectionReason}</td>
            {/if}
            {#if leave.status === 'Under Process' && $page.route.id === '/dashboard/employees/leaves'}
              <td class="align-middle"><button type="button" class="btn btn-success" on:click={()=>{handleAcceptLeaveButton(leave.id)}}>Accept</button></td>
              <td class="align-middle">  <button type="button" class="btn btn-danger" on:click={()=>{handleRejectClick(leave.id) }}>Reject</button></td>
            {:else if leave.status === 'Under Process' && $page.route.id === '/dashboard/me/leaves'}
              <td class="align-middle">  <button type="button" class="btn btn-danger" on:click={()=>{handleDeleteLeaveButton(leave.id)}}>Delete</button></td>
              <td class="align-middle">  <button type="button" class="btn btn-primary" on:click={()=>{handleUpdateLeaveButton(leave.id)}}>Update</button></td>
            
            {/if}

            {#if leave.status === 'approved' &&  $page.route.id === '/dashboard/me/leaves' && new Date(leavesData?.data[0].dates[0]).getTime() > currentDate.getTime()}
              <td class="align-middle">  <button type="button" class="btn btn-danger" on:click={()=>{handleDeleteLeaveButton(leave.id)}}>Delete</button></td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>

    {#if leavesData}
            <nav aria-label="..." class="d-flex justify-content-center align-items-center">
                <ul class="pagination">
                <!-- <li class="page-item disabled">
                    <a class="page-link" href="#" tabindex="-1" aria-disabled="true">Previous</a>
                </li> -->
                
                {#each Array.from({ length: leavesData.metadata.totalPages }) as _, i (i+1)}
                    {#if leavesData.metadata.currentPage === i+1}
                    <li class="page-item active" aria-current="page">
                        <a class="page-link" href="#" on:click|preventDefault={(event)=>handlePageChange(event,i+1)}>{i+1}</a>
                    </li>
                    {:else}
                    <li class="page-item"><a class="page-link" href="#" on:click|preventDefault={(event)=>handlePageChange(event,i+1)}>{i+1}</a></li>
                    {/if}
                {/each}
                
                <!-- <li class="page-item">
                    <a class="page-link" href="#">Next</a>
                </li> -->
                </ul>
            </nav>
            
            {/if}

    <RejectLeaveForm show={showRejectionPopup} leaveId={selectedLeaveId} on:cancel={handleRejectionCancel} on:submit={handleReject} />
  </div>
  {:else}
    <h4 class="text-center" style="margin-top:15%; color:#B4B4B8">No such leaves in the system</h4>
  {/if}
  