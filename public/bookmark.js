document.addEventListener('DOMContentLoaded', async function () {
    const currentUserUsername = sessionStorage.getItem("loginusername");

    try {
        const response = await fetch(`/api/profile/bookmarks/${currentUserUsername}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            const bookmarkedPosts = await response.json();
            displayBookmarkedPosts(bookmarkedPosts);
        } else {
            console.error('Failed to fetch bookmarked posts:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching bookmarked posts:', error);
    }
});

function displayBookmarkedPosts(bookmarkedPosts) {
    const bookmarkedPostsContainer = document.getElementById('bookmarked-posts');

    bookmarkedPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'bookmarked-post';

        const postImage = document.createElement('img');
        postImage.src = post.image;
        postImage.alt = post.caption;

        const postCaption = document.createElement('p');
        postCaption.textContent = "Caption: " + post.caption;
        postCaption.className = 'bookmarked-post-caption';

        const postUsername = document.createElement('p');
        postUsername.textContent = "Username: " + post.username;
        postUsername.className = 'bookmarked-post-username';

        const likeCount = document.createElement('p');
        likeCount.textContent = "Likes: " + post.likes.length;
        likeCount.className = 'bookmarked-post-likes';

        postElement.appendChild(postImage);
        postElement.appendChild(postCaption);
        postElement.appendChild(postUsername);
        postElement.appendChild(likeCount);

        bookmarkedPostsContainer.appendChild(postElement);
    });
}
