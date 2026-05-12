import PDFDocument from "pdfkit/js/pdfkit.standalone";
import fs from "fs";
import path from "path";

export async function generatePDF(data: any, projectPath: string) {

    const doc = new PDFDocument({
        margin: 40,
        size: "A4"
    });

    const pdfPath = path.join(projectPath, "report.pdf");

    try {

        const stream = fs.createWriteStream(pdfPath);

        doc.pipe(stream);

        // =========================
        // TITLE
        // =========================

        doc
            .fontSize(24)
            .text("AutoStack AI Project Report", {
                align: "center"
            });

        doc.moveDown(1.5);

        // =========================
        // PROJECT INFO
        // =========================

        doc.fontSize(16).text("Project Information", {
            underline: true
        });

        doc.moveDown(0.5);

        doc.fontSize(12);

        doc.text(`Project ID: ${data.projectId}`);
        doc.text(`Version: ${data.version}`);
        doc.text(`Generated At: ${new Date().toLocaleString()}`);

        if (data.model) {
            doc.text(`AI Model: ${data.model}`);
        }

        doc.moveDown();

        // =========================
        // USER PROMPT
        // =========================

        doc.fontSize(16).text("User Prompt", {
            underline: true
        });

        doc.moveDown(0.5);

        doc
            .fontSize(12)
            .text(data.prompt || "No prompt provided");

        doc.moveDown();

        // =========================
        // README CONTENT
        // =========================

        if (data.docs?.["README.md"]) {

            doc.addPage();

            doc.fontSize(20).text("README", {
                align: "center"
            });

            doc.moveDown();

            doc
                .fontSize(11)
                .text(cleanMarkdown(data.docs["README.md"]), {
                    lineGap: 4
                });
        }

        // =========================
        // PROJECT REPORT
        // =========================

        if (data.docs?.["PROJECT_REPORT.md"]) {

            doc.addPage();

            doc.fontSize(20).text("PROJECT REPORT", {
                align: "center"
            });

            doc.moveDown();

            doc
                .fontSize(11)
                .text(cleanMarkdown(data.docs["PROJECT_REPORT.md"]), {
                    lineGap: 4
                });
        }

        // =========================
        // ARCHITECTURE
        // =========================

        if (data.docs?.["ARCHITECTURE.md"]) {

            doc.addPage();

            doc.fontSize(20).text("SYSTEM ARCHITECTURE", {
                align: "center"
            });

            doc.moveDown();

            doc
                .fontSize(11)
                .text(cleanMarkdown(data.docs["ARCHITECTURE.md"]), {
                    lineGap: 4
                });
        }

        // =========================
        // TODO / FUTURE SCOPE
        // =========================

        if (data.docs?.["TODO.md"]) {

            doc.addPage();

            doc.fontSize(20).text("FUTURE IMPROVEMENTS", {
                align: "center"
            });

            doc.moveDown();

            doc
                .fontSize(11)
                .text(cleanMarkdown(data.docs["TODO.md"]), {
                    lineGap: 4
                });
        }

        // =========================
        // GENERATED FILES
        // =========================

        doc.addPage();

        doc.fontSize(18).text("Generated Project Assets", {
            underline: true
        });

        doc.moveDown();

        // COMPONENTS

        doc.fontSize(14).text("Generated Components");

        doc.moveDown(0.5);

        if (data.components?.length) {

            data.components.forEach((component: string) => {
                doc.text(`• ${component}`);
            });

        } else {

            doc.text("No components generated.");
        }

        doc.moveDown();

        // PAGES

        doc.fontSize(14).text("Generated Pages");

        doc.moveDown(0.5);

        if (data.pages?.length) {

            data.pages.forEach((page: string) => {
                doc.text(`• ${page}`);
            });

        } else {

            doc.text("No pages generated.");
        }

        doc.moveDown();

        // ROUTES

        doc.fontSize(14).text("Generated Routes");

        doc.moveDown(0.5);

        if (data.routes?.length) {

            data.routes.forEach((route: string) => {
                doc.text(`• ${route}`);
            });

        } else {

            doc.text("No routes generated.");
        }

        doc.moveDown();

        // =========================
        // SYSTEM PIPELINE
        // =========================

        doc.fontSize(18).text("AI Generation Pipeline", {
            underline: true
        });

        doc.moveDown();

        doc.fontSize(12).text(`
User Prompt
↓
plannerAgent
↓
componentAgent
↓
pageAgent
↓
routeAgent
↓
docAgent
↓
codeInjector
↓
previewRenderer
↓
ZIP Export
↓
PDF Report Generation
        `);

        doc.moveDown();

        // =========================
        // FOOTER
        // =========================

        doc.moveDown(2);

        doc
            .fontSize(10)
            .text(
                "Generated Automatically by AutoStack AI",
                {
                    align: "center"
                }
            );

        doc.end();

        console.log("PDF generated successfully at:", pdfPath);

    } catch (error) {

        console.error("Error generating PDF:", error);

        throw error;
    }

    return pdfPath;
}

// =========================
// MARKDOWN CLEANER
// =========================

function cleanMarkdown(text: string) {

    return text

        // Remove markdown headers
        .replace(/^#+\s/gm, "")

        // Remove code blocks
        .replace(/```[\s\S]*?```/g, "")

        // Remove inline code
        .replace(/`/g, "")

        // Remove bold/italic
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")

        // Remove markdown links
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

        // Remove excessive newlines
        .replace(/\n{3,}/g, "\n\n")

        .trim();
}