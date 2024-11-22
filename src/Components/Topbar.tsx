function Topbar() {
    const name = localStorage.getItem('name');
    return (
        <div className="w-full h-16 text-gray-300 flex items-center justify-between px-6 shadow-md mb-2">
            <div className="text-xl font-semibold text-gray-100">
                Welcome, {name?.split(' ')[0]}
            </div>

            <div className="flex items-center space-x-4">
                <img
                    src="https://via.placeholder.com/40" // Placeholder replace with pfp url
                    alt="User Profile"
                    className="w-10 h-10 rounded-full object-cover"
                />
            </div>
        </div>
    );
}

export default Topbar;