const SupportedLanguages = () => {
    return (
        <section className="flex flex-col p-6 text-white font-bold">
            <h2 className="text-2xl mb-4">Supported Languages</h2>
            <div className="overflow-hidden">
                <div className="flex animate-scroll">
                    <div className="w-24 h-24 rounded-lg flex items-center justify-center">
                        <img src="/src/assets/images/python-logo.png" alt="Python" className="object-contain aspect-square"/>
                    </div>
                    <div className="w-24 h-24 rounded-lg flex items-center justify-center">
                        <img src="/src/assets/images/java-logo.png" alt="Java" className="object-contain aspect-square"/>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SupportedLanguages;
