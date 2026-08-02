"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function NewsletterPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDismissed, setIsDismissed] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [requirement, setRequirement] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check local storage to see if it was already dismissed
        const dismissed = localStorage.getItem("newsletterDismissed");
        if (!dismissed) {
            setIsDismissed(false);
            const handleScroll = () => {
                // Show popup after scrolling down
                const scrollPosition = window.scrollY;
                const windowHeight = window.innerHeight;
                const bodyHeight = document.body.offsetHeight;

                // Show popup when user scrolls down ~20% of the page
                if (scrollPosition > (bodyHeight - windowHeight) * 0.2 && !isOpen) {
                    setIsOpen(true);
                }
            };

            window.addEventListener("scroll", handleScroll, { passive: true });
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem("newsletterDismissed", "true");
        setIsDismissed(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Push the requirement to the URL to be picked up by FeaturedDiscoverySection
        // Map dropdown values to search queries
        const queryMap: Record<string, string> = {
            "living-room": "living room",
            "bedroom": "bedroom",
            "kitchen": "kitchen",
            "bathroom": "bathroom",
            "whole-home": "home"
        };

        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set("q", queryMap[requirement] || requirement || "living room");

        try {
            // Send data to Web3Forms
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: "fdd178df-7e9c-4f04-82d1-51ad75143a02", // Replace with your actual Web3Forms access key
                    subject: `New Design Request: ${queryMap[requirement] || requirement}`,
                    phone: phoneNumber,
                    requirement: queryMap[requirement] || requirement,
                }),
            });

            const result = await response.json();
            if (result.success) {
                // Now that it succeeded, push the URL state
                router.push(`/?${searchParams.toString()}#discovery`);

                setIsSubmitted(true);
                setTimeout(() => {
                    handleClose();
                }, 3000);
            } else {
                console.error("Form submission failed backend error:", result);
                alert(`Error: ${result.message || "Something went wrong. Please try again."}`);
            }
        } catch (error) {
            console.error("Error submitting form (network):", error);
            alert("Network error: Could not connect to the submission server. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isDismissed && !isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[105] bg-background/80 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Popup Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
                        className="fixed left-1/2 top-1/2 z-[110] w-[calc(100%-2rem)] max-w-lg origin-center overflow-hidden border border-foreground/30 bg-background shadow-2xl sm:p-0"
                    >
                        <div className="relative">
                            <button
                                onClick={handleClose}
                                className="absolute right-4 top-4 z-10 text-muted transition-colors hover:text-text-strong"
                                aria-label="Close newsletter popup"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {isSubmitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center p-8 text-center"
                                >
                                    <h3 className="mb-4 text-3xl font-bold tracking-tight text-text-strong">
                                        Coupon Sent!
                                    </h3>
                                    <p className="text-lg text-para">
                                        Check your phone for your one-time discount code. We've also updated the discovery section for you!
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="flex flex-col text-center">
                                    {/* Header Area */}
                                    <div className="bg-background p-8 pb-8 pt-10 border-b border-foreground/10">
                                        <div className="mb-8 mx-auto w-max flex justify-center">
                                            <Image
                                                src="/logo_dark.png"
                                                alt="DesignBHK"
                                                width={180}
                                                height={48}
                                                className="h-8 w-auto sm:h-9"
                                                style={{ filter: "var(--header-logo-filter)" }}
                                                priority
                                            />
                                        </div>

                                        {/* <span className="mb-3 block text-[11px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                                            Special Newsletter
                                        </span> */}

                                        <h3 className="mb-2 text-[2rem] font-medium leading-[1.1] tracking-tight text-foreground sm:text-[2.5rem]">
                                            Exciting Offers
                                        </h3>

                                        <p className="text-sm font-medium text-muted-foreground mt-3">
                                            On your first order with DesignBHK
                                        </p>
                                    </div>

                                    {/* Body Area */}
                                    <div className="bg-foreground/[0.02] p-8 pt-8">
                                        <p className="mb-6 text-[11px] uppercase tracking-wider text-muted-foreground leading-relaxed">
                                            By submitting this form, you agree to receive marketing text messages from us. Msg & data rates may apply.
                                        </p>

                                        <form onSubmit={handleSubmit} className="mx-auto flex w-full flex-col gap-4 max-w-sm">
                                            <div className="space-y-1.5 text-left">
                                                <label htmlFor="requirement" className="sr-only">What are you looking for?</label>
                                                <select
                                                    id="requirement"
                                                    required
                                                    value={requirement}
                                                    onChange={(e) => setRequirement(e.target.value)}
                                                    className="w-full border-b border-foreground/30 bg-transparent px-2 py-3 text-sm font-medium text-foreground outline-none transition-all focus:border-foreground"
                                                >
                                                    <option value="" disabled>What are you looking for?</option>
                                                    <option value="living-room">Living Room Design</option>
                                                    <option value="bedroom">Bedroom Design</option>
                                                    <option value="kitchen">Kitchen Remodel</option>
                                                    <option value="bathroom">Bathroom Remodel</option>
                                                    <option value="whole-home">Complete Home Renovation</option>
                                                </select>
                                            </div>

                                            <div className="relative space-y-1.5 text-left mt-2">
                                                <label htmlFor="phone" className="sr-only">Phone Number</label>
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                                                    <svg className="w-4 h-4 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m9 17 5-5-5-5M9 1v18" />
                                                        <rect width="14" height="18" x="2" y="1" rx="2" ry="2" strokeWidth="1.5" />
                                                    </svg>
                                                </div>
                                                <input
                                                    id="phone"
                                                    type="tel"
                                                    required
                                                    placeholder="ENTER YOUR MOBILE NUMBER"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className="w-full border-b border-foreground/30 bg-transparent pl-10 pr-2 py-3 text-[13px] font-bold tracking-[0.1em] text-foreground placeholder-muted-foreground outline-none transition-all focus:border-foreground text-center"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="mt-6 w-full bg-foreground px-4 py-4 text-xs font-bold uppercase tracking-[0.2em] text-background transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? "Sending..." : "Get Discounts Now"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleClose}
                                                className="mt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground transition-all hover:text-foreground mx-auto w-max underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-foreground"
                                            >
                                                NO, THANK YOU
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
