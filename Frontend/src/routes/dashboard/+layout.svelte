<script>
    import Sidebar from "../../Components/Sidebar.svelte";
    import Navbar from "../../Components/Navbar.svelte";
    import toast, { Toaster } from 'svelte-french-toast';
</script>

<Toaster />
<Navbar />
<div class="container-fluid">
    <div class="row vh-100">
        <Sidebar />
        <div class="col-md-9 ml-sm-auto col-lg-10 px-md-4 bg-light">
            <slot />
        </div>    
    </div>
</div>