import PDFDocument from "pdfkit/js/pdfkit.standalone";
import fs from "fs";
import path from "path";

export async function generatePDF(data: any, projectPath: string) {
    const doc = new PDFDocument();

    const pdfPath = path.join(projectPath, "report.pdf");

    try {
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // TITLE
        doc.fontSize(20).text("AutoStack Project Report", { align: "center" });
        doc.moveDown();

        // PROJECT INFO
        doc.fontSize(12).text(`Project ID: ${data.projectId}`);
        doc.text(`Version: ${data.version}`);
        doc.text(`Date: ${new Date().toLocaleString()}`);
        doc.moveDown();

        // PROMPT
        doc.fontSize(14).text("User Prompt:");
        doc.fontSize(12).text(data.prompt);
        doc.moveDown();

        // TEMPLATE / UI
        doc.fontSize(14).text("UI Configuration:");
        doc.fontSize(12).text(`Template: ${data.template}`);
        doc.text(`Custom UI: ${data.ui || "None"}`);
        doc.moveDown();

        // ARCHITECTURE
        doc.fontSize(14).text("System Architecture:");
        doc.fontSize(12).text(
            "User → PlannerAgent → ComponentAgent → PageAgent → RouteAgent → CodeInjector → Runner"
        );
        doc.moveDown();

        // COMPONENTS
        doc.fontSize(14).text("Components:");
        data.components?.forEach((c: string) => {
            doc.text(`- ${c}`);
        });
        doc.moveDown();

        // PAGES
        doc.fontSize(14).text("Pages:");
        data.pages?.forEach((p: string) => {
            doc.text(`- ${p}`);
        });
        doc.moveDown();

        // BACKEND
        doc.fontSize(14).text("Backend:");
        doc.fontSize(12).text(
            "Next.js API routes are used with in-memory data storage."
        );
        doc.moveDown();

        // VERSION INFO
        doc.fontSize(14).text("Version Info:");
        doc.fontSize(12).text(`Current Version: ${data.version}`);
        doc.moveDown();

        // CONCLUSION
        doc.fontSize(14).text("Conclusion:");
        doc.fontSize(12).text(
            "This application was generated using AutoStack AI system with modular architecture and scalable design."
        );

        doc.end();
        console.log("PDF generated successfully at:", pdfPath);
    } catch (error) {
        console.error("Error generating PDF:", error);
        throw error;
    }

    return pdfPath;
}