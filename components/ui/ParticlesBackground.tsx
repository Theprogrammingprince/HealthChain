"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";

export function ParticlesBackground() {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    if (!init) return null;

    return (
        <Particles
            id="tsparticles"
            className="absolute inset-0 -z-10"
            options={{
                fullScreen: { enable: false },
                background: {
                    color: {
                        value: "transparent",
                    },
                },
                fpsLimit: 120,
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: "bubble",
                        },
                        onClick: {
                            enable: true,
                            mode: "push",
                        },
                        resize: {
                            enable: true,
                            delay: 0.5
                        },
                    },
                    modes: {
                        bubble: {
                            distance: 200,
                            size: 10,
                            duration: 2,
                            opacity: 0.8,
                        },
                        push: {
                            quantity: 4,
                        },
                    },
                },
                particles: {
                    color: {
                        value: ["#00BFFF", "#FF5252", "#ffffff"],
                    },
                    links: {
                        color: "#00BFFF",
                        distance: 150,
                        enable: true,
                        opacity: 0.15,
                        width: 1,
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce",
                        },
                        random: true,
                        speed: 1,
                        straight: false,
                    },
                    number: {
                        density: {
                            enable: true,
                            width: 800,
                            height: 800,
                        },
                        value: 40,
                    },
                    opacity: {
                        value: 0.6,
                    },
                    shape: {
                        type: ["char", "circle"],
                        options: {
                            char: {
                                font: "Verdana",
                                value: ["+", "✚"],
                                weight: "900",
                                fill: true,
                            }
                        }
                    },
                    size: {
                        value: { min: 4, max: 8 },
                    },
                },
                detectRetina: true,
            }}
        />
    );
}
