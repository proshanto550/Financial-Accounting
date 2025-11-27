import React from 'react';
import { Calculator } from 'lucide-react';

/**
 * Footer component displaying submission details and copyright.
 * It adapts its style based on the provided theme prop.
 * * @param {string} theme - 'dark' or 'light'
 */
const Footer = ({ theme }) => {

    // Theme classes are defined here for the component to be fully self-contained
    const themeClasses = {
        dark: {
            bg: 'bg-neutral-900',
            text: 'text-slate-100',
            iconColor: 'text-cyan-400',
            names: 'text-slate-400',
        },
        light: {
            bg: 'bg-slate100',
            text: 'text-slate-900',
            iconColor: 'text-blue-500',
            names: 'text-slate-600',
        }
    };

    // Use theme classes or default to dark
    const t = themeClasses[theme] || themeClasses.dark;

    const names = [
        "Sheikh Mijanur Rahman Oli",
        "Proshanto Kumer Das",
        "Sanjida Jahan",
        "Kawser Azim",
        "Priyanka Chowdhury",
        "Tanim Sakib"
    ];

    return (

        <footer className={`w-full py-10 text-center transition-colors ${t.bg}`}>
            <div className={`w-full text-center py-4 text-xs font-mono ${theme === 'dark' ? 'text-slate-500 bg-neutral-900 border-t border-cyan-800/50' : 'text-slate-700 bg-slate-100 border-t border-cyan-400'}`}>

            </div>
            <div className="max-w-7xl mx-auto px-4">
                {/* Calculator Icon (Inspired by the calculator icon in the image) */}
                <Calculator
                    size={48}
                    className={`mx-auto mb-4 ${t.iconColor} border-4 p-2 rounded-xl border-current`}
                />

                {/* Submitted By */}
                <h3 className={`text-xl font-bold tracking-wider mb-6 ${t.text}`}>Submitted By</h3>

                {/* List of Names from the image, separated by vertical bars */}
                <div className={`text-sm font-mono tracking-wide mb-8 ${t.names} flex flex-wrap justify-center items-center gap-x-4 gap-y-2`}>
                    {names.map((name, index) => (
                        <React.Fragment key={index}>
                            <span>{name}</span>
                            {/* Vertical divider visible on screens larger than mobile */}
                            {index < names.length - 1 && <span className={`text-sm ${t.iconColor} hidden sm:inline`}>|</span>}
                        </React.Fragment>
                    ))}
                </div>

                {/* Copyright */}
                <p className={`text-xs font-mono mt-8 ${t.names}`}>
                    Copyright © {new Date().getFullYear()} — All rights reserved
                </p>
            </div>
        </footer>
    );
};

export default Footer;