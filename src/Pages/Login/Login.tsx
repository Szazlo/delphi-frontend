import './Login.css'

import LandingNav from "@/Components/LandingNav.tsx";
import LoginForm from "@/Components/LoginForm.tsx";

function Login() {
    return (
        <div className="min-h-screen mx-20 min-w-screen text-white">
            <LandingNav showButtons={false}/>
            <LoginForm/>
        </div>
    );
};

export default Login;