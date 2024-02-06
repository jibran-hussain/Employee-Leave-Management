<script>
    import { user } from '../../../../stores/userStore';
import LeaveManagement from '../../../../views/LeaveManagement.svelte'
</script>

{#if $user}
    <LeaveManagement />
{/if}