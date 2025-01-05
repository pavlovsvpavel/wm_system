import "./button.css";
import { useRouter } from "next/navigation";

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {

    localStorage.removeItem("token");

    router.push("/");
  };

  return (
    <button className="btn" style={{ color: "#000" }} onClick={handleLogout}>
      Log out
    </button>
  );
};

export default LogoutButton;