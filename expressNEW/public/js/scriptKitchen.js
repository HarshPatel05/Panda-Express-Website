document.addEventListener("DOMContentLoaded", () => {
    const inProgressContainer = document.querySelector("#inProgress .orderContainer");
    const completedContainer = document.querySelector("#completed .orderContainer");

    // Handle click events for orders in "In Progress"
    inProgressContainer.addEventListener("click", (e) => {
        const order = e.target.closest(".orderCard");
        if (order && order.dataset.status === "in-progress") {
            // Move to completed section
            order.dataset.status = "completed";
            completedContainer.appendChild(order);
            order.style.cursor = "default";

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
