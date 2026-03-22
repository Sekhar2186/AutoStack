"use client";
/* AUTO-IMPORTS */

import { motion } from "framer-motion";

export default function Page() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6"
        >
            <h1 className="text-3xl font-bold mb-4">Animated App</h1>
            <p>Beautiful animations included 🚀</p>
            {/* AUTO-INJECT-COMPONENTS */}
        </motion.div>
    );
}