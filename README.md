## Android 2 2026 sem b project - FrontEnd

## Lior Mizrachi | Amit Hazan | Abed Haj Yahia

* **FrontEnd website that the user would use**: https://social-network-frontend-android2-project.onrender.com
* **BackEnd api website**: https://social-network-backend-android2-project.onrender.com

## To be used in conjunture with 

* **BackEnd/API** [https://github.com/amith372/social-network-front](https://github.com/Lior-Miz/social-network-server)

This repository contains the FrontEnd react service for a real-time social/chat application. It user RESTful APIs for user management, group chats, post feeds, and statistical data, along with real-time bidirectional communication using Socket.IO, and it uses react to display all the features

## Frontend Project Structure

```text
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── chat/            # Chat interface components
│   │   │   └── ChatSidebar.jsx
│   │   ├── feed/            # Post and timeline components
│   │   │   ├── CreatePost.jsx
│   │   │   ├── MainFeed.jsx
│   │   │   └── PostItem.jsx
│   │   ├── graphs/          # Data visualization and charts
│   │   │   └── StatisticsCharts.jsx
│   │   ├── groups/          # Group management components
│   │   │   ├── GroupsSidebar.jsx
│   │   │   └── MemberListModal.jsx
│   │   └── Navbar.js        # Main navigation bar
│   ├── pages/               # Main application views/routes
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── App.css              # Main application styles
│   ├── App.js               # Root React component
│   ├── App.test.js          # Tests for the App component
│   ├── index.css            # Base/Global CSS styles
│   ├── index.js             # React application entry point
│   ├── logo.svg             # Application logo assets
│   ├── reportWebVitals.js   # Performance measuring utility
│   └── setupTests.js        # Testing configuration setup
├── .gitignore               # Files and folders ignored by Git
├── package-lock.json        # Exact dependency tree lockfile
├── package.json             # Frontend dependencies and npm scripts
└── README.md                # Frontend documentation
```

## Website Main page preview
<img width="876" height="907" alt="Screenshot 2026-07-11 195839" src="https://github.com/user-attachments/assets/9a72f25c-5528-461f-b525-e004defe70d7" />


## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.
