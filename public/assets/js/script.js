$(() => {
    $("#scrape-btn").on('click', () => {
        axios.get('/scrape')
        .then(response => {
            console.log(response);
        })
        .catch(err => {
            console.error(err);
        });
    });
});