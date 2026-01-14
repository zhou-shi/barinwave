// islands/modules/lib/anim.ts
import { Transition, Variants, motion } from "framer-motion";

const MotionDiv = motion.div;
const MotionNav = motion.nav;
const MotionHeader = motion.header;
const MotionH1 = motion.h1;
const MotionH2 = motion.h2;
const MotionH3 = motion.h3;
const MotionP = motion.p;
const MotionA = motion.a;
const MotionSpan = motion.span;
const MotionButton = motion.button;
const MotionSection = motion.section;


// --- KONFIGURASI TRANSISI STANDARD ---
// Agar kita tidak perlu menulis ulang { type: "spring", ... } berulang kali
const TRANSITION: Record<string, Transition> = {
    spring: { type: "spring", stiffness: 50, damping: 20 },
    springBouncy: { type: "spring", bounce: 0.4, duration: 0.8 },
    ease: { duration: 0.5, ease: "easeInOut" }
};

// --- GLOBAL ANIMATION VARIANTS ---
const ANIM: Record<string, Variants> = {
    // 1. Container (Parent) - Mengatur anak-anaknya muncul berurutan
    container: {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // Jeda antar elemen anak
                delayChildren: 0.05,
            },
        },
    },

    // 2. Slide Up (Muncul dari bawah ke posisi semula)
    slideUp: {
        hidden: { y: 20, opacity: 0 },
        show: { 
            y: 0, 
            opacity: 1, 
            transition: TRANSITION.spring 
        }
    },

    // 3. Slide Right (Muncul dari kiri)
    slideRight: {
        hidden: { x: -50, opacity: 0 },
        show: { 
            x: 0, 
            opacity: 1, 
            transition: TRANSITION.springBouncy 
        }
    },

    // 4. Pop In (Zoom in efek) - Cocok untuk Card/Gambar
    popIn: {
        hidden: { scale: 0.9, opacity: 0 },
        show: { 
            scale: 1, 
            opacity: 1, 
            transition: TRANSITION.springBouncy 
        }
    },

    // 5. Fade In (Muncul pelan)
    fadeIn: {
        hidden: { opacity: 0 },
        show: { 
            opacity: 1, 
            transition: { duration: 0.6 } 
        }
    },

    // 6. Flip (Efek kartu berputar sedikit)
    flipIn: {
        hidden: { rotateX: 90, opacity: 0 },
        show: { 
            rotateX: 0, 
            opacity: 1, 
            transition: TRANSITION.springBouncy 
        }
    }
};

export { 
    ANIM, 
    TRANSITION, 
    MotionDiv, 
    MotionH1, 
    MotionH2, 
    MotionH3, 
    MotionHeader, 
    MotionNav, 
    MotionSpan, 
    MotionButton,
    MotionP,
    MotionA,
    MotionSection
};