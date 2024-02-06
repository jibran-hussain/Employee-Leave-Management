<script>
    import AdminDashboard from '../../views/AdminDashboard.svelte';
    import PersonalLeaveManagement from '../../views/PersonalLeaveManagement.svelte';
    import { user } from '../../stores/userStore';
</script>


{#if $user.role === 'admin' || $user.role === 'superadmin'}
    <AdminDashboard />
{:else}
    <PersonalLeaveManagement />
{/if}
