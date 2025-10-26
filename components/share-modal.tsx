"use client"

import { useState } from "react"
import { Share2, Link2, Mail, MessageCircle, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  fileTitle: string
  fileUrl: string
}

export function ShareModal({ isOpen, onClose, fileTitle, fileUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fileUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Erro ao copiar link:", err)
    }
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Documento: ${fileTitle}`)
    const body = encodeURIComponent(
      `Olá! Encontrei este documento interessante e queria partilhar contigo: ${fileTitle}\n\nPodes aceder aqui: ${fileUrl}`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Documento: ${fileTitle}\n${fileUrl}`)
    window.open(`https://wa.me/?text=${text}`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="w-5 h-5 text-red-500" />
            Partilhar Documento
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-gray-400 text-sm mb-2">Documento:</p>
            <p className="text-white font-medium">{fileTitle}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-2">Link do documento:</p>
            <div className="flex gap-2">
              <Input value={fileUrl} readOnly className="bg-gray-800 border-gray-600 text-white flex-1" />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="border-gray-600 hover:bg-gray-700 bg-transparent"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-gray-400 text-sm">Partilhar via:</p>

            <Button
              onClick={handleEmailShare}
              variant="outline"
              className="w-full justify-start gap-3 border-gray-600 hover:bg-gray-700 bg-transparent"
            >
              <Mail className="w-5 h-5 text-blue-500" />
              Email
            </Button>

            <Button
              onClick={handleWhatsAppShare}
              variant="outline"
              className="w-full justify-start gap-3 border-gray-600 hover:bg-gray-700 bg-transparent"
            >
              <MessageCircle className="w-5 h-5 text-green-500" />
              WhatsApp
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full justify-start gap-3 border-gray-600 hover:bg-gray-700 bg-transparent"
            >
              <Link2 className="w-5 h-5 text-purple-500" />
              Copiar Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ShareModal
