"use client";

import { useState, useEffect } from "react";

type TypewriterWordProps = {
    word: string;
    className?: string;
};

export default function TypewriterWord({ word, className = "" }: TypewriterWordProps) {
    const [displayedText, setDisplayedText] = useState(word);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        if (!isDeleting && displayedText === word) {
            // Pause for 1.5 seconds when the word is fully typed
            timeout = setTimeout(() => {
                setIsDeleting(true);
            }, 1500);
        } else if (isDeleting && displayedText === "") {
            // Short pause before starting to type again
            timeout = setTimeout(() => {
                setIsDeleting(false);
            }, 300);
        } else if (isDeleting) {
            // Deleting letter by letter
            timeout = setTimeout(() => {
                setDisplayedText(word.substring(0, displayedText.length - 1));
            }, 50);
        } else {
            // Typing letter by letter
            timeout = setTimeout(() => {
                setDisplayedText(word.substring(0, displayedText.length + 1));
            }, 80);
        }

        return () => clearTimeout(timeout);
    }, [displayedText, isDeleting, word]);

    return (
        <span className={`${className} inline-flex items-center`}>
            {displayedText}
        </span>
    );
}
