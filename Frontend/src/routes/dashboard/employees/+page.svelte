<script>
    import AdminDashboard from "../../../views/AdminDashboard.svelte";
    import { user } from "../../../stores/userStore";
</script>

<body>
    {#if $user}
        <AdminDashboard />
    {/if}
</body>