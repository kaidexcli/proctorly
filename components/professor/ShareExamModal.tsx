'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Exam } from '@/types/exam';
import {
  X,
  Copy,
  Check,
  QrCode,
  Link as LinkIcon,
  KeyRound,
  Mail,
  Code2,
  Download,
  Printer,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Clock,
  Share2,
  RefreshCw,
  Send,
} from 'lucide-react';
import { examStore } from '@/lib/examStore';

interface ShareExamModalProps {
  exam: Exam;
  isOpen: boolean;
  onClose: () => void;
  onExamUpdated?: (exam: Exam) => void;
}

export default function ShareExamModal({
  exam,
  isOpen,
  onClose,
  onExamUpdated,
}: ShareExamModalProps) {
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'code' | 'email' | 'embed'>('link');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSize, setQrSize] = useState<number>(320);
  const [origin, setOrigin] = useState<string>('');
  const [emailRecipients, setEmailRecipients] = useState<string>('');
  const [invitesSent, setInvitesSent] = useState<boolean>(false);
  const [currentCode, setCurrentCode] = useState<string>(exam.accessCode);

  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    setCurrentCode(exam.accessCode);
  }, [exam]);

  const examUrl = `${origin}/exam/${exam.sharingSettings.customSlug || exam.id}`;
  const directJoinUrl = `${examUrl}?code=${currentCode}`;

  // Generate QR Code
  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(directJoinUrl, {
        width: qrSize,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Error creating QR Code', err));
    }
  }, [directJoinUrl, qrSize, isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleRegenerateCode = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const numbers = '23456789';
    let newCode = '';
    for (let i = 0; i < 3; i++) {
      newCode += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    newCode += '-';
    for (let i = 0; i < 4; i++) {
      newCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    setCurrentCode(newCode);

    const updated: Exam = {
      ...exam,
      accessCode: newCode,
    };
    examStore.saveExam(updated);
    if (onExamUpdated) onExamUpdated(updated);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${exam.courseCode.replace(/[^a-zA-Z0-9]/g, '_')}_QR_Exam_Access.png`;
    a.click();
  };

  const handlePrintSlip = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Exam Access Voucher - ${exam.title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              padding: 40px;
              color: #111;
            }
            .ticket {
              border: 2px dashed #333;
              border-radius: 12px;
              padding: 30px;
              max-width: 650px;
              margin: 0 auto;
              page-break-inside: avoid;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 2px solid #222;
              padding-bottom: 16px;
              margin-bottom: 20px;
            }
            .code-box {
              background: #f1f5f9;
              padding: 12px 20px;
              border-radius: 8px;
              font-family: monospace;
              font-size: 26px;
              font-weight: bold;
              letter-spacing: 2px;
              text-align: center;
              margin: 15px 0;
              border: 1px solid #cbd5e1;
            }
            .qr-center {
              text-align: center;
              margin: 20px 0;
            }
            .qr-center img {
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 8px;
            }
            .rules {
              background: #fffbeb;
              border: 1px solid #fde68a;
              border-radius: 8px;
              padding: 16px;
              margin-top: 20px;
              font-size: 13px;
              line-height: 1.5;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div>
                <h2 style="margin:0; font-size:22px;">${exam.title}</h2>
                <div style="color: #475569; font-weight:600; margin-top:4px;">${exam.courseCode} • Duration: ${exam.durationMinutes} Minutes</div>
              </div>
              <div style="text-align:right;">
                <span style="background: #e0e7ff; color: #3730a3; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 12px;">PROCTORLY SECURE</span>
              </div>
            </div>

            <div style="display:flex; justify-content:space-around; align-items:center; flex-wrap:wrap;">
              <div>
                <div style="font-size: 13px; font-weight: 600; color: #475569; text-transform: uppercase;">Method 1: Enter Exam Access Code</div>
                <div class="code-box">${currentCode}</div>
                ${exam.sharingSettings.passcode ? `<div style="font-size: 13px; margin-top: 6px;">Passcode: <strong>${exam.sharingSettings.passcode}</strong></div>` : ''}
                <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Go to: <u>${origin}</u> and enter code</div>
              </div>

              <div class="qr-center">
                <div style="font-size: 13px; font-weight: 600; color: #475569; text-transform: uppercase; margin-bottom: 8px;">Method 2: Scan QR Code</div>
                <img src="${qrDataUrl}" width="160" height="160" alt="QR Code" />
              </div>
            </div>

            <div class="rules">
              <strong style="color: #b45309;">⚠️ Mandatory Anti-Cheat Requirements:</strong>
              <ul style="margin: 8px 0 0 18px; padding: 0;">
                <li>Functional WebCam & Microphone must be enabled throughout test.</li>
                <li>Exam must remain in Fullscreen mode (exiting triggers security violation).</li>
                <li>Tab switching, window minimization, and external pasting are strictly blocked.</li>
                <li>Exam will auto-submit upon exceeding ${exam.securitySettings.maxViolationsAllowed} violations.</li>
              </ul>
            </div>

            <div class="footer">
              Created by ${exam.professorName} • Powered by Proctorly AI Anti-Cheat Engine
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const emailSubject = `Exam Invitation: ${exam.courseCode} - ${exam.title}`;
  const emailBodyTemplate = `Dear Student,

You have been registered for the online examination:
Course: ${exam.courseCode} - ${exam.title}
Instructor: ${exam.professorName}
Duration: ${exam.durationMinutes} Minutes

HOW TO ACCESS YOUR EXAM:
Option 1: Direct Link
${directJoinUrl}

Option 2: Student Portal & Access Code
1. Visit ${origin}
2. Enter Access Code: ${currentCode}
${exam.sharingSettings.passcode ? `3. Enter Security Passcode: ${exam.sharingSettings.passcode}` : ''}

CRITICAL ANTI-CHEAT REQUIREMENTS:
- Working Webcam & Microphone required
- Fullscreen mode will be strictly locked
- Tab switching and clipboard pasting will be logged and penalized
- Maximum allowed violations: ${exam.securitySettings.maxViolationsAllowed}

Please ensure you are in a quiet, well-lit environment before commencing.

Best regards,
${exam.professorName}
Powered by Proctorly`;

  const embedCode = `<iframe
  src="${directJoinUrl}"
  width="100%"
  height="700"
  frameborder="0"
  allow="camera; microphone; fullscreen; display-capture"
  title="${exam.title}">
</iframe>`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Share Exam
                <span className="rounded-md bg-indigo-950 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-700/50">
                  {exam.courseCode}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">Distribute this assessment to students through multiple secure channels</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/50 px-6 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'link'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LinkIcon className="h-4 w-4" />
            <span>Direct Link</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <QrCode className="h-4 w-4" />
            <span>QR Code</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <KeyRound className="h-4 w-4" />
            <span>Access PIN</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'email'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Email Invite</span>
          </button>

          <button
            onClick={() => setActiveTab('embed')}
            className={`flex items-center gap-2 border-b-2 py-3 px-3 text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === 'embed'
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="h-4 w-4" />
            <span>LMS Embed</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* TAB 1: DIRECT LINK */}
          {activeTab === 'link' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Direct Student Access URL
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      readOnly
                      value={directJoinUrl}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-200 font-mono focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleCopy(directJoinUrl, 'directUrl')}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                  >
                    {copiedField === 'directUrl' ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-300" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                  <a
                    href={directJoinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="Open in new tab to test"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Security info pill */}
              <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5" />
                  <div className="text-xs text-emerald-200/90 leading-relaxed">
                    <strong className="text-emerald-300 block mb-1">Pre-authenticated Security Parameters Active</strong>
                    Students opening this link will be directed straight to the secure pre-exam diagnostics suite with the access code pre-filled.
                    {exam.sharingSettings.passcode && (
                      <span className="block mt-1 text-zinc-300">
                        Exam Passcode: <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">{exam.sharingSettings.passcode}</code>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Social / Classroom Quick share */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                  One-Click Broadcast Channels
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      const shareUrl = `https://classroom.google.com/share?url=${encodeURIComponent(directJoinUrl)}&title=${encodeURIComponent(exam.title)}`;
                      window.open(shareUrl, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Google Classroom</span>
                  </button>

                  <button
                    onClick={() => {
                      const shareUrl = `https://teams.microsoft.com/share?href=${encodeURIComponent(directJoinUrl)}&msgText=${encodeURIComponent(`Take ${exam.courseCode} Exam: ${exam.title}`)}`;
                      window.open(shareUrl, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    <Share2 className="h-4 w-4 text-indigo-400" />
                    <span>Microsoft Teams</span>
                  </button>

                  <button
                    onClick={() => {
                      const msg = `Exam Link for ${exam.courseCode} (${exam.title}): ${directJoinUrl}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    <Send className="h-4 w-4 text-emerald-400" />
                    <span>WhatsApp / Chat</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QR CODE */}
          {activeTab === 'qr' && (
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* QR Preview Frame */}
              <div className="flex flex-col items-center">
                <div className="relative rounded-2xl bg-white p-4 shadow-xl border-4 border-indigo-500/20">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Exam QR Code"
                      className="h-56 w-56 object-contain"
                    />
                  ) : (
                    <div className="h-56 w-56 flex items-center justify-center text-zinc-400">
                      Generating QR...
                    </div>
                  )}
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white shadow">
                    SCAN TO JOIN
                  </div>
                </div>
              </div>

              {/* QR Actions & Options */}
              <div className="flex-1 space-y-4 text-left w-full">
                <div>
                  <h4 className="text-base font-bold text-white mb-1">Instant QR Code Access</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Display this code on the projector screen in an auditorium, or print desk slips for physical testing halls. Students scan with their phone or laptop camera to launch the secured exam environment.
                  </p>
                </div>

                <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-3.5 space-y-1.5 text-xs text-zinc-300 font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Access Code:</span>
                    <span className="font-bold text-white">{currentCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Duration:</span>
                    <span className="text-zinc-300">{exam.durationMinutes} Minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Security Mode:</span>
                    <span className="text-emerald-400">Strict AI Proctoring</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleDownloadQR}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PNG</span>
                  </button>

                  <button
                    onClick={handlePrintSlip}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-200 hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    <Printer className="h-4 w-4 text-emerald-400" />
                    <span>Print Exam Voucher</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACCESS CODE / PIN */}
          {activeTab === 'code' && (
            <div className="space-y-6 text-center">
              <div>
                <h4 className="text-base font-bold text-white mb-1">Student Entry PIN</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Students can join from any browser by navigating to the Proctorly portal and typing this 6-character code.
                </p>
              </div>

              {/* Big PIN Display */}
              <div className="relative mx-auto max-w-sm rounded-2xl border-2 border-indigo-500/40 bg-linear-to-b from-indigo-950/40 to-zinc-950 p-8 shadow-inner">
                <div className="text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-2">
                  OFFICIAL ACCESS PIN
                </div>
                <div className="text-4xl sm:text-5xl font-mono font-black tracking-widest text-white drop-shadow-md">
                  {currentCode}
                </div>
                {exam.sharingSettings.passcode && (
                  <div className="mt-4 pt-4 border-t border-zinc-800 text-xs text-zinc-400">
                    Required Passcode: <span className="text-white font-mono font-bold">{exam.sharingSettings.passcode}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={() => handleCopy(currentCode, 'pin')}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  {copiedField === 'pin' ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span>PIN Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Access Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleRegenerateCode}
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                  title="Generate a new randomized PIN"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Regenerate PIN</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: EMAIL INVITATION */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Recipient Email Addresses
                </label>
                <input
                  type="text"
                  placeholder="student1@university.edu, student2@university.edu..."
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Invitation Email Preview
                </label>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs font-mono text-zinc-300 whitespace-pre-wrap max-h-52 overflow-y-auto leading-relaxed">
                  <div className="text-zinc-500 mb-2 border-b border-zinc-800 pb-1">
                    Subject: {emailSubject}
                  </div>
                  {emailBodyTemplate}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => handleCopy(emailBodyTemplate, 'emailBody')}
                  className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
                >
                  {copiedField === 'emailBody' ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span>Email Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Full Email Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setInvitesSent(true);
                    setTimeout(() => setInvitesSent(false), 3000);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  {invitesSent ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Invitations Dispatched!</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Direct Invites</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: LMS EMBED */}
          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-bold text-white mb-1">LMS & Portal Iframe Embed</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Embed this secure test directly into Blackboard, Canvas, Moodle, or custom school portals. Permissions for camera, microphone, and fullscreen are pre-configured in the iframe attribute header.
                </p>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={4}
                  value={embedCode}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-3 text-xs font-mono text-zinc-300 focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleCopy(embedCode, 'embedCode')}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  {copiedField === 'embedCode' ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-300" />
                      <span>Embed Code Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copy Embed Snippet</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 bg-zinc-950/70 px-6 py-4 flex justify-between items-center text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>Active until: {new Date(Date.now() + 3600000 * 24 * 7).toLocaleDateString()}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-zinc-800 px-4 py-1.5 font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
