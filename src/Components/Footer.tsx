import {toast} from "sonner";

const Footer = () => (
    <footer className="p-6 text-white mt-14">
        <div className="flex justify-between">
            {/* About Section */}
            <div className="w-80">
                <h2 className="text-purple-400 text-2xl">Delphi</h2>
                <p className="mt-4">
                    Built for aspiring developers, Delphi is here to support your journey from beginner to pro. With tailored feedback and a collaborative learning experience, we're committed to making code review accessible and impactful for everyone.
                </p>
            </div>

            {/* Quick Links Section */}
            <div className="w-52 ml-10">
                <h3 className="text-xl font-semibold mb-2">Quick Links</h3>
                <ul className="space-y-2">
                    <li>Terms Of Use</li>
                    <li>Privacy Policy</li>
                    <li>Contact</li>
                </ul>
            </div>

            {/* Newsletter Section */}
            <div className="w-72 flex flex-col items-center">
                <h3 className="text-xl font-bold mb-4">Newsletter</h3>
                <p className="mb-4">Keep up with the development.</p>
                <input
                    type="email"
                    placeholder="Email"
                    className="p-2 rounded-lg bg-black text-white w-full"
                />
                <button onClick={() => toast('This feature isn\'t implemented yet.')} className="bg-gradient-to-r from-blue-500 to-pink-500 text-white px-4 py-2 rounded-lg mt-4 w-full">
                    Join Now
                </button>
            </div>
        </div>
    </footer>
);

export default Footer;
