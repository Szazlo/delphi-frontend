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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nostra sociosqu per mauris lectus sit ante
                natoque litora. Natoque amet integer massa dignissim sollicitudin tellus et elit. Curae dui ac convallis
                faucibus proin purus justo. Incidunt maximus vulputate habitant venenatis curae interdum dictum ad
                tempor. Effictur justo facilisi aptent purus at ad auctor eros? Fermentum facilisis class; etiam risus
                scelerisque feugiat convallis mus elit? Ex nullam porttitor et sodales tortor natoque.
            </p>
        </div>
    </div>
);

export default InfoSection;
