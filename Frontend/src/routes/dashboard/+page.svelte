<script>
    import AdminDashboard from '../../views/AdminDashboard.svelte';
    import PersonalLeaveManagement from '../../views/PersonalLeaveManagement.svelte';
    import { user } from '../../stores/userStore';
</script>


{#if $user && $user?.role === 'admin' || $user?.role === 'superadmin'}
    <AdminDashboard />
{:else if $user && $user.role === 'employee'}
    <PersonalLeaveManagement />
{/if}
