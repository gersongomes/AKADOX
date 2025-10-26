import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Upload, Users, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function DashboardProfessor() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif font-black text-3xl text-foreground mb-2">Dashboard do Professor</h1>
          <p className="text-muted-foreground">
            Gerencie conteúdos, aprove materiais dos alunos e acompanhe a comunidade
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Explorar Conteúdos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Acesse todos os materiais disponíveis</p>
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
              <p className="text-sm text-muted-foreground mb-4">Partilhe materiais diretamente (sem aprovação)</p>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/upload">Partilhar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-accent/20 hover:border-accent/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                Aprovar Materiais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Revise e aprove materiais dos alunos</p>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/admin/aprovacao">Aprovar</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-muted/20 hover:border-muted/40 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                Gerir Alunos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Acompanhe os alunos orientados</p>
              <Button variant="outline" asChild className="w-full bg-transparent">
                <Link href="/professor/alunos">Ver Alunos</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
