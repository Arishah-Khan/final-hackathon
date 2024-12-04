import { getAuth, db, collection, addDoc, serverTimestamp, getDocs, query, orderBy, onAuthStateChanged, onSnapshot } from './firebase.js';

const auth = getAuth();

document.addEventListener("DOMContentLoaded", function () {
  // Check if the user is logged in
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is logged in
      const userName = user.displayName || "User";
      const userImage = user.photoURL || "default_image_url"; // Replace with the user's profile image URL

      // Show user info and hide register button
      document.getElementById('registerDiv').style.display = 'none';
      document.getElementById('userInfo').style.display = 'flex';
      document.getElementById('userName').innerText = userName;
      document.getElementById('userImage').src = userImage;

    } else {
      // User is not logged in
      document.getElementById('registerDiv').style.display = 'flex';
      document.getElementById('userInfo').style.display = 'none';
    }
  });

  // Toggle Add Post Button Visibility
  document.getElementById('addPostButton').addEventListener('click', function () {
    const categoryDropdown = document.getElementById('categoryDropdown');
    categoryDropdown.classList.toggle('hidden'); // Toggle visibility
  });

  // Show Post Form for selected category
  document.getElementById('techCategory').addEventListener('click', function () {
    showPostForm("Technology");
  });
  document.getElementById('lifestyleCategory').addEventListener('click', function () {
    showPostForm("Lifestyle");
  });
  document.getElementById('eduCategory').addEventListener('click', function () {
    showPostForm("Education");
  });

  function showPostForm(category) {
    const postForm = document.getElementById('postForm');
    postForm.classList.remove('hidden');  // Make the form visible
    postForm.dataset.category = category; // Store selected category in form data attribute
    document.getElementById('categoryDropdown').classList.add('hidden');  // Hide category dropdown
  }

  // Submit Post
  document.getElementById('submitPostButton').addEventListener('click', async function () {
    const user = auth.currentUser;
    if (!user) {
      alert("You need to register first!");
      return;
    }

    const title = document.getElementById('postTitle').value;
    const description = document.getElementById('postDescription').value;
    const category = document.getElementById('postForm').dataset.category;

    if (title && description) {
      try {
        // Add the new post to the Firestore collection for the selected category
        await addDoc(collection(db, category), {
          title: title,
          description: description,
          userId: user.uid,
          category: category,
          createdAt: serverTimestamp(),
        });

        alert("Post Submitted!");
        fetchPosts();  // Refresh all posts after submission

        // Hide the category dropdown after post submission
        document.getElementById('categoryDropdown').classList.add('hidden');

        // Optionally, hide the post form if desired
        document.getElementById('postForm').classList.add('hidden');
      } catch (error) {
        console.error("Error submitting post: ", error);
      }
    }
  });

  // Fetch and Display Posts from All Categories
  async function fetchPosts() {
    // Clear previous posts in all categories
    document.getElementById('techPostsContainer').innerHTML = '';
    document.getElementById('lifestylePostsContainer').innerHTML = '';
    document.getElementById('eduPostsContainer').innerHTML = '';

    const categories = ['Technology', 'Lifestyle', 'Education'];
    try {
      for (let category of categories) {
        // Create a query to fetch posts ordered by creation date
        const postsQuery = query(collection(db, category), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(postsQuery);

        querySnapshot.forEach(async (doc) => {
          const post = doc.data();
          const postElement = document.createElement('div');
          postElement.classList.add('p-4', 'bg-white', 'shadow-md', 'rounded-md');

          // Fetch user profile information (photo and name) from Firebase Authentication
          const userName = post.userId;  // Adjust this based on your structure if you're storing user info elsewhere
          const userImage = 'default_image_url';  // Default or fetched user image

          postElement.innerHTML = `
            <div class="flex items-center">
              <img src="${userImage}" alt="${userName}" class="w-10 h-10 rounded-full mr-4">
              <div>
                <p class="font-bold">${userName}</p>
                <p class="text-sm text-gray-500">${post.category} Post</p>
              </div>
            </div>
            <h3 class="font-bold mt-4">${post.title}</h3>
            <p>${post.description}</p>
          `;

          // Append the post to the respective category container
          if (category === 'Technology') {
            document.getElementById('techPostsContainer').appendChild(postElement);
          } else if (category === 'Lifestyle') {
            document.getElementById('lifestylePostsContainer').appendChild(postElement);
          } else if (category === 'Education') {
            document.getElementById('eduPostsContainer').appendChild(postElement);
          }
        });
      }
    } catch (error) {
      console.error("Error getting posts: ", error);
    }
  }

  // Listen to real-time updates in posts
  function listenToPosts() {
    const categories = ['Technology', 'Lifestyle', 'Education'];
    categories.forEach(category => {
      const postsRef = collection(db, category);
      onSnapshot(postsRef, (snapshot) => {
        snapshot.docChanges().forEach(change => {
          if (change.type === "added") {
            // Handle new post added
            fetchPosts();  // This would trigger a re-render of posts
          }
        });
      });
    });
  }

  // Call listenToPosts to start listening for real-time updates
  listenToPosts();
});


document.getElementById('userMenu').addEventListener('click', function () {
    const user = getAuth().currentUser;
    if (user) {
      const userId = user.uid;
      console.log("User ID: ", userId);
  
      // Redirect to user detail page with userId as URL parameter
      window.location.href = `userDetail.html?userId=${userId}`;
    } else {
      alert("Please log in first!");
    }
  });
  
  