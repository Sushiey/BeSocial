$(document).ready(function() {
    $.get("/user", function(data, status) {
        $("#userName").text(data.username);
        $("#userEmail").text(data.email);
    });

function fetchUserPosts() {
    $.get("/user", function(user, status) {
        if (status === "success") {
            const userId = user.id;
            $.get(`/user-posts-data?userId=${userId}`, function(posts, status) {
                console.log("Received user posts from server:", posts);
                // Clear previous posts
                $("#userPostsCards").empty();

                if (Array.isArray(posts)) {
                    posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    posts.reverse();
                    posts.forEach(function(post) {
                        const date = new Date(post.createdAt);
                        const formattedDate = date.toLocaleDateString();
                        const cardHtml = `
                            <div class="card">
                                <div class="card-body">
                                    <p class="card-text">${post.content}</p>
                                    <p class="card-text"><small class="text-muted">${formattedDate}</small></p>
                                </div>
                            </div>
                        `;
                        $("#userPostsCards").append(cardHtml);
                    });
                } else {
                    console.error("User posts data is not an array:", posts);
                }
            });
        } else {
            console.error("Error fetching user data:", status);
        }
    });
}
    fetchUserPosts();
    $("#postForm").submit(function(event) {
        event.preventDefault();
        const content = $("#postContent").val();
        $.post("/posts", { content: content }, function(data, status) {
            fetchUserPosts();
        });
    });

    $("#logoutButton").click(function() {
        $.post("/logout", function(data, status) {
            window.location.href = "/login";
        });
    });
});
