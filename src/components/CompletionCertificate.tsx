"use client";

import { Award, Share2, Download } from "lucide-react";

// ---------------------------------------------------------------------------
// CompletionCertificate
//
// Rendered on the course detail page when a user has completed every lesson.
// Shows a branded certificate card and provides LinkedIn share + download CTAs.
// ---------------------------------------------------------------------------

interface CompletionCertificateProps {
  courseName: string;
  userName: string;
  completedDate: string; // ISO date string or display string
}

export function CompletionCertificate({
  courseName,
  userName,
  completedDate,
}: CompletionCertificateProps) {
  const formattedDate = (() => {
    try {
      return new Date(completedDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return completedDate;
    }
  })();

  function handleLinkedInShare() {
    const text = encodeURIComponent(
      `I just completed "${courseName}" on Learn to GPT! 🎓 Building real ChatGPT fluency, one lesson at a time. #LearnToGPT #AI`
    );
    const url = encodeURIComponent("https://learntogpt.com?utm_source=linkedin&utm_medium=social&utm_campaign=certificate_share");
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  function handleDownload() {
    // Print the certificate card only — use the browser's print-to-PDF.
    // The certificate element has id="completion-certificate" for targeting.
    const el = document.getElementById("completion-certificate");
    if (!el) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${courseName} — Certificate of Completion</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f0ebe3; font-family: sans-serif; }
            .cert { border: 4px solid #d4a373; background: #fdf8f0; padding: 48px; max-width: 640px; width: 100%; text-align: center; box-shadow: 8px 8px 0px #1c1917; }
            .serif { font-family: 'Instrument Serif', serif; }
            h1 { font-size: 32px; color: #1c1917; margin-bottom: 8px; }
            .sub { font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: #78716c; margin-bottom: 32px; }
            .name { font-size: 28px; font-weight: 800; color: #1c1917; border-bottom: 2px solid #d4a373; display: inline-block; padding-bottom: 4px; margin-bottom: 16px; }
            .course { font-size: 20px; color: #e07a3a; font-weight: 700; margin-bottom: 8px; }
            .date { font-size: 13px; color: #78716c; margin-top: 24px; }
            .logo { font-size: 14px; font-weight: 800; color: #1c1917; margin-top: 32px; }
          </style>
        </head>
        <body>
          <div class="cert">
            <p class="sub serif">Certificate of Completion</p>
            <h1 class="serif">Learn to GPT</h1>
            <p style="margin: 24px 0 8px; font-size: 14px; color: #78716c;">This certifies that</p>
            <p class="name">${userName}</p>
            <p style="margin: 12px 0 8px; font-size: 14px; color: #78716c;">has successfully completed</p>
            <p class="course">${courseName}</p>
            <p class="date">Completed ${formattedDate}</p>
            <p class="logo" style="margin-top: 40px;">learntogpt.com</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  return (
    <div className="mt-8">
      {/* Section heading */}
      <h2 className="mb-4 text-lg font-extrabold text-ink">
        Course Complete
      </h2>

      {/* Certificate card */}
      <div
        id="completion-certificate"
        className="overflow-hidden rounded-3xl border-[4px] border-[#d4a373] bg-[#fdf8f0] shadow-[6px_6px_0px_#1c1917]"
      >
        {/* Gold accent bar */}
        <div className="h-2 w-full bg-[#d4a373]" />

        <div className="space-y-6 p-8 text-center">
          {/* Award icon */}
          <div className="flex justify-center">
            <div className="flex size-20 items-center justify-center rounded-full border-[3px] border-[#d4a373] bg-orange text-white shadow-[4px_4px_0px_#1c1917]">
              <Award className="size-10" />
            </div>
          </div>

          {/* Certificate text */}
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Certificate of Completion
            </p>
            <p className="text-4xl font-extrabold tracking-tight text-orange">
              Learn to GPT
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">This certifies that</p>
            <p className="inline-block border-b-2 border-[#d4a373] pb-1 text-2xl font-extrabold text-ink">
              {userName}
            </p>
            <p className="text-sm text-muted-foreground">has successfully completed</p>
            <p className="text-xl font-bold text-orange">{courseName}</p>
          </div>

          <p className="text-xs text-muted-foreground">
            Completed {formattedDate}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={handleLinkedInShare}
              className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-[#0077b5] px-6 py-3 text-sm font-bold text-white shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#1c1917]"
            >
              <Share2 className="size-4" />
              Share on LinkedIn
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 rounded-full border-[3px] border-ink bg-warm-white px-6 py-3 text-sm font-bold text-ink shadow-[3px_3px_0px_#1c1917] transition-all hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_#1c1917]"
            >
              <Download className="size-4" />
              Download Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
