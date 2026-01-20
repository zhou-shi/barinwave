import { Transition, Variants, motion } from "framer-motion";

// 1. Export Satu per Satu (Agar bisa di-import satuan & dikenali IDE)
export const MotionDiv = motion.div;
export const MotionNav = motion.nav;
export const MotionHeader = motion.header;
export const MotionMain = motion.main;
export const MotionFooter = motion.footer;
export const MotionP = motion.p;
export const MotionA = motion.a;
export const MotionSpan = motion.span;
export const MotionH1 = motion.h1;
export const MotionH2 = motion.h2;
export const MotionH3 = motion.h3;
export const MotionButton = motion.button;
export const MotionSection = motion.section;
export const MotionImg = motion.img;
export const MotionUl = motion.ul;
export const MotionLi = motion.li;

// 2. Export sebagai Grup (Untuk dimasukkan ke INTERNAL_MAP)
// Karena namanya sama, kita tidak perlu tulis "MotionDiv: MotionDiv"
export const HTML_MOTION = {
    MotionDiv,
    MotionNav,
    MotionHeader,
    MotionMain,
    MotionFooter,
    MotionP,
    MotionA,
    MotionSpan,
    MotionH1,
    MotionH2,
    MotionH3,
    MotionButton,
    MotionSection,
    MotionImg,
    MotionUl,
    MotionLi
};


// --- KONFIGURASI TRANSISI STANDARD ---
// Agar kita tidak perlu menulis ulang { type: "spring", ... } berulang kali
export const TRANSITION: Record<string, Transition> = {
    spring: { type: "spring", stiffness: 50, damping: 20 },
    springBouncy: { type: "spring", bounce: 0.4, duration: 0.8 },
    ease: { duration: 0.5, ease: "easeInOut" }
};

// --- GLOBAL ANIMATION VARIANTS ---
export const ANIM: Record<string, Variants> = {
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