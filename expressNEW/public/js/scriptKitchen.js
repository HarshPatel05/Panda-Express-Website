document.addEventListener("DOMContentLoaded", () => {
    const inProgressContainer = document.querySelector("#inProgress .orderContainer");
    const completedContainer = document.querySelector("#completed .orderContainer");

    let voices = [];

    // Load available voices
    const loadVoices = () => {
        voices = window.speechSynthesis.getVoices();
        console.log("Available voices:", voices);
    };

    // Ensure voices are loaded before using them
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
    } else {
        loadVoices();
    }

    // Handle click events for orders in "In Progress"
    inProgressContainer.addEventListener("click", (e) => {
        const order = e.target.closest(".orderCard");
        if (order && order.dataset.status === "in-progress") {
            // Move to completed section
            order.dataset.status = "completed";
            completedContainer.appendChild(order);
            order.style.cursor = "default";

            // Set up and play the speech
            const speechSynthesis = window.speechSynthesis;
            const text = "Your bluetooth device, is connected succesfully";
            const speech = new SpeechSynthesisUtterance(text);

            // Select a voice (e.g., Google US English or first available)
            const selectedVoice = voices.find(voice => voice.name.includes("Google 國語（臺灣）")) || voices[0];
            if (selectedVoice) {
                speech.voice = selectedVoice;
            }

            speechSynthesis.speak(speech);

            // Set a timer to auto-remove after 5 minutes
            setTimeout(() => {
                if (order.parentElement === completedContainer) {
                    order.remove();
                }
            }, 300000); // 5 minutes
        }
    });

    // Handle click events for orders in "Completed"
    completedContainer.addEventListener("click", (e) => {
        const order = e.target.closest(".orderCard");
        if (order && order.dataset.status === "completed") {
            // Remove order immediately when clicked
            order.remove();
        }
    });
});
