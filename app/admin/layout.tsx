export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <style>{`
                footer, .chatbot-widget-container {
                    display: none !important;
                }
            `}</style>
            {children}
        </>
    );
}
