import LoginForm from "./LoginForm";

type LoginPageProps = {
    searchParams: Promise<{
        from?: string;
    }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
    const resolvedParams = await searchParams;
    const fromParam = resolvedParams?.from;
    const from = typeof fromParam === "string" && fromParam.trim().length > 0 ? fromParam : "/";

    return (
        <main className="login-container">
            <LoginForm from={from} />
        </main>
    );
}
