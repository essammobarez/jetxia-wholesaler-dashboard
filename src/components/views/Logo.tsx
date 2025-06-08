import Image from "next/image"

const Logo = () => {
    return (
        <>
            <div className="dark:hidden">
                <Image
                    src="https://ik.imagekit.io/xsmanrxwj/moynaa/moynaa-light-logo.png?updatedAt=1733845412094"
                    alt="Logo"
                    width={50}
                    height={50}
                    className="rounded-full border border-primary"
                />
            </div>
            <div className="hidden dark:block">
                <Image
                    src="https://ik.imagekit.io/xsmanrxwj/moynaa/moynaa-dark-logo.png?updatedAt=1733845474145"
                    alt="Logo"
                    width={50}
                    height={50}
                    className="rounded-full border border-primary"
                />
            </div>
        </>
    )
}

export default Logo