export function Footer() {
    return (
        <footer className="border-t border-border/40 py-6 md:px-8 md:py-0">
            <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built on <span className="text-primary font-bold">Polygon</span>. Patient-owned. Encrypted.
                </p>
                <p className="text-xs text-muted-foreground">
                    &copy; 2025 HealthChain. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
