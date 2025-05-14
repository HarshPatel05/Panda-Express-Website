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


7. **Access each page directly by URL:**
   Since the database is no longer accessible, the login will not work. You can still preview each view by manually visiting these routes:
   - Register View: [http://localhost:5000/index](http://localhost:5000/index)
   - Manager View: [http://localhost:5000/manager](http://localhost:5000/manager)
   - Kiosk View: [http://localhost:5000/kiosk](http://localhost:5000/kiosk)
   - Kitchen View: [http://localhost:5000/kitchen](http://localhost:5000/kitchen)
   - Menu Board: [http://localhost:5000/menuboard](http://localhost:5000/menuboard)
   - Special Menu Board: [http://localhost:5000/menuboard](http://localhost:5000/menuboard)

---

### **Important Note About Database Access:**
The backend was originally connected to a PostgreSQL database hosted by our university. We no longer have access to this database. As a result:
- Login and any actions that require database interaction (e.g., placing orders, updating menu items) will not work.
- You can still explore the frontend pages by visiting the routes listed in step 7.



