const InfoSection = () => (
    <div className="flex text-white p-5 my-14">
        {/* Sidebar */}
        <div className="w-48 flex flex-col">
            {["What is Delphi?", "Get Started", "Know more"].map((text, index) => (
                <div
                    key={index}
                    className={`py-2 cursor-pointer ${
                        index === 0
                            ? "font-bold bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 bg-clip-text text-transparent"
                            : "text-gray-400"
                    }`}
                >
                    {text}
                </div>
            ))}
        </div>

        {/* Content */}
        <div className="ml-10 w-1/2">
            <p>
                Delphi is your personal coding coach. Using advanced AI, peer reviews, and cutting-edge analysis tools, Delphi helps you identify and fix issues in your code while teaching you best practices to grow as a programmer. Whether you're just starting out or refining your craft, Delphi makes learning to code more effective and enjoyable.
            </p>
        </div>
    </div>
);

export default InfoSection;
