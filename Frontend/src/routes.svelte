<script>
    import { Router, Link, Route } from "svelte-routing";
    import Signin from './views/Signin.svelte'
    import AdminDashboard from "./views/AdminDashboard.svelte";
    import Test from "./views/Test.svelte";
</script>

<Router>

      <Route path="/">
        <Signin />
      </Route>

      <Route path="/dashboard">
        <AdminDashboard />
      </Route>
    
</Router>