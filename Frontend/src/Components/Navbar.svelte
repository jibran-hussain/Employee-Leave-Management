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


<nav class="navbar navbar-expand-lg " style="border:1px blue;box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05); padding-left:2%; padding-right:2%"  >
    <a class="navbar-brand" href="#">Employee Leave Management System</a>

    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="nav navbar-nav ml-auto" >
            {#if $user.role != 'employee'}
            <li class="nav-item">
                <a class="nav-link" href="#" on:click|preventDefault={openModal}>Create Employee</a>
            </li>
            {/if}
            <li class="nav-item">
                <a class="nav-link" href="#" on:click|preventDefault={handleSignout}>Sign Out</a>
            </li>
        </ul>
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