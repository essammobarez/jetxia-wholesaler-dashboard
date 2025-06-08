import Logo from "@/components/views/Logo";

export default function Loading() {
    return (
        <div className="flex justify-center items-center min-h-screen">
            {/* Circle with Text-Primary Border */}
            <div className="relative flex justify-center items-center animate-spin">
                <div className="w-16 h-16 border-4 border-primary rounded-full animate-spin"></div>
                <div className="absolute text-primary">
                    <Logo />
                </div>
            </div>
        </div>
    );
}