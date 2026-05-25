import { useEffect, useState } from "react";
import { EmptyState, PageLoader } from "../../components/AppStates";
import { CommerceShell, MotionSection } from "../../components/commerce/CommerceLayout";
import { uploadUrl } from "../../config/api";
import { warrantyService } from "../../services/warrantyService";

export default function WarrantyPolicyPage() {
  const [policy, setPolicy] = useState(null);
  const [status, setStatus] = useState("loading");
  const [contentStatus, setContentStatus] = useState("idle");
  const [policyContent, setPolicyContent] = useState("");

  useEffect(() => {
    warrantyService.getPolicy({ skipGlobalErrorToast: true })
      .then((result) => {
        setPolicy(result);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    if (!policy?.url) {
      setPolicyContent("");
      setContentStatus("idle");
      return;
    }

    let active = true;
    setContentStatus("loading");
    import("../../client-integrations/pdfjs")
      .then(({ extractTextFromPDFUrl }) => extractTextFromPDFUrl(uploadUrl(policy.url)))
      .then((text) => {
        if (!active) return;
        setPolicyContent(text || "");
        setContentStatus(text ? "success" : "empty");
      })
      .catch(() => {
        if (!active) return;
        setPolicyContent("");
        setContentStatus("error");
      });

    return () => {
      active = false;
    };
  }, [policy?.url]);

  return (
    <CommerceShell seoTitle="Warranty Policy" seoDescription="INFIBOLT warranty policy PDF for product registration and claims.">
      <MotionSection className="px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Warranty policy</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal text-slate-950 sm:text-5xl">INFIBOLT Warranty Policy</h1>
          <p className="mt-4 max-w-2xl text-sm font-light leading-7 text-slate-600">
            Read the current warranty policy before registering a product or submitting a claim.
          </p>

          <div className="mt-8">
            {status === "loading" && <PageLoader label="Loading warranty policy" />}
            {status === "error" && <EmptyState title="Warranty policy unavailable" description="The policy document could not be loaded right now." />}
            {status === "success" && !policy?.url && <EmptyState title="Warranty policy not published" description="The admin team has not uploaded a warranty policy PDF yet." />}
            {policy?.url && (
              <div className="overflow-hidden rounded-2xl border border-slate-900/8 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
                <div className="flex flex-col gap-3 border-b border-slate-900/8 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{policy.originalName || policy.title}</p>
                    {policy.uploadedAt && <p className="mt-1 text-xs font-medium text-slate-500">Updated {new Date(policy.uploadedAt).toLocaleDateString("en-IN")}</p>}
                  </div>
                  <a href={uploadUrl(policy.url)} target="_blank" rel="noopener noreferrer" className="hidden min-h-[40px] items-center justify-center rounded-full bg-slate-950 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white md:inline-flex">
                    Open PDF
                  </a>
                </div>
                <div className="bg-slate-50 px-5 py-6 md:hidden">
                  <div className="rounded-2xl border border-slate-900/8 bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-950">Policy content</p>
                      <a href={uploadUrl(policy.url)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-slate-950 px-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                        View policy PDF
                      </a>
                    </div>
                    {contentStatus === "loading" && <p className="mt-3 text-sm font-light leading-6 text-slate-600">Loading policy content...</p>}
                    {contentStatus === "success" && (
                      <div className="mt-3 max-h-[54vh] overflow-y-auto pr-1 text-left text-sm font-light leading-7 text-slate-700">
                        {policyContent.split(/\n{2,}/).map((paragraph, index) => (
                          <p key={`${index}-${paragraph.slice(0, 16)}`} className={index ? "mt-4" : ""}>{paragraph}</p>
                        ))}
                      </div>
                    )}
                    {["empty", "error"].includes(contentStatus) && (
                      <p className="mt-3 text-sm font-light leading-6 text-slate-600">
                        Policy content could not be previewed here. Please open the PDF from a desktop browser.
                      </p>
                    )}
                  </div>
                </div>
                <iframe title="INFIBOLT Warranty Policy PDF" src={uploadUrl(policy.url)} className="hidden h-[72vh] w-full bg-slate-50 md:block" />
              </div>
            )}
          </div>
        </div>
      </MotionSection>
    </CommerceShell>
  );
}
