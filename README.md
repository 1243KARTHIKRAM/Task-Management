# Task Management System (Spring Boot)

A **Task Management System** built using **Spring Boot** that allows users to create, update, delete, and track tasks efficiently.
This project demonstrates the implementation of **REST APIs, database integration, and full-stack development using Java technologies.**

---

## 🚀 Features

* Add new tasks
* Update existing tasks
* Delete tasks
* Mark tasks as completed
* View all tasks
* RESTful API implementation
* Database integration

---

## 🛠️ Tech Stack

### Backend

* Java
* Spring Boot
* Spring Data JPA
* Hibernate

### Frontend

* HTML
* CSS
* JavaScript
* Bootstrap

### Database

* MySQL

### Tools

* Maven
* Git
* GitHub
* Postman
* IntelliJ / Eclipse

---

## 📂 Project Structure

```
task-management-system
│
├── src
│   ├── main
│   │   ├── java/com/example/taskmanagement
│   │   │   ├── controller
│   │   │   ├── service
│   │   │   ├── repository
│   │   │   ├── model
│   │   │   └── TaskManagementApplication.java
│   │   │
│   │   └── resources
│   │       ├── application.properties
│   │       └── templates
│
├── pom.xml
└── README.md
```

---

## ⚙️ Installation and Setup

### 1️⃣ Clone the Repository

```
git clone https://github.com/your-username/task-management-system.git
cd task-management-system
```

---

### 2️⃣ Configure Database

Update `application.properties`:

```
spring.datasource.url=jdbc:mysql://localhost:3306/taskdb
spring.datasource.username=root
spring.datasource.password=yourpassword

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

### 3️⃣ Build the Project

```
mvn clean install
```

---

### 4️⃣ Run the Application

```
mvn spring-boot:run
```

Application will run at:

```
http://localhost:8080
```

---

## 📌 API Endpoints

| Method | Endpoint    | Description     |
| ------ | ----------- | --------------- |
| GET    | /tasks      | Get all tasks   |
| POST   | /tasks      | Create new task |
| PUT    | /tasks/{id} | Update task     |
| DELETE | /tasks/{id} | Delete task     |

---

## 📈 Future Enhancements

* User authentication (Spring Security)
* Task priority levels
* Due date reminders
* Dashboard with statistics

---

## 👨‍💻 Author

**Karthik Ram**

GitHub: https://github.com/1243KARTHIKRAM
LinkedIn: https://www.linkedin.com/in/g-karthik-ram-b92630260/

---

## 📜 License

This project is licensed under the MIT License.
