<script>
  import debounce from "../utils/debounce";

  export let totalPages;
  export let currentPage;
  export let onPageChange;

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  let pagesToShow = [];

  $: {
    const range =  1;
    const start = Math.max(1, currentPage - range);
    const end = Math.min(totalPages, currentPage + range);

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

  const debouncedNextClick=debounce(handleNextClick,500);
  const debouncedPreviousClick=debounce(handlePreviousClick,500);
  const debouncedPageClick=debounce(handlePageClick,500);


</script>

<nav aria-label="Pagination" class="d-flex justify-content-center align-items-center">
  <ul class="pagination">
    <li class="page-item {currentPage ===  1 ? 'disabled' : ''}">
      <a class="page-link" href="#" on:click|preventDefault={debouncedPreviousClick} aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>

    {#each pagesToShow as page (page)}
      <li class="{currentPage === page ? 'page-item active' : 'page-item'}">
        <a class="page-link" href="#" on:click|preventDefault={() => debouncedPageClick(page)}>{page}</a>
      </li>
    {/each}

    <li class="page-item {currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" on:click|preventDefault={debouncedNextClick} aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  </ul>
</nav>
