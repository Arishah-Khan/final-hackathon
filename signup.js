import { getAuth, createUserWithEmailAndPassword, doc, setDoc, db,serverTimestamp } from "./firebase.js";

const cloudName = "dukmizgzg"; // Cloudinary cloud name
const unSignedUploadPreSet = "esqdfaa1"; // Cloudinary unsigned upload preset
const auth = getAuth();


async function userSignup() {
    const name = document.getElementById("nameInput").value;
    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;
    const phoneNumber = document.getElementById("phoneInput").value;
    const address = document.getElementById("addressInput").value;
    const profilePicture = document.getElementById("profilePicture").files[0]; // File input for profile picture

    // Check if all fields are filled
    if (!name || !email || !password || !phoneNumber || !address || !profilePicture) {
        showErrorPopup("All fields are required, including the profile picture.");
        return;
    }

    // Show loader while processing
    Swal.fire({
        title: 'Signing up...',
        text: 'Please wait while we create your account.',
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // Step 1: Upload the profile picture to Cloudinary
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const formData = new FormData();
        formData.append("file", profilePicture); // Attach the selected file
        formData.append("upload_preset", unSignedUploadPreSet); // Use the unsigned preset

        const cloudinaryResponse = await fetch(cloudinaryUrl, {
            method: "POST",
            body: formData,
        });

        const cloudinaryData = await cloudinaryResponse.json();
        if (!cloudinaryResponse.ok) {
            throw new Error("Failed to upload the profile picture to Cloudinary.");
        }

        const profilePictureUrl = cloudinaryData.secure_url; // Get the uploaded picture URL

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            phoneNumber: phoneNumber,
            address: address,
            role: "user", // Set the role
            signupDate: serverTimestamp(), 
            profilePicture: profilePictureUrl, // Store the Cloudinary picture URL
        });

        console.log("User signed up and data stored in Firestore successfully!");

        // Close the loader and show success message
        Swal.close();
        Swal.fire({
            title: 'Success!',
            text: 'You have successfully signed up!',
            icon: 'success',
            confirmButtonText: 'Go to Login',
        }).then(() => {
            // Redirect to the user login page
            window.location.href = "signIn.html";
        });
    } catch (error) {
        console.error("Error during signup:", error);

        // Close the loader
        Swal.close();

        // Show error message
        let errorMessage = "An error occurred during signup.";
        if (error.code === "auth/email-already-in-use") {
            errorMessage = "The email is already in use.";
        } else if (error.code === "auth/invalid-email") {
            errorMessage = "The email format is invalid.";
        } else if (error.code === "auth/weak-password") {
            errorMessage = "The password is too weak.";
        }

        Swal.fire({
            title: 'Error!',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Try Again',
        });
    }
}

// Function to show an error popup
function showErrorPopup(message) {
    Swal.fire({
        title: 'Error!',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK',
    });
}

// Event listener for the signup button
document.getElementById("signupButton").addEventListener("click", userSignup);


document.getElementById("loginRedirectButton").addEventListener("click", function () {
    window.location.href = "signIn.html"; // Redirect to the login page
});




// Dashboard Button Click Action (redirect to the dashboard)
document.getElementById("dashboardButton").addEventListener("click", function () {
    window.location.href = "/dashboard.html";  // Replace with your dashboard URL
});