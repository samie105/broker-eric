"use client"
import { X } from "lucide-react"
import { Button } from "../../../components/ui/button"

export function EmailPreviewModal({ isOpen, onClose, emailData }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Email Preview</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="overflow-auto flex-grow p-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 text-center">
                <h1 className="text-2xl font-bold mb-2">{emailData.subject}</h1>
                <p className="opacity-90">From {emailData.sendingAs}</p>
              </div>

              <div className="p-6">
                {emailData.recipientName && (
                  <div className="text-lg font-medium mb-4">Hello {emailData.recipientName},</div>
                )}

                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: emailData.content }} />

                <div className="mt-8 pt-4 border-t border-gray-200">
                  <p>Best regards,</p>
                  <p className="font-semibold">{emailData.sendingAs}</p>
                  <p className="text-gray-600">Capital Nexus</p>
                </div>
              </div>

              <div className="bg-gray-100 p-6 text-center border-t">
                <div className="font-semibold text-gray-800 mb-2">Capital Nexus</div>
                <p className="text-gray-600 text-sm">This email was sent from our professional email service.</p>
                <div className="mt-4 text-sm">
                  <a href="#" className="text-blue-600 hover:underline">
                    Website
                  </a>{" "}
                  |
                  <a href="#" className="text-blue-600 hover:underline mx-2">
                    Support
                  </a>{" "}
                  |
                  <a href="#" className="text-blue-600 hover:underline">
                    Contact
                  </a>
                </div>
                <div className="mt-4 text-xs text-gray-500">
                  &copy; {new Date().getFullYear()} Capital Nexus. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>Send Email</Button>
        </div>
      </div>
    </div>
  )
}
