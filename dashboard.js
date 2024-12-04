import { getAuth, db, collection, addDoc, serverTimestamp, getDocs, query, orderBy, onAuthStateChanged, onSnapshot } from './firebase.js';

const auth = getAuth();

document.addEventListener("DOMContentLoaded", function () {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userName = user.displayName || "User";
      const userImage = user.photoURL || "default_image_url"; 

      document.getElementById('registerDiv').style.display = 'none';
      document.getElementById('userInfo').style.display = 'flex';
      document.getElementById('userName').innerText = userName;
      document.getElementById('userImage').src = userImage;

      fetchUserInfo(user.uid);
    } else {
      document.getElementById('registerDiv').style.display = 'flex';
      document.getElementById('userInfo').style.display = 'none';
    }
  });

  // Function to fetch additional user info from Firestore using snapshot
  function fetchUserInfo(userId) {
    try {
      const userDocRef = db.collection('users').doc(userId);
      
      // Real-time listener using onSnapshot
      userDocRef.onSnapshot((doc) => {
        if (doc.exists) {
          const userData = doc.data();
          document.getElementById('userName').innerText = userData.name || "User";
          document.getElementById('userImage').src = userData.profilePicture || "default_image_url"; 
        } else {
          console.log("No user data found!");
        }
      });
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  }

  // Toggle Add Post Button Visibility
  document.getElementById('addPostButton').addEventListener('click', function () {
    const categoryDropdown = document.getElementById('categoryDropdown');
    categoryDropdown.classList.toggle('hidden');
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
      // Show loader while posting
      Swal.fire({
        title: 'Submitting...',
        html: 'Please wait while we submit your post.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        // Add the new post to the Firestore collection for the selected category
        await addDoc(collection(db, category), {
          title: title,
          description: description,
          userId: user.uid,
          category: category,
          createdAt: serverTimestamp(),
        });

        Swal.fire({
          icon: 'success',
          title: 'Post Submitted!',
          text: 'Your post has been submitted successfully.',
        });

        fetchPosts();  // Refresh all posts after submission

        // Hide the category dropdown after post submission
        document.getElementById('categoryDropdown').classList.add('hidden');
        document.getElementById('postForm').classList.add('hidden');
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `There was an error submitting your post: ${error.message}`,
        });
      }
    }
  });

  // Fetch and Display Posts from All Categories using snapshot
  function fetchPosts() {
    document.getElementById('techPostsContainer').innerHTML = '';
    document.getElementById('lifestylePostsContainer').innerHTML = '';
    document.getElementById('eduPostsContainer').innerHTML = '';

    const categories = ['Technology', 'Lifestyle', 'Education'];
    try {
      for (let category of categories) {
        const postsRef = collection(db, category);
        onSnapshot(postsRef, (snapshot) => {
          snapshot.docChanges().forEach(change => {
            if (change.type === "added") {
              const post = change.doc.data();
              const postElement = document.createElement('div');
              postElement.classList.add('p-4', 'bg-white', 'shadow-md', 'rounded-md','w-[80%]','mx-auto');

              const createdAt = post.createdAt ? post.createdAt.toDate() : null;
              const formattedTime = createdAt ? createdAt.toLocaleString() : "Not available";

              postElement.innerHTML = `
                  <div>
              <h4> ${post.category}</h4>
                <h3 class="font-bold mt-4">${post.title}</h3>
                <p>${post.description}</p>
                <p>${formattedTime}</p>
                </div>
              `;

              if (category === 'Technology') {
                document.getElementById('techPostsContainer').appendChild(postElement);
              } else if (category === 'Lifestyle') {
                document.getElementById('lifestylePostsContainer').appendChild(postElement);
              } else if (category === 'Education') {
                document.getElementById('eduPostsContainer').appendChild(postElement);
              }
            }
          });
        });
      }
    } catch (error) {
      console.error("Error getting posts: ", error);
    }
  }

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
