<script>
    import { createEventDispatcher } from "svelte";
    const dispatch=createEventDispatcher();


    const setLeaveStatus=(status)=>{
        console.log('status changed to ', status)
        dispatch('setLeaveStatus',{
            status
        })
    }
</script>

<div class="container bg-light">
    <div class="custom-container m-0 ">
        <div class="custom-box">
            <p on:click={()=>setLeaveStatus('Under Process')}>Pending (2)</p>
        </div>
        <div class="custom-box">
            <p on:click={()=>setLeaveStatus('approved')}>Approved (10)</p>
        </div>
        <div class="custom-box">
            <p on:click={()=>setLeaveStatus('rejected')}>Rejected (5)</p>
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
    flex: 1;
    padding: 10px;
    border-right: 1px solid #ccc;
  }

  .custom-box:last-child {
    border-right: none;
  }

  p{
    margin-bottom: 0px;
    color:#279EFF;
  }
</style>
