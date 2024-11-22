const InfoSection = () => {
    return (
        <div className="flex text-white p-5 my-14">
            {/* Sidebar */}
            <div className="w-48 flex flex-col">
                <div className="pb-2 font-bold cursor-pointer bg-gradient-to-r from-lingrad via-lingrad2 to-lingrad3 bg-clip-text text-transparent">What is Delphi?</div>
                <div className="py-2 text-gray-400 cursor-pointer">Get Started</div>
                <div className="py-2 text-gray-400 cursor-pointer">Know more</div>
            </div>

            {/* Content */}
            <div className="ml-10 w-1/2">
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nostra sociosqu per mauris lectus sit ante
                    natoque litora.
                    Natoque amet integer massa dignissim sollicitudin tellus et elit. Curae dui ac convallis faucibus
                    proin purus justo.
                    Incidunt maximus vulputate habitant venenatis curae interdum dictum ad tempor. Effictur justo
                    facilisi aptent purus at ad auctor eros?
                    Fermentum facilisis class; etiam risus scelerisque feugiat convallis mus elit? Ex nullam porttitor
                    et sodales tortor natoque.
                </p>
            </div>
        </div>
    );
};

export default InfoSection;
