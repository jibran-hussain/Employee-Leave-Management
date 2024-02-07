<script>
    export let totalPages;
    export let currentPage;
    export let onPageChange;
  
    const handlePageClick = (event, page) => {
      event.preventDefault();
      onPageChange(page);
    };
  </script>
  
  <nav aria-label="..." class="d-flex justify-content-center align-items-center">
    <ul class="pagination">
      {#each Array.from({ length: totalPages }) as _, i (i + 1)}
        {#if currentPage === i+1}
          <li class="page-item active" aria-current="page">
            <a class="page-link" href="#" on:click|preventDefault={(event) => handlePageClick(event, i+1)}>{i+1}</a>
          </li>
        {:else}
          <li class="page-item">
            <a class="page-link" href="#" on:click|preventDefault={(event) => handlePageClick(event, i+1)}>{i+1}</a>
          </li>
        {/if}
      {/each}
    </ul>
  </nav>
  