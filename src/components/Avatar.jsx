const avatarColors = [
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#06b6d4",
];


export const Avatar = ({ profile, size = 40, font = 21 }) => {
    

    const getAvatarColor = (id) => {
        if (!id) return avatarColors[0];

        let hash = 0;

        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }

        return avatarColors[Math.abs(hash) % avatarColors.length];
    };


    return (
        <div
            className="rounded-full flex items-center justify-center text-white"
            style={{
                width: size,
                height: size,
                backgroundColor: getAvatarColor(profile?.id),
                fontSize: font,
            }}
        >
            {profile?.first_name?.slice(0, 1).toUpperCase()}
        </div>
    );
};