import { FileDetail } from "@/components/browse/file-detail"
import { RelatedFiles } from "@/components/browse/related-files"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface FileDetailPageProps {
  params: {
    id: string
  }
}

export default function FileDetailPage({ params }: FileDetailPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/browse">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar à pesquisa
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <Image src="/akadox-logo.png" alt="Akadox" width={32} height={32} className="akadox-glow" />
                <div>
                  <h1 className="font-serif font-black text-lg akadox-text">Akadox</h1>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link href="/upload">Carregar</Link>
              </Button>
              <Button asChild>
                <Link href="/profile">Perfil</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <FileDetail fileId={params.id} />
          </div>
          <div className="lg:col-span-1">
            <RelatedFiles fileId={params.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
