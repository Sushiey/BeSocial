$(document).ready(function() {
    $.get("/all-posts-data", function(postsWithUsername, status) {
        $("#allPostsContainer").empty();
        if (Array.isArray(postsWithUsername)) {
            postsWithUsername.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            postsWithUsername.reverse();
            postsWithUsername.forEach(function(post) {
                const date = new Date(post.createdAt);
                const formattedDate = date.toLocaleDateString();
                const postHtml = `
                    <div class="post">
                        <div class="post-header">
                            <span class="post-author">${post.username}</span>
                            <span class="post-date">${formattedDate}</span>
                        </div>
                        <div class="post-content">${post.content}</div>
                    </div>
                `;
                $("#allPostsContainer").append(postHtml);
            });
        } else {
            console.error("Posts data is not an array:", postsWithUsername);
        }
    });

    $("#backToProfileBtn").click(function() {
        window.location.href = "/profile";
    });

    $("#logoutBtn").click(function() {
        $.post("/logout", function() {
            window.location.href = "/login";
        });
    });
});
