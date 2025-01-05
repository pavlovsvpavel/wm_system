import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <>
      <Link href="/">
        <Image
          src="/images/Pepsi-logo.png"
          alt="Logo"
          width="40"
          height="40"
          className="logo"
          priority
        />
      </Link>
    </>
  );
};

export default Logo;