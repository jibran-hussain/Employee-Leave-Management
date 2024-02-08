<script>
    import RegisterEmployeeModal from "./RegisterEmployeeModal.svelte";
    import { user } from "../stores/userStore";
    import { goto } from '$app/navigation'

    let showModal = false;
    

    const openModal=()=> {
        showModal = true;
    }

    const handleSignout=()=>{
        localStorage.removeItem('jwt');  
        goto('/')
        // user.set(null)
        
    }
</script>


{#if showModal}
    <RegisterEmployeeModal on:modalClosed={()=>showModal=false} />
{/if}


<!-- <nav class="navbar navbar-expand-lg navbar-light" style="border:1px blue;box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05); padding-left:2%; padding-right:2%">
    <a class="navbar-brand" href="#">Employee Leave Management System</a>

    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav ml-auto">
            {#if $user.role != 'employee'}
            <li class="nav-item">
                <a class="nav-link" href="#" on:click|preventDefault={openModal}>Register Employee</a>
            </li>
            {/if}
            <li class="nav-item">
                <a class="nav-link" href="#" on:click|preventDefault={handleSignout}>Sign Out</a>
            </li>
        </ul>
    </div>
</nav> -->

<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <a class="navbar-brand" href="#">Employee Leave Management System</a>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo03">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            {#if $user.role != 'employee'}
            <li class="nav-item">
                <a class="nav-link" href="#" on:click|preventDefault={openModal}>Register Employee</a>
            </li>
            {/if}
          <li class="nav-item">
            <a class="nav-link" href="#" on:click|preventDefault={handleSignout}>Sign Out</a>
        </li>
        </ul>
      </div>
    </div>
  </nav>


<style>
    .nav-link{
        color: #40A2E3;
    }

    .navbar-brand{
        font-family: 'Nunito Sans', sans-serif;
        color:#0B60B0;
    }
</style>