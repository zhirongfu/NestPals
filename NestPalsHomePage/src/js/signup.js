document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("signup-form");

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent default form submission

        // Retrieve form input values
        const username = document.getElementById("username").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        // Validate password match
        if (password !== confirmPassword) {
            alert("Passwords do not match. Please try again.");
            return;
        }

        // Construct CSV content
        const csvContent = `"Username","Email","Password"\n"${username}","${email}","${password}"\n`;

        // Save CSV content as a file
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "signup_data.csv";
        link.click();

        // Redirect user to survey.html
        window.location.href = "survey.html";
    });
});
