$(() => {
    let hasShownModal = localStorage.getItem('hasShownModal');
    console.log(hasShownModal);
    if (hasShownModal === null) {
        localStorage.setItem('hasShownModal', 1);
        $("#initScrapeModal").modal();
    }
    console.log(hasShownModal);

    // $("#scrape-btn").on('click', () => {
    //     axios.get('/scrape')
    //     .then(response => {
    //         console.log(response);
    //         // window.location.href = '/';
    //     })
    //     .catch(err => {
    //         console.error(err);
    //     });
    // });

    $(".save-article-btn").on('click', function() {
        $("#article-saved-div").show();
        $("#add-note-div").hide();
        $("#note-saved-div").hide();
        $(this).css('background-color', '#222').css('border', 'none').text('Saved').css('opacity', '0.5');

        console.log('====================================');
        
        const articleId = $(this).data('id');
        console.log(`article id: ${articleId}`);
        $(".save-note-btn").data('id', articleId);

        axios.get(`/api/articles/${articleId}`)
        .then(response => {

            const hasNote = response.data.note !== undefined;

            if (hasNote) {
                console.log(`has note: ${hasNote}`);
                console.log(response.data.note);
                $("#note-title").val(response.data.note.title);
                $("#note-body").val(response.data.note.body);
            } else {
                console.log(`has note: ${hasNote}`);
                $("#note-title").val('');
                $("#note-body").val('');
            }

            console.log('====================================');
        })
        .catch(err => {
            console.error(err);
        });

        $("#saveModal").on('hide.bs.modal', () => {
            $(this).attr('disabled', 'true').css('cursor', 'default');
        });
    });

    $(".add-note-btn").on('click', () => {
        $("#article-saved-div").hide();
        $("#add-note-div").show();
        $("#note-saved-div").hide();
    });

    $(".save-note-btn").on('click', function() {
        $("#article-saved-div").hide();
        $("#add-note-div").hide();
        $("#note-saved-div").show();

        const articleId = $(this).data('id');

        const newNote = {
            title: $("#note-title").val().trim(),
            body: $("#note-body").val().trim()
        }

        axios.post(`/api/articles/${articleId}`, newNote)
            .then(updatedArticle => {
                console.log('updated article:');
                console.log(updatedArticle.data);
            })
            .catch(err => {
                console.error(err);
            });
    });

    $(".unsave-btn").on('click', function() {
        const articleId = $(this).data('id');
        console.log(`article id: ${articleId}`);
        $(".unsave-yes-btn").data('id', articleId);
    });

    $(".unsave-btn").on('click', () => {
        $("#confirm-unsave-div").show();
        $("#unsave-success-div").hide();
    });

    $(".unsave-yes-btn").on('click', function() {
        $("#confirm-unsave-div").hide();

        const articleId = $(this).data('id');

        axios.get(`/api/unsave/${articleId}`)
        .then(unsavedArticle => {
            console.log(unsavedArticle);
            console.log(`article ${articleId} saved: ${unsavedArticle.data.saved}`);
            $("#unsave-success-div").show();
        })
        .catch(err => {
            console.error(err);
        });

        $("#unsaveModal").on('hide.bs.modal', () => {
            document.location.reload(true);
        });
    });

    $(".view-note-btn").on('click', function() {
        $("#update-note-div").show();
        $("#note-updated-div").hide();

        const articleId = $(this).data('id');
        console.log(`article id: ${articleId}`);
        $(".update-note-btn").data('id', articleId);

        axios.get(`/api/articles/${articleId}`)
        .then(response => {
            console.log(response.data.note);
            $("#note-title").val(response.data.note.title);
            $("#note-body").val(response.data.note.body);
        })
        .catch(err => {
            console.error(err);
        });
    });

    $(".update-note-btn").on('click', function() {
        $("#update-note-div").hide();
        $("#note-updated-div").show();

        const articleId = $(this).data('id');

        const updatedNote = {
            title: $("#note-title").val().trim(),
            body: $("#note-body").val().trim()
        }

        axios.post(`/api/articles/${articleId}`, updatedNote)
            .then(updatedArticle => {
                console.log('updated article:');
                console.log(updatedArticle.data);
            })
            .catch(err => {
                console.error(err);
            });
    });

});

// $(window).unload(function() {
//     localStorage.removeItem('hasShownModal');
//     axios.get('/api/clear')
//     .then(response => {
//         console.log(response);
//     })
//     .catch(err => {
//         console.error(err);
//     });
// });