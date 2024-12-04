import { getAuth, db, collection, getDocs, query, where, orderBy } from './firebase.js';

document.addEventListener("DOMContentLoaded", function () {
    // Get the user ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');

    // Check if userId is available
    if (!userId) {
        console.error("User ID not found in URL parameters");
        return;
    }

    // Check if the posts container element exists
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) {
        console.error("Post container element not found");
        return;
    }

    // Function to fetch posts for the specific user
    async function fetchUserPosts(userId) {
        try {
            // Create a query to fetch posts where the userId matches
            const postsQuery = query(
                collection(db, 'posts'),  // Assume all posts are in the 'posts' collection
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')  // Order by the creation timestamp
            );

            const querySnapshot = await getDocs(postsQuery);
            if (querySnapshot.empty) {
                postsContainer.innerHTML = `<p>No posts found for this user.</p>`;
                return;
            }

            // Clear previous content
            postsContainer.innerHTML = '';

            // Loop through each document in the querySnapshot
            querySnapshot.forEach((doc) => {
                const post = doc.data();
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                postElement.innerHTML = `
                    <div class="post-header">
                        <h3 class="post-title">${post.title}</h3>
                        <p class="post-category">${post.category}</p>
                    </div>
                    <p class="post-description">${post.description}</p>
                `;
                postsContainer.appendChild(postElement);
            });
        } catch (error) {
            console.error("Error fetching posts for user:", error);
            postsContainer.innerHTML = `<p>There was an error fetching the posts.</p>`;
        }
    }

    // Call the function to fetch posts for the user
    fetchUserPosts(userId);
});
