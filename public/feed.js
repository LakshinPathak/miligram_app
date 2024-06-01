document.addEventListener('DOMContentLoaded', async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const isScript1 = urlParams.get("script1") === "true";
  const isScript2 = urlParams.get("script2") === "true";
  const isScript3 = urlParams.get("script3") === "true";
  const isScript4 = urlParams.get("script4") === "true";
  const username = urlParams.get("fusername") || sessionStorage.getItem("loginusername");
  const currentUserUsername = urlParams.get("fusername") || sessionStorage.getItem("loginusername");
  if (isScript1 || isScript2 || isScript3 || isScript4) {
    const username = urlParams.get("fusername") || sessionStorage.getItem("loginusername");
    console.log(username);
    document.getElementById('username1').textContent = `${username}`;

    try {
      const response = await fetch(`/api/auth/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });

      const data = await response.json();
      console.log(data.profileImageUrl);

      if (data.profileImageUrl) {
        document.getElementById('profileImage').src = data.profileImageUrl;
      } else {
        document.getElementById('profileImage').src = 'assets/img/default-profile.png'; // Use a default image if no profile image is found
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }

    // Fetch suggestions
    try {
      const suggestionsResponse = await fetch('/api/profile/master', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });

      const suggestionsData = await suggestionsResponse.json();
      const suggestionsContainer = document.getElementById('suggestions');

      suggestionsData.forEach(suggestion => {
        if (suggestion.username !== username) {

          
          const suggestionCard = document.createElement('div');
          suggestionCard.className = 'card';

          const profileImage = document.createElement('img');
          profileImage.src = suggestion.profileImageUrl || 'assets/img/default-profile.png';
          profileImage.alt = suggestion.username;

          const infoDiv = document.createElement('div');
          infoDiv.className = 'info';

          const usernameDiv = document.createElement('div');
          usernameDiv.className = 'name';
          usernameDiv.textContent = suggestion.username;

          const followButton = document.createElement('button');
          followButton.className = 'follow-btn';
          followButton.textContent = 'Follow';
          followButton.dataset.username = suggestion.username;

          followButton.addEventListener('click', async function () {
            if (followButton.textContent === 'Follow') {
              await followUser(suggestion.username, followButton);
            } else {
              await unfollowUser(suggestion.username, followButton);
            }
          });

          infoDiv.appendChild(usernameDiv);
          infoDiv.appendChild(followButton);
          suggestionCard.appendChild(profileImage);
          suggestionCard.appendChild(infoDiv);
          suggestionsContainer.appendChild(suggestionCard);

         // loadUserPosts(suggestion.username);
        }
      });
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  }
  




//fetch following usernames
try {
  const response = await fetch(`/api/profile/relation_username/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });

  const data = await response.json();


  console.log(data.following);


  for(var i=0;i<data.following.length;i++)
    {
      loadUserPosts(data.following[i]);
    }

} catch (error) {
  console.error('Error fetching user data:', error);
}






















  


  async function followUser(username, button) {
    try {
        const response = await fetch(`/api/profile/follow/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({ currentUserUsername })
        });

        if (response.ok) {
            button.textContent = 'Unfollow';
            button.classList.add('unfollow');
            localStorage.setItem(`${username}-followed`, 'true'); // Store follow status in local storage
            window.location.reload(true);
          //  loadUserPosts(username);
        } else {
            console.error('Error following user:', response.statusText);
        }
    } catch (error) {
        console.error('Error following user:', error);
    }
   
}

// Check if the user is already followed and update button text accordingly
const followButtons = document.querySelectorAll('.follow-btn');
followButtons.forEach(button => {
    const username = button.dataset.username;
    const isFollowed = localStorage.getItem(`${username}-followed`);
    if (isFollowed === 'true') {
        button.textContent = 'Unfollow';
        button.classList.add('unfollow');
    }
});

async function unfollowUser(username, button) {

  try {
    const response = await fetch(`/api/profile/unfollow/${username}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({ currentUserUsername })
    });

    if (response.ok) {
      button.textContent = 'Follow';
      button.classList.remove('unfollow');
      localStorage.removeItem(`${username}-followed`); // Remove the follow status from local storage
     // removeUserPosts(username);
      window.location.reload(true);
     // removeUserPosts(username);
    } else {
      console.error('Error unfollowing user:', response.statusText);
    }
  } catch (error) {
    console.error('Error unfollowing user:', error);
  }
 // window.location.reload(true);
}


async function loadUserPosts(username) {

  try {
      // Fetch posts from users that the current user is following
      const response = await fetch(`/api/profile/${username}/fetch_post_feed`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + localStorage.getItem('token')
          }
      });

      const postsData = await response.json();
      const feedPostsContainer = document.getElementById('feed-posts');

      // Clear previous posts
     // feedPostsContainer.innerHTML = '';

      // Append new posts
      postsData.forEach(post => {
          const postElement = document.createElement('div');
          postElement.className = 'post';
          postElement.dataset.username = username;

          // Create post image element
          const postImage = document.createElement('img');
          postImage.src = post.image;
          postImage.alt = post.caption;
          postImage.className = 'post-image';
          postElement.appendChild(postImage);

          // Create post caption element
          const postCaption = document.createElement('p');
          postCaption.textContent = "Caption: "+post.caption;
          postCaption.className = 'post-caption';
          postElement.appendChild(postCaption);


           // Create post username element
           const postusername = document.createElement('p');
           postusername.textContent = "Username: "+ post.username;
           postusername.className = 'post-username';
           postElement.appendChild(postusername);

          // Create comments section
          const commentsSection = document.createElement('div');
          commentsSection.className = 'comments';
          post.comments.forEach(comment => {
              const commentElement = document.createElement('p');
              commentElement.textContent = "Comments: "+comment.text;
              commentsSection.appendChild(commentElement);
          });
          postElement.appendChild(commentsSection);

          // Create add comment section
          const addCommentDiv = document.createElement('div');
          addCommentDiv.className = 'add-comment';

          const commentInput = document.createElement('input');
          commentInput.type = 'text';
          commentInput.placeholder = 'Add a comment...';
          addCommentDiv.appendChild(commentInput);

          const commentButton = document.createElement('button');
          commentButton.textContent = 'Post';
          commentButton.addEventListener('click', async () => {
              await postComment(post._id, commentInput.value, commentsSection);
              commentInput.value = '';
          });
          addCommentDiv.appendChild(commentButton);

          postElement.appendChild(addCommentDiv);

          // Append post element to container
          feedPostsContainer.appendChild(postElement);
      });
  } catch (error) {
      console.error('Error loading posts:', error);
  }
}


  async function postComment(postId, comment, commentsSection) {
  //   try {
  //     const response = await fetch(`/api/posts/${postId}/comment`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': 'Bearer ' + localStorage.getItem('token')
  //       },
  //       body: JSON.stringify({ comment })
  //     });

  //     if (response.ok) {
  //       const commentElement = document.createElement('p');
  //       commentElement.textContent = comment;
  //       commentsSection.appendChild(commentElement);
  //     } else {
  //       console.error('Error posting comment:', response.statusText);
  //     }
  //   } catch (error) {
  //     console.error('Error posting comment:', error);
  //   }
  }

  function removeUserPosts(username) {
  //   const feedPostsContainer = document.getElementById('feed-posts');
  //   const posts = feedPostsContainer.querySelectorAll(`[data-username="${username}"]`);
  //   posts.forEach(post => post.remove());
  }
});
