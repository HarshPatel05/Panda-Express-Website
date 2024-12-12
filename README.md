# Panda Express Multi-View Website System

**Overview:**

This is a web system for Panda Express, designed to improve order management and customer experience. It has multiple views: Register, Manager, Kiosk, Kitchen, and Menu Board. It’s built with Express.js for the backend, EJS for frontend rendering, and PostgreSQL for database management. Docker is used for easy deployment.

**Features:**
- **Register View:** Process orders and promotions.
- **Manager View:** Manage the menu and view sales.
- **Kiosk View:** Self-service ordering for customers.
- **Kitchen View:** Track orders for kitchen staff.
- **Menu Board:** Display menu for customers with live updates.
- **Accessibility:** Text-to-speech, large fonts, and high contrast.

**Tech Stack:**
- Backend: **Express.js**, **Node.js**
- Frontend: **EJS**, **HTML/CSS**, **JavaScript**
- Database: **PostgreSQL**
- Containerization: **Docker**
- Version Control: **Git**, **GitHub**

---

### **How to Run Locally (Frontend Only)**

1. **Clone the repo:**
   ```bash
   git clone https://github.com/HarshPatel05/Panda-Express-Multi-View-Website-System.git
   ```

2. **Navigate to the Project folder**
    ```bash
    cd Panda-Express-Multi-View-Website-System
    ```

3. **Navigate to the expressNEW folder:**
    ```bash
    cd expressNEW
    ```

4. **Install dependencies:**
    ```bash
    npm install
    ```

5. **Start the server:**
    ```bash
    npm start
    ```

6. **Open the application:**
   Visit [http://localhost:5000](http://localhost:5000) in your browser to view the app.

---

### **Important Note About Database Access:**

- The database used in this project may no longer be accessible.
- You can view the frontend without needing the database. Some features (like placing orders or managing the menu) may not work due to the lack of a live backend connection.
- The frontend will still display the menu, Register, Kiosk, and Manager views, but interaction with the database (e.g., placing orders or updating data) may not function unless the database is reconnected.