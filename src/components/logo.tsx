import Image from "next/image";
import Logo from "../Logo.png";

export default function TdA() {
    return <div className={'m-6 text-center'}>
        <Image src={Logo} alt={"Think different Academy"}/>
    </div>
}