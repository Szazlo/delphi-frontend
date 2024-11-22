const SupportedLanguages = () => {
    return (
        <section className="flex flex-col p-6 text-white font-bold">
            <h2 className="text-2xl mb-4">Supported Languages</h2>
            <div className="overflow-hidden">
                <div className="flex animate-scroll">
                    <div className="bg-slate-600 w-24 h-24 rounded-lg flex items-center justify-center">Python</div>
                    <div className="bg-slate-600 w-24 h-24 ml-4 rounded-lg flex items-center justify-center">JavaScript</div>
                    <div className="bg-slate-600 w-24 h-24 ml-4 rounded-lg flex items-center justify-center">Java</div>
                    <div className="bg-slate-600 w-24 h-24 ml-4 rounded-lg flex items-center justify-center">C#</div>
                    <div className="bg-slate-600 w-24 h-24 ml-4 rounded-lg flex items-center justify-center">C++</div>
                    <div className="bg-slate-600 w-24 h-24 ml-4 rounded-lg flex items-center justify-center">Ruby</div>
                </div>
            </div>
        </section>
    );
};

export default SupportedLanguages;
