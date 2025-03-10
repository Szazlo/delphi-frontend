function Topbar() {
    const name = localStorage.getItem('name');
    const profilePicture = localStorage.getItem('profilePicture');
    return (
        <div className="w-full h-16 text-gray-300 flex items-center justify-between px-6 shadow-md mb-2 overflow-hidden">
            <div className="text-xl font-semibold text-gray-100">
                Welcome, {name?.split(' ')[0]}
            </div>

            <div className="flex items-center space-x-4">
                <img
                    src={profilePicture || 'https://placehold.co/150'}
                    alt="User Profile"
                    className="w-10 h-10 rounded-full object-cover hover:cursor-pointer"
                    onClick={() => window.location.href = '/settings'}
                />
            </div>
        </div>
    );
}

export default Topbar;