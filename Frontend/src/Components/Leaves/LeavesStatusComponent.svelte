<script>
    import { createEventDispatcher } from "svelte";
    const dispatch=createEventDispatcher();

    export let selectedStatus;

    const setLeaveStatus=(status)=>{
        console.log('status changed to ', status)
        dispatch('setLeaveStatus',{
            status
        })
    }
</script>

<div class="container" style="background-color: white;">
    <div class="custom-container m-0 ">
        <div class="custom-box">
            <p class={selectedStatus === 'Under Process'?"selected":""} on:click={()=>setLeaveStatus('Under Process')}>Pending</p>
        </div>
        <div class="custom-box">
            <p class={selectedStatus === 'approved'?"selected":""} on:click={()=>setLeaveStatus('approved')}>Approved</p>
        </div>
        <div class="custom-box">
            <p class={selectedStatus === 'rejected'?"selected":""} on:click={()=>setLeaveStatus('rejected')}>Rejected</p>
        </div>
    </div>
</div>

<style>
  .container{
      padding-left: 0px;
      padding-right: 0px;
      height: 10vh;
      border-radius: 5px;
  }

  .custom-container {
    display: flex;
    justify-content: space-around;
    height: 100%;
  }

  .custom-box {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        flex: 1;
        padding: 10px;
        border-right: 1px solid #ccc;
    }

  .custom-box:last-child {
    border-right: none;
  }

  p {
        margin-bottom: 0px;
        color: #40A2E3;
        font-weight: 600;
        font-size: 1.1rem;
        cursor: pointer;
    }


  .selected::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -5px;
        width: 100%;
        height: 2px;
        background-color: #4bb5f5;
    }

</style>
