import { useState } from 'react';

const InfoSection = () => {
    const [activeItem, setActiveItem] = useState(0);

    const infoContent = [
        {
            title: "What is Delphi?",
            content: "Delphi is an automated code review tool that helps you to write better code. It provides instant feedback on your code quality, security, and style."
        },
        {
            title: "Get Started",
            content: "Getting started with Delphi is easy. Create an account, upload your project, and receive automated code reviews."
        },
        {
            title: "Know more",
            content: "Delphi supports multiple programming languages and integrates seamlessly with popular development tools. Our advanced AI algorithms provide context-aware suggestions for improving your code."
        }
    ];

    const handleClick = (index: number) => {
        setActiveItem(index);
    };

    return (
        <div className="flex text-white p-5 my-14">
            <div className="w-48 flex flex-col">
                {infoContent.map((item, index) => (
                    <div
                        key={index}
                        onClick={() => handleClick(index)}
                        className={`py-2 cursor-pointer ${
                            index === activeItem
                                ? "font-bold bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 bg-clip-text text-transparent"
                                : "text-gray-400 hover:text-gray-200"
                        }`}
                    >
                        {item.title}
                    </div>
                ))}
            </div>

            <div className="ml-10 w-1/2">
                <div className="min-h-[200px]">
                    <h3 className="text-xl font-bold mb-4">{infoContent[activeItem].title}</h3>
                    <p>{infoContent[activeItem].content}</p>
                </div>
            </div>
        </div>
    );
};

export default InfoSection;