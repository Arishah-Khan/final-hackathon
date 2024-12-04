import { getAuth, createUserWithEmailAndPassword, doc, setDoc, db, serverTimestamp } from "./firebase.js";

const cloudName = "dukmizgzg"; // Cloudinary cloud name
const unSignedUploadPreSet = "esqdfaa1"; // Cloudinary unsigned upload preset
const auth = getAuth();

async function userSignup() {
    const name = document.getElementById("nameInput").value.trim();
    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passwordInput").value;
    const phoneNumber = document.getElementById("phoneInput").value.trim();
    const address = document.getElementById("addressInput").value.trim();
    const profilePicture = document.getElementById("profilePicture").files[0];

    // Validate all fields
    if (!name || !email || !password || !phoneNumber || !address || !profilePicture) {
        showErrorPopup("Please fill in all the fields and upload a profile picture.");
        return;
    }

    // Show loading spinner
    Swal.fire({
        title: 'Signing up...',
        text: 'Processing your information.',
        didOpen: () => Swal.showLoading(),
    });

    try {
        // Upload profile picture to Cloudinary
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const formData = new FormData();
        formData.append("file", profilePicture);
        formData.append("upload_preset", unSignedUploadPreSet);

        const cloudinaryResponse = await fetch(cloudinaryUrl, { method: "POST", body: formData });
        if (!cloudinaryResponse.ok) throw new Error("Failed to upload the profile picture.");

        const cloudinaryData = await cloudinaryResponse.json();
        const profilePictureUrl = cloudinaryData.secure_url;

        // Create Firebase user
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Store user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name,
            email,
            phoneNumber,
            address,
            role: "user",
            signupDate: serverTimestamp(),
            profilePicture: profilePictureUrl,
        });

        Swal.close(); // Close loader
        Swal.fire({
            title: 'Signup Successful!',
            text: 'Your account has been created successfully.',
            icon: 'success',
            confirmButtonText: 'Go to Login',
        }).then(() => {
            window.location.href = "signIn.html";
        });
    } catch (error) {
        Swal.close();
        Swal.fire({
            title: 'Signup Failed',
            text: error.message || "Something went wrong. Please try again.",
            icon: 'error',
            confirmButtonText: 'Try Again',
        });
    }
}

// Error Popup
function showErrorPopup(message) {
    Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK',
    });
}

// Event Listeners
document.getElementById("signupButton").addEventListener("click", userSignup);

// Redirect to Login
document.getElementById("loginRedirectButton").addEventListener("click", () => {
    window.location.href = "signIn.html";
});

// Dashboard Button Confirmation
document.getElementById("dashboardButton").addEventListener("click", () => {
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to go to the dashboard?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, go to Dashboard',
        cancelButtonText: 'No, stay here',
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "dashboard.html"; // Replace with your dashboard URL
        }
    });
});
