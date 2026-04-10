const PageBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden bg-transparent pointer-events-none">
            <div className="absolute -left-[10%] top-[5%] h-[600px] w-[600px] rounded-full bg-pink-300/40 blur-[120px] dark:bg-primary/20" />
            <div className="absolute right-[5%] top-[15%] h-[500px] w-[500px] rounded-full bg-blue-300/40 blur-[100px] dark:bg-secondary/20" />
            <div className="absolute bottom-[5%] left-[20%] h-[700px] w-[700px] rounded-full bg-purple-300/35 blur-[140px] dark:bg-tertiary/15" />
            <div className="absolute -right-[15%] -bottom-[10%] h-[600px] w-[600px] rounded-full bg-pink-200/40 blur-[120px] dark:bg-fuchsia-600/15" />
        </div>
    );
};

export default PageBackground;
