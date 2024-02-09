<script>
  export let totalPages;
  export let currentPage;
  export let onPageChange;

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  let pagesToShow = [];

  // Reactive statement to calculate the range of pages to display
  $: {
    const range =  1; // Adjust this value to change the number of pages to show on each side of the current page
    const start = Math.max(1, currentPage - range);
    const end = Math.min(totalPages, currentPage + range);

    // Generate the list of pages to show
    pagesToShow = Array.from({ length: end - start +  1 }, (_, i) => start + i);
  }

  const handleNextClick = () => {
    if (currentPage !== totalPages) {
      handlePageClick(currentPage +  1);
    }
  };

  const handlePreviousClick = () => {
    if (currentPage >  1) {
      handlePageClick(currentPage -  1);
    }
  };
</script>

<nav aria-label="Pagination" class="d-flex justify-content-center align-items-center">
  <ul class="pagination">
    <li class="page-item {currentPage ===  1 ? 'disabled' : ''}">
      <a class="page-link" href="#" on:click|preventDefault={handlePreviousClick} aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>

    {#each pagesToShow as page (page)}
      <li class="{currentPage === page ? 'page-item active' : 'page-item'}">
        <a class="page-link" href="#" on:click|preventDefault={() => handlePageClick(page)}>{page}</a>
      </li>
    {/each}

    <li class="page-item {currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" on:click|preventDefault={handleNextClick} aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  </ul>
</nav>
