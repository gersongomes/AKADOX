import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Upload, Star } from "lucide-react"
import Link from "next/link"

export default function DashboardAluno() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif font-black text-3xl text-foreground mb-2">Dashboard do Aluno</h1>
          <p className="text-muted-foreground">Acesse conteúdos, partilhe conhecimento e acompanhe o seu progresso</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Explorar Conteúdos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Acesse materiais do seu curso e outras disciplinas</p>
              <Button asChild className="w-full">
                <Link href="/browse">Explorar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-secondary/20 hover:border-secondary/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-secondary" />
                Partilhar Material
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Partilhe os seus materiais (requer aprovação do orientador)
              </p>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/upload">Partilhar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-accent/20 hover:border-accent/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                Favoritos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Acesse os seus materiais favoritos</p>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/favoritos">Ver Favoritos</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
