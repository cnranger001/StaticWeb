import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

// Define types
interface User {
    displayName: string;
    avatar: string;
    greeting: string;
}

// Banner component
const Banner: React.FC<{ user: User }> = ({ user }) => {
    return (
        <header className="bg-gradient-to-r from-cyan-500 to-blue-500 p-4 shadow-md flex justify-between items-center fixed top-0 w-full z-10">
            <div className="flex items-center space-x-4">
                <img src={user.avatar} alt={user.displayName} className="w-12 h-12 rounded-full object-cover" />
                <div>
                    <h1 className="text-white text-xl font-bold">{user.displayName}</h1>
                    <p className="text-white text-sm">{user.greeting}</p>
                </div>
            </div>
        </header>
    );
};

// Left menu component
const LeftMenu: React.FC = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <aside className={`bg-gray-100 w-64 p-4 space-y-4 fixed left-0 top-16 bottom-12 ${isCollapsed ? 'hidden' : ''} transition-all duration-300`}>
            <button onClick={toggleCollapse} className="text-gray-600 hover:text-gray-800 mb-4">
                {isCollapsed ? <i className="fa-solid fa-chevron-right"></i> : <i className="fa-solid fa-chevron-left"></i>}
            click me 
            </button>
            <div>
                <h2 className="text-lg font-bold text-gray-700">Study Items</h2>
                <ul className="space-y-2">
                    <li className="cursor-pointer hover:text-blue-500 transition-colors">Words</li>
                    <li className="cursor-pointer hover:text-blue-500 transition-colors">Idioms</li>
                </ul>
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-700">Study Modes</h2>
                <ul className="space-y-2">
                    <li className="cursor-pointer hover:text-blue-500 transition-colors">By Date</li>
                    <li className="cursor-pointer hover:text-blue-500 transition-colors">By Tag</li>
                </ul>
            </div>
        </aside>
    );
};

// Right menu component
const RightMenu: React.FC = () => {
    return (
        <aside className="bg-gray-100 w-64 p-4 fixed right-0 top-16 bottom-12">
            <h2 className="text-lg font-bold text-gray-700">Study Days</h2>
            <ul className="space-y-2">
                <li className="cursor-pointer hover:text-blue-500 transition-colors">Day 1</li>
                <li className="cursor-pointer hover:text-blue-500 transition-colors">Day 2</li>
                <li className="cursor-pointer hover:text-blue-500 transition-colors">Day 3</li>
            </ul>
        </aside>
    );
};

// Center content component
const CenterContent: React.FC = () => {
    return (
        <main className="p-8 ml-64 mr-64 mt-16 mb-12 flex-grow">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Main Study Item</h2>
            <p className="text-gray-600">This is where the main study item content will be displayed.</p>
        </main>
    );
};

// Footer component
const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-800 text-white text-center p-3 fixed bottom-0 w-full">
            &copy; 2025 Study Website. All rights reserved.
        </footer>
    );
};

const App: React.FC = () => {
    const user: User = {
        displayName: 'Jane Smith',
        avatar: 'https://picsum.photos/200/200',
        greeting: 'Welcome back! Let\'s learn something new today.'
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Banner user={user} />
            <LeftMenu />
            <RightMenu />
            <CenterContent />
            <Footer />
        </div>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
    
    
export default App;