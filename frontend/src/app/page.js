import Link from "next/link";

export default function Home() {

    return (
        <div className="container">
            <div className="content">
                <img src="/images/Pepsi-logo.png" alt="logo" />
                <h1>Inventory Management</h1>
                <div className="button-group">
                    <Link href="/login">
                        <button className="button">Login</button>
                    </Link>
                    <Link href="/register">
                        <button className="button">Register</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}