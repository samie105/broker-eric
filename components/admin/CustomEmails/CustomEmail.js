"use client"
import { useState, useRef, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import axios from "axios"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { X, Eye, Paperclip } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card"
import { EmailPreviewModal } from "./previewmodal"

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false })
import "react-quill/dist/quill.snow.css"

export default function CustomEmail({ email }) {
  const [recipientName, setRecipientName] = useState("")
  const [recipientEmail, setRecipientEmail] = useState(email)
  const [subject, setSubject] = useState("")
  const [sendingAs, setSendingAs] = useState("Capital Nexus Team")
  const [emailContent, setEmailContent] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [errors, setErrors] = useState({
    recipientName: "",
    recipientEmail: "",
    subject: "",
    emailContent: "",
  })

  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [quillLoaded, setQuillLoaded] = useState(false)
  const quillRef = useRef(null)

  const router = useRouter()
  const fileInputRef = useRef(null)

  // Load Quill table module
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("quill-better-table")
        .then((QuillBetterTable) => {
          const Quill = require("quill")
          Quill.register("modules/better-table", QuillBetterTable.default)
          setQuillLoaded(true)
        })
        .catch(() => {
          // Fallback if quill-better-table is not available
          setQuillLoaded(true)
        })
    }
  }, [])

  // Custom image upload handler for Quill
  const imageHandler = () => {
    const input = document.createElement("input")
    input.setAttribute("type", "file")
    input.setAttribute("accept", "image/*")
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        const loadingToast = toast.loading("Uploading image...")

        try {
          const formData = new FormData()
          formData.append("file", file)
          formData.append("upload_preset", "ml_default")

          const response = await fetch("https://api.cloudinary.com/v1_1/dgqjunu7l/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`)
          }

          const data = await response.json()

          // Insert image into editor
          if (quillRef.current) {
            const quill = quillRef.current.getEditor()
            const range = quill.getSelection(true)
            quill.insertEmbed(range.index, "image", data.secure_url)
            quill.setSelection(range.index + 1)
          }

          toast.dismiss(loadingToast)
          toast.success("Image uploaded successfully")
        } catch (error) {
          console.error("Error uploading image:", error)
          toast.dismiss(loadingToast)
          toast.error("Failed to upload image")
        }
      }
    }
  }

  // Enhanced Quill modules with font selector and table support
  const modules = useMemo(() => {
    if (!quillLoaded) return {}

    const toolbarOptions = [
      [{ font: [] }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ script: "sub" }, { script: "super" }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["blockquote", "code-block"],
      ["clean"],
    ]

    const moduleConfig = {
      toolbar: {
        container: toolbarOptions,
        handlers: {
          image: imageHandler,
        },
      },
    }

    // Add table module if available
    try {
      const Quill = require("quill")
      if (Quill.imports["modules/better-table"]) {
        toolbarOptions.push([
          {
            "better-table": [
              "insert_table",
              "insert_row_above",
              "insert_row_below",
              "insert_column_left",
              "insert_column_right",
              "delete_row",
              "delete_column",
              "delete_table",
            ],
          },
        ])
        moduleConfig["better-table"] = {
          operationMenu: {
            items: {
              unmergeCells: {
                text: "Another unmerge cells name",
              },
            },
          },
        }
      }
    } catch (error) {
      console.log("Table module not available")
    }

    return moduleConfig
  }, [quillLoaded])

  const formats = [
    "font",
    "size",
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "color",
    "background",
    "script",
    "list",
    "bullet",
    "indent",
    "direction",
    "align",
    "link",
    "image",
    "video",
    "blockquote",
    "code-block",
    "better-table",
    "table",
    "table-cell-line",
    "table-cell",
  ]

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    const loadingToast = toast.loading("Uploading files...")

    try {
      const uploadedFiles = []

      for (const file of files) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", "ml_default")

        const response = await fetch("https://api.cloudinary.com/v1_1/dgqjunu7l/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`)
        }

        const data = await response.json()

        uploadedFiles.push({
          name: file.name,
          size: file.size,
          type: file.type,
          url: data.secure_url,
          public_id: data.public_id,
        })
      }

      setAttachments((prev) => [...prev, ...uploadedFiles])
      toast.dismiss(loadingToast)
      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`)

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading files:", error)
      toast.dismiss(loadingToast)
      toast.error("Failed to upload files")
    }
  }

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors = {
      recipientName: !recipientName ? "Recipient name is required." : "",
      recipientEmail: !recipientEmail ? "Recipient email is required." : "",
      subject: !subject ? "Subject is required." : "",
      emailContent: !emailContent ? "Email content is required." : "",
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const sendEmail = async (emailData) => {
    try {
      const response = await axios.post(`/db/sendCustomEmail/api`, {
        emailData: {
          ...emailData,
          attachments: attachments,
        },
      })

      return response.status === 200
    } catch (error) {
      console.error("Error sending email:", error)
      return false
    }
  }

  const handleSendClick = async () => {
    if (!validateForm()) {
      return
    }

    setIsSending(true)

    const emailData = {
      recipientName,
      recipientEmail,
      subject,
      sendingAs,
      content: emailContent,
    }

    const emailSentSuccessfully = await sendEmail(emailData)

    if (emailSentSuccessfully) {
      setRecipientName("")
      setRecipientEmail("")
      setSubject("")
      setEmailContent("")
      setAttachments([])
      setIsSending(false)
      toast.success("Email sent successfully")
      router.push("/admin")
    } else {
      setIsSending(false)
      toast.error("Error sending email")
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return "🖼️"
    if (type.includes("pdf")) return "📄"
    if (type.includes("word") || type.includes("document")) return "📝"
    if (type.includes("excel") || type.includes("spreadsheet")) return "📊"
    return "📎"
  }

  // Simple table insertion fallback
  const insertSimpleTable = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor()
      const range = quill.getSelection(true)

      const tableHTML = `
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0; border: 1px solid #e2e8f0;">
          <thead>
            <tr>
              <th style="border: 1px solid #e2e8f0; padding: 12px; background-color: #f7fafc; text-align: left; font-weight: 600;">Header 1</th>
              <th style="border: 1px solid #e2e8f0; padding: 12px; background-color: #f7fafc; text-align: left; font-weight: 600;">Header 2</th>
              <th style="border: 1px solid #e2e8f0; padding: 12px; background-color: #f7fafc; text-align: left; font-weight: 600;">Header 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #e2e8f0; padding: 12px;">Row 1, Cell 1</td>
              <td style="border: 1px solid #e2e8f0; padding: 12px;">Row 1, Cell 2</td>
              <td style="border: 1px solid #e2e8f0; padding: 12px;">Row 1, Cell 3</td>
            </tr>
            <tr>
              <td style="border: 1px solid #e2e8f0; padding: 12px;">Row 2, Cell 1</td>
              <td style="border: 1px solid #e2e8f0; padding: 12px;">Row 2, Cell 2</td>
              <td style="border: 1px solid #e2e8f0; padding: 12px;">Row 2, Cell 3</td>
            </tr>
          </tbody>
        </table>
      `

      quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML)
      quill.setSelection(range.index + 1)
    }
  }

  if (!quillLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardHeader className="text-center border-b bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6">
            <CardTitle className="text-2xl font-bold">Email Service</CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-6">
            {/* Recipient Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="recipientName" className="text-sm font-medium text-gray-700">
                  Name
                </Label>
                <Input
                  id="recipientName"
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className={`mt-1 ${errors.recipientName ? "border-red-500" : ""}`}
                  placeholder="Recipient name"
                />
                {errors.recipientName && <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>}
              </div>

              <div>
                <Label htmlFor="recipientEmail" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className={`mt-1 ${errors.recipientEmail ? "border-red-500" : ""}`}
                  placeholder="recipient@example.com"
                />
                {errors.recipientEmail && <p className="text-red-500 text-sm mt-1">{errors.recipientEmail}</p>}
              </div>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                Subject
              </Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={`mt-1 ${errors.subject ? "border-red-500" : ""}`}
                placeholder="Email subject"
              />
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
            </div>

            {/* Sending As */}
            <div>
              <Label htmlFor="sendingAs" className="text-sm font-medium text-gray-700">
                Sending As
              </Label>
              <Input
                id="sendingAs"
                type="text"
                value={sendingAs}
                onChange={(e) => setSendingAs(e.target.value)}
                className="mt-1"
                placeholder="Your name or organization"
              />
            </div>

            {/* Rich Text Editor */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm font-medium text-gray-700">Message</Label>
                <div className="flex gap-2">
                  {/* <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={insertSimpleTable}
                    className="flex items-center gap-1"
                  >
                    📊 Table
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1"
                  >
                    <Paperclip className="w-4 h-4" />
                    Attach Files
                  </Button> */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
              </div>

              <div className={`border rounded-lg ${errors.emailContent ? "border-red-500" : ""}`}>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={emailContent}
                  onChange={setEmailContent}
                  modules={modules}
                  formats={formats}
                  placeholder="Compose your message here..."
                  style={{ minHeight: "400px" }}
                />
              </div>

              {errors.emailContent && <p className="text-red-500 text-sm mt-1">{errors.emailContent}</p>}
            </div>

            {/* File Upload */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx"
            />

            {/* Attachments Table */}
            {attachments.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  Attachments ({attachments.length})
                </Label>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          File
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {attachments.map((file, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{getFileIcon(file.type)}</span>
                              <div>
                                <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Send Button */}
            <div className="pt-6">
              <Button
                onClick={handleSendClick}
                disabled={isSending}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 text-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                size="lg"
              >
                {isSending ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  "Send Message"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Preview Modal */}
      <EmailPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        emailData={{
          subject,
          sendingAs,
          recipientName,
          content: emailContent,
        }}
      />
    </div>
  )
}
