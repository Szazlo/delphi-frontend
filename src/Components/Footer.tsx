const Footer = () => {
    return (
        <footer className="p-6 text-white mt-14">
            <div className="flex justify-between">
                <div className="w-80">
                    <h2 className="text-purple-400 text-2xl">Delphi</h2>
                    <p className="mt-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nostra sociosqu per mauris lectus sit ante
                        natoque litora.
                        Natoque amet integer massa dignissim sollicitudin tellus et elit. Curae dui ac convallis faucibus
                        proin purus justo.</p>
                </div>

                <div className="w-52 ml-10">
                    <h3 className="text-xl font-semibold mb-2">Quick links</h3>
                    <ul>
                        <li className="mb-2">Terms Of Use</li>
                        <li className="mb-2">Privacy Policy</li>
                        <li className="mb-2">Contact</li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div className="w-72 flex flex-col items-center">
                    <h3 className="text-xl font-bold mb-4">Newsletter</h3>
                    <p className="mb-4">Keep up with the development.</p>
                    <input
                        type="email"
                        placeholder="Email"
                        className="p-2 rounded-lg bg-black text-white border-none w-full"
                    />
                    <button className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-4 py-2 rounded-lg mt-4 w-full border-none">
                        Join Now
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
