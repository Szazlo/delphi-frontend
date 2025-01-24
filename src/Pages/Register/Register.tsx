import LandingNav from "@/Components/LandingNav.tsx";
import RegisterForm from "@/Components/RegisterForm.tsx";

function Login() {
    return (
        <div className="min-h-screen mx-20 min-w-screen text-white">
            <LandingNav showButtons={false}/>
            <RegisterForm/>
        </div>
    );
};

export default Login;