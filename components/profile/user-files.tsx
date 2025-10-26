import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Download, Star, Eye, MoreHorizontal } from "lucide-react"
import { getUserFiles } from "@/lib/actions/profile"
import Link from "next/link"

interface UserFilesProps {
  userId: string
  isOwnProfile: boolean
}

export async function UserFiles({ userId, isOwnProfile }: UserFilesProps) {
  const result = await getUserFiles(userId)
  const userFiles = result.success ? result.files : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-xl text-foreground">Meus Recursos</h3>
        {userFiles.length > 3 && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/browse?author=${userId}`}>Ver Todos</Link>
          </Button>
        )}
      </div>

      {userFiles.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {isOwnProfile ? "Ainda não partilhaste nenhum recurso" : "Este utilizador ainda não partilhou recursos"}
            </p>
            {isOwnProfile && (
              <Button className="mt-4" asChild>
                <Link href="/upload">Carregar Recurso</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {userFiles.slice(0, 5).map((file) => (
            <Card key={file.id} className="border-border hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/browse/${file.id}`} className="hover:text-primary transition-colors">
                        <h4 className="font-medium text-foreground mb-1">{file.title}</h4>
                      </Link>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge variant="secondary" className="text-xs">
                          {file.subject}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(file.uploadedAt).toLocaleDateString("pt-PT")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {file.downloads}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          {file.rating.toFixed(1)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {file.views}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
