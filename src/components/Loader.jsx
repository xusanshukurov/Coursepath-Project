import { ring } from "ldrs";

ring.register();

export default function Loader() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <l-ring
                size="60"
                stroke="5"
                bg-opacity="0"
                speed="2"
                color="#3b82f6"
            ></l-ring>
        </div>
    );
}