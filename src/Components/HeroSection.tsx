const HeroSection = () => {
    return (
        <section className="p-6 text-white my-14">
            <div className="flex flex-col md:flex-row justify-between items-center">
                {/* Text Content */}
                <div className="text-center md:text-left md:w-1/2">
                    <h1 className="text-5xl font-bold">
                        Instant feedback
                        <br/>
                        <span className="bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 bg-clip-text text-transparent">on your code.</span>
                    </h1>
                    <p className="mt-4 text-lg">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.
                    </p>
                </div>

                {/* File Upload */}
                <div className="mt-8 md:mt-0 md:w-1/2 md:flex md:justify-end">
                    <div className="border-dashed border-2 border-gray-500 rounded-lg p-6 inline-block">
                        <div className="flex flex-col items-center justify-center">
                            <svg
                                className="h-24 w-72 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 7v4a1 1 0 001 1h16a1 1 0 001-1V7m-4 10H5a2 2 0 01-2-2v-5a2 2 0 012-2h14a2 2 0 012 2v5a2 2 0 01-2 2z"
                                />
                            </svg>
                            <p className="text-gray-400 mt-2">Upload a file</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

    );
};

export default HeroSection;
