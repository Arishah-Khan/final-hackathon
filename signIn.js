import { getAuth, signInWithEmailAndPassword } from "./firebase.js";

// Initialize Firebase Authentication
const auth = getAuth();

// Function to handle user login
async function userLogin() {
    console.log("Attempting to log in...");
    
    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();

    // Ensure email and password fields are not empty
    if (!email || !password) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please enter both email and password.',
        });
        return;
    }
    
    // Show a loader using SweetAlert
    Swal.fire({
        title: 'Logging in...',
        text: 'Please wait while we process your login.',
        allowOutsideClick: false,  // Disable clicking outside the popup
        didOpen: () => {
            Swal.showLoading();  // Show the loader
        }
    });

    try {
        // Sign in the user using Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Extract authenticated user details
        const user = userCredential.user;
        console.log("User logged in successfully!", user);

        // Close the SweetAlert loader
        Swal.close();

        // Redirect to User Dashboard
        window.location.href = "dashboard.html";
    } catch (error) {
        // Close the SweetAlert loader
        Swal.close();

        console.error("Error during login:", error);

        // Show error using SweetAlert
        Swal.fire({
            icon: 'error',
            title: 'Login Failed',
            text: error.message || 'An unknown error occurred. Please try again later.',
        });
    }
}

// Event listener for login button
document.getElementById("loginButton").addEventListener("click", userLogin);


document.getElementById("signupRedirectButton").addEventListener("click", function() {
    window.location.href = "index.html";  // Redirect to the role selection page
});