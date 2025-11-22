import LoginForm from "./LoginForm";

type LoginPageProps = {
    searchParams?: {
        from?: string;
    };
};

export default function LoginPage({ searchParams }: LoginPageProps) {
    const fromParam = searchParams?.from;
    const from = typeof fromParam === "string" && fromParam.trim().length > 0 ? fromParam : "/";

    return (
        <main className="login-container">
            <LoginForm from={from} />
        </main>
    );
}
